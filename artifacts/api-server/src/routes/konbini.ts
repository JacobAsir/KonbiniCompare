import { Router } from "express";
import type { Request, Response } from "express";
import { CATEGORIES, DEMO_SCENARIOS } from "../services/categories.js";
import { DEMO_PRODUCTS, getProductById } from "../services/fixtures.js";
import { mergePreferences, scoreProducts, buildComparisonTable } from "../ranking/engine.js";
import { generateExplanation } from "../services/explanation.js";

const router = Router();

// GET /api/categories
router.get("/categories", (_req: Request, res: Response) => {
  res.json({ categories: CATEGORIES });
});

// GET /api/demo-products?category=drinks
router.get("/demo-products", (req: Request, res: Response) => {
  const { category } = req.query as { category?: string };
  const products = category
    ? DEMO_PRODUCTS.filter((p) => p.category === category)
    : DEMO_PRODUCTS;
  res.json({ products, total: products.length });
});

// GET /api/demo-scenarios
router.get("/demo-scenarios", (_req: Request, res: Response) => {
  res.json({ scenarios: DEMO_SCENARIOS });
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
