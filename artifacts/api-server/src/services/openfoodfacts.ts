/**
 * Open Food Facts API integration.
 *
 * Fetches real product data from the Open Food Facts database and converts
 * it into our internal Product format for scoring.
 *
 * API docs: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
 * Data license: Open Database License (ODbL)
 */

import type { Product, ProductNutrition } from "./types.js";
import { logger } from "../lib/logger.js";

const OFF_BASE_URL = "https://world.openfoodfacts.org";
const OFF_SEARCH_FIELDS = [
  "code",
  "product_name",
  "product_name_ja",
  "brands",
  "categories_tags",
  "stores",
  "quantity",
  "serving_quantity",
  "nutriments",
  "allergens_tags",
  "additives_tags",
  "image_front_small_url",
  "countries_tags",
  "labels_tags",
].join(",");

// User-Agent required by Open Food Facts API policy
const USER_AGENT = "KonbiniCompare/1.0 (https://github.com/konbinicompare)";

// In-memory product cache (keyed by barcode or OFF product code)
const productCache = new Map<string, Product>();

interface OFFNutriments {
  "energy-kcal_100g"?: number;
  "energy-kcal_serving"?: number;
  proteins_100g?: number;
  proteins_serving?: number;
  fat_100g?: number;
  fat_serving?: number;
  carbohydrates_100g?: number;
  carbohydrates_serving?: number;
  sugars_100g?: number;
  sugars_serving?: number;
  sodium_100g?: number;
  sodium_serving?: number;
  fiber_100g?: number;
  fiber_serving?: number;
  caffeine_100g?: number;
  caffeine_serving?: number;
  [key: string]: number | undefined;
}

interface OFFProduct {
  code?: string;
  product_name?: string;
  product_name_ja?: string;
  brands?: string;
  categories_tags?: string[];
  stores?: string;
  quantity?: string;
  serving_quantity?: number | string;
  nutriments?: OFFNutriments;
  allergens_tags?: string[];
  additives_tags?: string[];
  image_front_small_url?: string;
  countries_tags?: string[];
  labels_tags?: string[];
}

interface OFFSearchResponse {
  count: number;
  page: number;
  page_size: number;
  products: OFFProduct[];
}

interface OFFProductResponse {
  status: number;
  product?: OFFProduct;
}

/**
 * Detect category from OFF categories_tags
 */
function detectCategory(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "drinks";

  const joined = tags.join(" ").toLowerCase();

  if (joined.includes("beverage") || joined.includes("drink") || joined.includes("tea") || joined.includes("coffee") || joined.includes("juice") || joined.includes("water")) {
    return "drinks";
  }
  if (joined.includes("snack") || joined.includes("biscuit") || joined.includes("chip") || joined.includes("chocolate") || joined.includes("candy") || joined.includes("rice") || joined.includes("bread") || joined.includes("noodle") || joined.includes("meal")) {
    return "snacks";
  }
  if (joined.includes("supplement") || joined.includes("vitamin")) {
    return "supplements";
  }
  if (joined.includes("cosmetic") || joined.includes("skincare") || joined.includes("beauty") || joined.includes("cream") || joined.includes("lotion")) {
    return "skincare";
  }
  if (joined.includes("cleaning") || joined.includes("household") || joined.includes("shampoo") || joined.includes("soap") || joined.includes("detergent")) {
    return "household";
  }

  return "snacks"; // default for food items
}

/**
 * Parse volume from quantity string (e.g. "500 ml", "350ml", "1L")
 */
function parseVolumeMl(quantity: string | undefined): number | null {
  if (!quantity) return null;
  const match = quantity.match(/(\d+(?:\.\d+)?)\s*(ml|l|cl)/i);
  if (!match) return null;
  const value = parseFloat(match[1]!);
  const unit = match[2]!.toLowerCase();
  if (unit === "l") return value * 1000;
  if (unit === "cl") return value * 10;
  return value;
}

/**
 * Parse weight from quantity string (e.g. "100g", "250 g")
 */
function parseWeightG(quantity: string | undefined): number | null {
  if (!quantity) return null;
  const match = quantity.match(/(\d+(?:\.\d+)?)\s*(g|kg)/i);
  if (!match) return null;
  const value = parseFloat(match[1]!);
  const unit = match[2]!.toLowerCase();
  if (unit === "kg") return value * 1000;
  return value;
}

/**
 * Clean allergen tag from OFF format (e.g. "en:milk" → "milk")
 */
function cleanAllergenTag(tag: string): string {
  return tag.replace(/^[a-z]{2}:/, "").replace(/-/g, " ");
}

/**
 * Clean additive tag from OFF format (e.g. "en:e330" → "E330 (citric acid)")
 */
function cleanAdditiveTag(tag: string): string {
  return tag.replace(/^[a-z]{2}:/, "").replace(/-/g, " ");
}

/**
 * Convert an Open Food Facts product to our internal Product format
 */
function convertOFFProduct(off: OFFProduct): Product {
  const code = off.code ?? `off-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const nutriments = off.nutriments;

  // Prefer per-serving values, fall back to per-100g
  const nutrition: ProductNutrition | null = nutriments
    ? {
        calories: nutriments["energy-kcal_serving"] ?? nutriments["energy-kcal_100g"] ?? null,
        protein: nutriments.proteins_serving ?? nutriments.proteins_100g ?? null,
        fat: nutriments.fat_serving ?? nutriments.fat_100g ?? null,
        carbs: nutriments.carbohydrates_serving ?? nutriments.carbohydrates_100g ?? null,
        sugar: nutriments.sugars_serving ?? nutriments.sugars_100g ?? null,
        sodium: nutriments.sodium_serving != null
          ? Math.round(nutriments.sodium_serving * 1000) // convert g to mg
          : nutriments.sodium_100g != null
          ? Math.round(nutriments.sodium_100g * 1000)
          : null,
        caffeine: nutriments.caffeine_serving ?? nutriments.caffeine_100g ?? null,
        fiber: nutriments.fiber_serving ?? nutriments.fiber_100g ?? null,
      }
    : null;

  const product: Product = {
    id: `off-${code}`,
    name: off.product_name || `Product ${code}`,
    nameJa: off.product_name_ja || null,
    brand: off.brands || null,
    category: detectCategory(off.categories_tags),
    store: off.stores || null,
    priceJpy: null, // OFF doesn't have price data for Japan
    volumeMl: parseVolumeMl(off.quantity),
    weightG: parseWeightG(off.quantity),
    servings: off.serving_quantity ? Math.round(Number(off.serving_quantity)) || 1 : 1,
    nutrition,
    skincare: null,
    allergens: (off.allergens_tags ?? []).map(cleanAllergenTag),
    additives: (off.additives_tags ?? []).slice(0, 10).map(cleanAdditiveTag),
    tags: (off.categories_tags ?? []).slice(0, 5).map((t) => t.replace(/^[a-z]{2}:/, "").replace(/-/g, " ")),
    imageUrl: off.image_front_small_url || null,
  };

  // Cache it
  productCache.set(code, product);
  productCache.set(product.id, product);

  return product;
}

/**
 * Search products on Open Food Facts.
 * Prioritizes Japan-sold products but falls back to global.
 */
export async function searchOFF(query: string, limit = 10): Promise<Product[]> {
  try {
    // Search with Japan country filter first
    const url = new URL(`${OFF_BASE_URL}/cgi/search.pl`);
    url.searchParams.set("search_terms", query);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", String(limit));
    url.searchParams.set("fields", OFF_SEARCH_FIELDS);
    // Prefer products sold in Japan
    url.searchParams.set("tagtype_0", "countries");
    url.searchParams.set("tag_contains_0", "contains");
    url.searchParams.set("tag_0", "japan");

    const response = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, "OFF search failed, trying without country filter");
      // Retry without Japan filter
      return searchOFFGlobal(query, limit);
    }

    const data = (await response.json()) as OFFSearchResponse;

    if (data.products.length === 0) {
      // Fall back to global search
      return searchOFFGlobal(query, limit);
    }

    return data.products
      .filter((p) => p.product_name) // skip products without names
      .map(convertOFFProduct);
  } catch (err) {
    logger.warn({ err }, "OFF search error");
    return [];
  }
}

/**
 * Global search without country filter (fallback)
 */
async function searchOFFGlobal(query: string, limit = 10): Promise<Product[]> {
  try {
    const url = new URL(`${OFF_BASE_URL}/cgi/search.pl`);
    url.searchParams.set("search_terms", query);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", String(limit));
    url.searchParams.set("fields", OFF_SEARCH_FIELDS);

    const response = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as OFFSearchResponse;
    return data.products
      .filter((p) => p.product_name)
      .map(convertOFFProduct);
  } catch (err) {
    logger.warn({ err }, "OFF global search error");
    return [];
  }
}

/**
 * Look up a product by barcode on Open Food Facts.
 */
export async function lookupBarcode(barcode: string): Promise<Product | null> {
  // Check cache first
  const cached = productCache.get(`off-${barcode}`) ?? productCache.get(barcode);
  if (cached) return cached;

  try {
    const url = `${OFF_BASE_URL}/api/v2/product/${barcode}.json?fields=${OFF_SEARCH_FIELDS}`;
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as OFFProductResponse;
    if (data.status !== 1 || !data.product) return null;

    return convertOFFProduct(data.product);
  } catch (err) {
    logger.warn({ err, barcode }, "OFF barcode lookup error");
    return null;
  }
}

/**
 * Get a cached OFF product by its internal ID (off-{barcode})
 */
export function getCachedProduct(id: string): Product | undefined {
  return productCache.get(id);
}

/**
 * Get all cached products (for debugging)
 */
export function getCacheSize(): number {
  return productCache.size;
}
