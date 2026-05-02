/**
 * Deterministic scoring engine for KonbiniCompare.
 *
 * RULES:
 * - The LLM NEVER decides ranking — only natural-language explanation.
 * - All scoring is based on explicit product fields and user preference weights.
 * - Missing values apply a configurable penalty — never hallucinated.
 * - Scores are in [0, 1]. Weights are user-controlled in [0, 1].
 * - The final weighted score is the sum of (dimension_score * weight) / sum(weights).
 */

import type {
  Product,
  UserPreferences,
  ScoreBreakdown,
  RankedResult,
} from "../services/types.js";

const DEFAULT_PREFS: UserPreferences = {
  budgetSensitivity: 0.5,
  nutritionPriority: 0.5,
  caffeineSensitivity: 0.3,
  allergenConcerns: [],
  ingredientSimplicity: 0.3,
  valueForMoney: 0.5,
  convenience: 0.3,
  skinSensitivity: 0.5,
  proteinPriority: 0.3,
  sugarAvoidance: 0.3,
};

export function mergePreferences(
  partial: Partial<UserPreferences> | undefined
): UserPreferences {
  return { ...DEFAULT_PREFS, ...(partial ?? {}) };
}

// ─── Normalisation helpers ────────────────────────────────────────────────────

/** Clamp a value to [0, 1]. */
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Normalise an array of raw values so the best product gets 1.0 and the worst
 * gets 0.0 (min–max scaling). Returns null for each position that has null input.
 * higherIsBetter: true → higher raw value → higher score.
 */
function minMaxNorm(
  values: (number | null)[],
  higherIsBetter: boolean
): (number | null)[] {
  const present = values.filter((v): v is number => v !== null);
  if (present.length === 0) return values.map(() => null);
  const min = Math.min(...present);
  const max = Math.max(...present);
  if (min === max) return values.map((v) => (v === null ? null : 1.0));
  return values.map((v) => {
    if (v === null) return null;
    const norm = (v - min) / (max - min);
    return higherIsBetter ? norm : 1 - norm;
  });
}

// ─── Per-dimension scorers ────────────────────────────────────────────────────

function scorePrices(
  products: Product[]
): (number | null)[] {
  return minMaxNorm(
    products.map((p) => p.priceJpy),
    false // lower price → higher score
  );
}

function scoreValueForMoney(
  products: Product[]
): (number | null)[] {
  // value = volume or weight / price; higher is better
  const values = products.map((p) => {
    if (!p.priceJpy) return null;
    const quantity = p.volumeMl ?? p.weightG ?? null;
    if (quantity === null) return null;
    return quantity / p.priceJpy;
  });
  return minMaxNorm(values, true);
}

function scoreCaffeine(
  products: Product[],
  sensitivity: number
): (number | null)[] {
  // sensitivity: 0 = don't care, 1 = strongly prefer low caffeine
  // score: higher caffeine → lower score when sensitivity is high
  const raw = products.map((p) => p.nutrition?.caffeine ?? null);
  const normed = minMaxNorm(raw, false); // lower caffeine → higher score
  // If sensitivity is low and product has 0 caffeine, still don't penalise
  return normed;
}

function scoreCalories(
  products: Product[]
): (number | null)[] {
  return minMaxNorm(
    products.map((p) => p.nutrition?.calories ?? null),
    false // fewer calories → higher score
  );
}

function scoreSugar(
  products: Product[]
): (number | null)[] {
  return minMaxNorm(
    products.map((p) => p.nutrition?.sugar ?? null),
    false // lower sugar → higher score
  );
}

function scoreProtein(
  products: Product[]
): (number | null)[] {
  return minMaxNorm(
    products.map((p) => p.nutrition?.protein ?? null),
    true // higher protein → higher score
  );
}

function scoreAdditives(
  products: Product[]
): (number | null)[] {
  // Fewer additives → higher score. Always has a value (empty array = 0).
  const counts = products.map((p) => p.additives.length);
  return minMaxNorm(counts, false);
}

function scoreAllergenSafety(
  products: Product[],
  allergenConcerns: string[]
): (number | null)[] {
  if (allergenConcerns.length === 0) return products.map(() => 1.0);
  return products.map((p) => {
    const conflicts = p.allergens.filter((a) =>
      allergenConcerns.some((c) => a.toLowerCase().includes(c.toLowerCase()))
    );
    return conflicts.length === 0 ? 1.0 : 0.0;
  });
}

function scoreSkinSafety(
  products: Product[]
): (number | null)[] {
  return products.map((p) => {
    if (!p.skincare) return null;
    const { irritationRisk, fragranceFree, alcoholFree } = p.skincare;
    let score = 0;
    if (irritationRisk === "low") score += 0.5;
    else if (irritationRisk === "medium") score += 0.25;
    // irritationRisk === "high" → 0
    if (fragranceFree) score += 0.25;
    if (alcoholFree) score += 0.25;
    return clamp01(score);
  });
}

function scoreConvenience(
  products: Product[]
): (number | null)[] {
  // Single-serve and small volume = more convenient
  return products.map((p) => {
    let score = 0.5; // baseline
    if (p.servings === 1) score += 0.3;
    const vol = p.volumeMl ?? p.weightG ?? null;
    if (vol !== null && vol <= 200) score += 0.2;
    return clamp01(score);
  });
}

// ─── Missing data analysis ────────────────────────────────────────────────────

function detectMissingFields(
  product: Product,
  category: string
): string[] {
  const missing: string[] = [];
  if (product.priceJpy === null) missing.push("priceJpy");
  if (category !== "skincare" && category !== "household") {
    if (product.nutrition === null) missing.push("nutrition");
    else {
      if (product.nutrition.calories === null) missing.push("calories");
      if (product.nutrition.sugar === null && category === "drinks")
        missing.push("sugar");
      if (product.nutrition.caffeine === null && category === "drinks")
        missing.push("caffeine");
      if (product.nutrition.protein === null && category === "snacks")
        missing.push("protein");
    }
  }
  if (category === "skincare" && product.skincare === null)
    missing.push("skincare");
  return missing;
}

// ─── Strength / tradeoff / caution generation ─────────────────────────────────

function generateStrengths(
  product: Product,
  breakdown: ScoreBreakdown,
  prefs: UserPreferences
): string[] {
  const s: string[] = [];
  if (breakdown.price !== null && breakdown.price >= 0.75)
    s.push("Competitively priced");
  if (breakdown.valueForMoney !== null && breakdown.valueForMoney >= 0.75)
    s.push("Great value per ml/g");
  if (
    product.nutrition?.caffeine === 0 ||
    product.nutrition?.caffeine === null &&
    prefs.caffeineSensitivity < 0.3
  ) {
    // skip
  } else if (
    breakdown.caffeine !== null &&
    breakdown.caffeine >= 0.75 &&
    prefs.caffeineSensitivity >= 0.5
  ) {
    s.push("Low caffeine — suitable for caffeine-sensitive users");
  }
  if (breakdown.calories !== null && breakdown.calories >= 0.8)
    s.push("Low calorie");
  if (breakdown.sugar !== null && breakdown.sugar >= 0.8)
    s.push("Low sugar");
  if (breakdown.protein !== null && breakdown.protein >= 0.75)
    s.push("High protein");
  if (breakdown.additives !== null && breakdown.additives >= 0.8)
    s.push("Minimal additives");
  if (breakdown.allergenSafety !== null && breakdown.allergenSafety >= 1.0 && prefs.allergenConcerns.length > 0)
    s.push("No allergen conflicts with your concerns");
  if (breakdown.skinSafety !== null && breakdown.skinSafety >= 0.75)
    s.push("Gentle formula — low irritation risk");
  if (product.skincare?.fragranceFree) s.push("Fragrance-free");
  if (product.skincare?.alcoholFree) s.push("Alcohol-free");
  return s.slice(0, 4);
}

function generateTradeoffs(
  product: Product,
  breakdown: ScoreBreakdown,
  prefs: UserPreferences
): string[] {
  const t: string[] = [];
  if (breakdown.price !== null && breakdown.price <= 0.3)
    t.push("Higher price point");
  if (breakdown.sugar !== null && breakdown.sugar <= 0.3)
    t.push("High sugar content");
  if (breakdown.calories !== null && breakdown.calories <= 0.3)
    t.push("Higher calorie count");
  if (breakdown.caffeine !== null && breakdown.caffeine <= 0.3 && prefs.caffeineSensitivity >= 0.6)
    t.push("High caffeine — may not suit sensitive users");
  if (breakdown.additives !== null && breakdown.additives <= 0.3)
    t.push("Contains multiple additives");
  if (breakdown.protein !== null && breakdown.protein <= 0.3 && prefs.proteinPriority >= 0.6)
    t.push("Low protein");
  if (breakdown.skinSafety !== null && breakdown.skinSafety <= 0.4)
    t.push("Contains fragrance or alcohol — check for sensitivity");
  return t.slice(0, 3);
}

function generateCautions(
  product: Product,
  prefs: UserPreferences
): string[] {
  const c: string[] = [];
  if (prefs.allergenConcerns.length > 0) {
    const conflicts = product.allergens.filter((a) =>
      prefs.allergenConcerns.some((concern) =>
        a.toLowerCase().includes(concern.toLowerCase())
      )
    );
    if (conflicts.length > 0)
      c.push(`Contains allergens you flagged: ${conflicts.join(", ")}`);
  }
  if ((product.nutrition?.caffeine ?? 0) > 100)
    c.push("Very high caffeine (>100mg per serving)");
  if ((product.nutrition?.sodium ?? 0) > 600)
    c.push("High sodium content");
  if ((product.nutrition?.sugar ?? 0) > 30)
    c.push("High sugar — check daily intake");
  if (product.skincare?.irritationRisk === "high")
    c.push("High irritation risk — patch test recommended");
  return c.slice(0, 3);
}

// ─── Main scoring function ────────────────────────────────────────────────────

export interface ScoredProduct {
  product: Product;
  result: RankedResult;
}

export function scoreProducts(
  products: Product[],
  prefs: UserPreferences
): RankedResult[] {
  if (products.length === 0) return [];

  const category = products[0]!.category;

  // Compute per-dimension score arrays (normalised across all products)
  const priceScores = scorePrices(products);
  const valueScores = scoreValueForMoney(products);
  const caffeineScores = scoreCaffeine(products, prefs.caffeineSensitivity);
  const calorieScores = scoreCalories(products);
  const sugarScores = scoreSugar(products);
  const proteinScores = scoreProtein(products);
  const additiveScores = scoreAdditives(products);
  const allergenScores = scoreAllergenSafety(products, prefs.allergenConcerns);
  const skinSafetyScores = scoreSkinSafety(products);
  const convenienceScores = scoreConvenience(products);

  const results: RankedResult[] = products.map((product, i) => {
    const bd: ScoreBreakdown = {
      price: priceScores[i] ?? null,
      valueForMoney: valueScores[i] ?? null,
      caffeine: caffeineScores[i] ?? null,
      calories: calorieScores[i] ?? null,
      sugar: sugarScores[i] ?? null,
      protein: proteinScores[i] ?? null,
      additives: additiveScores[i] ?? null,
      allergenSafety: allergenScores[i] ?? null,
      skinSafety: skinSafetyScores[i] ?? null,
      convenience: convenienceScores[i] ?? null,
      missingDataPenalty: null,
    };

    // Build dimension-weight pairs (only include dimensions with non-null scores)
    const dims: { score: number; weight: number }[] = [];

    const add = (score: number | null, weight: number) => {
      if (score !== null) dims.push({ score, weight });
    };

    add(bd.price, prefs.budgetSensitivity);
    add(bd.valueForMoney, prefs.valueForMoney);
    add(bd.convenience, prefs.convenience);
    add(bd.additives, prefs.ingredientSimplicity);
    add(bd.allergenSafety, prefs.allergenConcerns.length > 0 ? 1.0 : 0);

    // Category-specific dimensions
    if (category === "drinks" || category === "snacks" || category === "supplements") {
      add(bd.caffeine, prefs.caffeineSensitivity);
      add(bd.calories, prefs.nutritionPriority * 0.5);
      add(bd.sugar, prefs.sugarAvoidance);
      add(bd.protein, prefs.proteinPriority);
    }

    if (category === "skincare" || category === "household") {
      add(bd.skinSafety, prefs.skinSensitivity);
    }

    // Weighted average
    const totalWeight = dims.reduce((s, d) => s + d.weight, 0);
    let weightedScore =
      totalWeight > 0
        ? dims.reduce((s, d) => s + d.score * d.weight, 0) / totalWeight
        : 0.5;

    // Missing data penalty
    const missing = detectMissingFields(product, category);
    const penalty = missing.length * 0.04;
    bd.missingDataPenalty = penalty > 0 ? -penalty : null;
    weightedScore = clamp01(weightedScore - penalty);

    const strengths = generateStrengths(product, bd, prefs);
    const tradeoffs = generateTradeoffs(product, bd, prefs);
    const cautions = generateCautions(product, prefs);

    return {
      rank: 0, // filled in after sort
      productId: product.id,
      productName: product.name,
      score: Math.round(weightedScore * 1000) / 1000,
      scoreBreakdown: bd,
      strengths,
      tradeoffs,
      cautions,
      missingFields: missing,
      isBestMatch: false, // filled in after sort
    };
  });

  // Sort descending by score, break ties by name (deterministic)
  results.sort((a, b) => b.score - a.score || a.productName.localeCompare(b.productName));

  // Assign ranks
  results.forEach((r, idx) => {
    r.rank = idx + 1;
    r.isBestMatch = idx === 0;
  });

  return results;
}

// ─── Comparison table ────────────────────────────────────────────────────────

export function buildComparisonTable(
  products: Product[]
): Record<string, unknown> {
  const table: Record<string, Record<string, string | number | null | boolean>> = {};
  const dims = [
    "priceJpy",
    "volumeMl",
    "weightG",
    "calories",
    "protein",
    "fat",
    "carbs",
    "sugar",
    "sodium",
    "caffeine",
    "fiber",
    "additives",
    "allergens",
    "store",
  ];
  for (const dim of dims) {
    table[dim] = {};
    for (const p of products) {
      let val: string | number | null | boolean = null;
      if (dim === "additives") val = p.additives.join(", ") || "None";
      else if (dim === "allergens") val = p.allergens.join(", ") || "None";
      else if (dim === "store") val = p.store;
      else if (dim === "priceJpy") val = p.priceJpy;
      else if (dim === "volumeMl") val = p.volumeMl;
      else if (dim === "weightG") val = p.weightG;
      else val = (p.nutrition as Record<string, number | null> | null)?.[dim] ?? null;
      table[dim][p.id] = val;
    }
  }
  return table;
}
