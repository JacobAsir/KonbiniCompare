import { Router } from "express";
import type { Request, Response } from "express";
import { CATEGORIES } from "../services/constants.js";
import { PRODUCTS, getProductById, searchProducts } from "../services/products.js";
import { searchOFF, lookupBarcode, getCachedProduct } from "../services/openfoodfacts.js";
import { mergePreferences, scoreProducts, buildComparisonTable } from "../ranking/engine.js";
import { generateExplanation } from "../services/explanation.js";
import type { Product, UserPreferences } from "../services/types.js";

const router = Router();

// GET /api/categories
router.get("/categories", (_req: Request, res: Response) => {
  res.json({ categories: CATEGORIES });
});

// GET /api/products?category=drinks
router.get("/products", (req: Request, res: Response) => {
  const { category } = req.query as { category?: string };
  const products = category
    ? PRODUCTS.filter((p) => p.category === category)
    : PRODUCTS;
  res.json({ products, total: products.length });
});

// GET /api/search?q=coffee
router.get("/search", async (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  if (!q || q.trim().length === 0) {
    res.json({ products: [], total: 0 });
    return;
  }

  // Search local demo products first
  const localResults = searchProducts(q, 5);

  // Search Open Food Facts for real products
  let offResults: Product[] = [];
  try {
    offResults = await searchOFF(q, 10);
  } catch {
    // OFF search failed, continue with local only
  }

  // Combine: local first, then OFF results (deduplicated by name similarity)
  const combined = [...localResults];
  const localNames = new Set(localResults.map((p) => p.name.toLowerCase()));

  for (const offProduct of offResults) {
    // Skip if we already have something with a very similar name
    const offNameLower = offProduct.name.toLowerCase();
    const isDuplicate = [...localNames].some(
      (name) => name.includes(offNameLower) || offNameLower.includes(name)
    );
    if (!isDuplicate) {
      combined.push(offProduct);
      localNames.add(offNameLower);
    }
    if (combined.length >= 12) break;
  }

  res.json({ products: combined, total: combined.length });
});

// GET /api/barcode/:code — Look up a product by barcode
router.get("/barcode/:code", async (req: Request, res: Response) => {
  const { code } = req.params;
  if (!code || code.length < 8) {
    res.status(400).json({ error: "Invalid barcode" });
    return;
  }

  const product = await lookupBarcode(code);
  if (!product) {
    res.status(404).json({ error: "Product not found", barcode: code });
    return;
  }

  res.json({ product });
});

// Profile presets → preference weights mapping
const PROFILE_PRESETS: Record<string, Partial<UserPreferences>> = {
  budget: {
    budgetSensitivity: 0.9,
    valueForMoney: 0.8,
    nutritionPriority: 0.3,
    caffeineSensitivity: 0.2,
    ingredientSimplicity: 0.2,
    proteinPriority: 0.2,
    sugarAvoidance: 0.2,
    skinSensitivity: 0.3,
    convenience: 0.4,
  },
  health: {
    budgetSensitivity: 0.3,
    valueForMoney: 0.4,
    nutritionPriority: 0.9,
    caffeineSensitivity: 0.5,
    ingredientSimplicity: 0.7,
    proteinPriority: 0.7,
    sugarAvoidance: 0.8,
    skinSensitivity: 0.7,
    convenience: 0.3,
  },
  clean: {
    budgetSensitivity: 0.3,
    valueForMoney: 0.3,
    nutritionPriority: 0.5,
    caffeineSensitivity: 0.4,
    ingredientSimplicity: 0.95,
    proteinPriority: 0.3,
    sugarAvoidance: 0.5,
    skinSensitivity: 0.8,
    convenience: 0.3,
  },
  balanced: {
    budgetSensitivity: 0.5,
    valueForMoney: 0.5,
    nutritionPriority: 0.5,
    caffeineSensitivity: 0.3,
    ingredientSimplicity: 0.5,
    proteinPriority: 0.4,
    sugarAvoidance: 0.4,
    skinSensitivity: 0.5,
    convenience: 0.5,
  },
};

// POST /api/quick-compare
router.post("/quick-compare", async (req: Request, res: Response) => {
  const { productIds, profile, allergens } = req.body as {
    productIds?: unknown[];
    profile?: string;
    allergens?: string[];
  };

  if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 5) {
    res.status(400).json({ error: "productIds must be an array of 2-5 product IDs" });
    return;
  }

  // Resolve products from both local DB and OFF cache
  const products: Product[] = [];
  for (const id of productIds) {
    const idStr = String(id);
    // Try local first
    const local = getProductById(idStr);
    if (local) {
      products.push(local);
      continue;
    }
    // Try OFF cache
    const offCached = getCachedProduct(idStr);
    if (offCached) {
      products.push(offCached);
      continue;
    }
    // Try barcode lookup as last resort
    if (idStr.startsWith("off-")) {
      const barcode = idStr.replace("off-", "");
      const offProduct = await lookupBarcode(barcode);
      if (offProduct) {
        products.push(offProduct);
      }
    }
  }

  if (products.length < 2) {
    res.status(400).json({ error: "At least 2 valid product IDs are required" });
    return;
  }

  const category = products[0]!.category;
  const profileWeights = PROFILE_PRESETS[profile ?? "balanced"] ?? PROFILE_PRESETS["balanced"]!;
  const preferences = mergePreferences({
    ...profileWeights,
    allergenConcerns: allergens ?? [],
  });

  const rankedResults = scoreProducts(products, preferences);
  const comparisonTable = buildComparisonTable(products);
  const best = rankedResults[0]!;

  const { summaryJa, summaryEn, processingMode } = await generateExplanation({
    category,
    rankedResults,
    products,
    preferences,
  });

  res.json({
    category,
    products,
    rankedResults,
    bestMatch: best.productName,
    summaryJa,
    summaryEn,
    comparisonTable,
    processingMode,
    preferences,
    profile: profile ?? "balanced",
  });
});

// POST /api/compare-products
router.post("/compare-products", async (req: Request, res: Response) => {
  const { category, productIds, preferences: prefInput } = req.body as {
    category?: string;
    productIds?: unknown[];
    preferences?: Record<string, unknown>;
  };

  if (!category || typeof category !== "string") {
    res.status(400).json({ error: "category is required" });
    return;
  }

  if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 5) {
    res.status(400).json({ error: "productIds must be an array of 2-5 product IDs" });
    return;
  }

  const products = productIds
    .map((id) => getProductById(String(id)))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  if (products.length < 2) {
    res.status(400).json({ error: "At least 2 valid product IDs are required" });
    return;
  }

  const preferences = mergePreferences(
    (prefInput as Parameters<typeof mergePreferences>[0]) ?? {}
  );

  const rankedResults = scoreProducts(products, preferences);
  const comparisonTable = buildComparisonTable(products);
  const best = rankedResults[0]!;

  const { summaryJa, summaryEn, processingMode } = await generateExplanation({
    category,
    rankedResults,
    products,
    preferences,
  });

  res.json({
    category,
    products,
    rankedResults,
    bestMatch: best.productName,
    summaryJa,
    summaryEn,
    comparisonTable,
    processingMode,
    preferences,
  });
});

export default router;
