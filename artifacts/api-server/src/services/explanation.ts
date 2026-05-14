/**
 * Explanation service — uses the OpenAI LLM to generate bilingual
 * natural-language summaries of the deterministic ranking.
 *
 * RULES:
 * - The LLM ONLY explains; it NEVER changes the ranking or invents product facts.
 * - If the LLM fails, deterministic fallback explanations are returned.
 * - All product data passed to the LLM comes from the actual product fixtures.
 */

import { groq, GROQ_LLAMA_MODEL } from "@workspace/integrations-groq-server";
import type { Product, RankedResult, UserPreferences } from "./types.js";
import { logger } from "../lib/logger.js";

interface ExplanationInput {
  category: string;
  rankedResults: RankedResult[];
  products: Product[];
  preferences: UserPreferences;
}

interface ExplanationOutput {
  summaryJa: string;
  summaryEn: string;
  processingMode: "live" | "fallback";
}

function buildFallback(
  rankedResults: RankedResult[],
  products: Product[],
  category: string
): ExplanationOutput {
  const best = rankedResults[0]!;
  const productMap = new Map(products.map((p) => [p.id, p]));
  const bestProduct = productMap.get(best.productId)!;

  const strengthList = best.strengths.join(", ") || "good overall balance";

  const summaryEn = [
    `Based on your preferences, ${best.productName} is the best match in the ${category} category (score: ${(best.score * 100).toFixed(0)}%).`,
    `Key strengths: ${strengthList}.`,
    best.tradeoffs.length > 0
      ? `Consider: ${best.tradeoffs.join("; ")}.`
      : "",
    best.missingFields.length > 0
      ? `Note: some data was unavailable (${best.missingFields.join(", ")}), which may affect accuracy.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const summaryJa = [
    `あなたの設定に基づくと、${category}カテゴリで最もおすすめなのは「${bestProduct.nameJa ?? best.productName}」です（スコア: ${(best.score * 100).toFixed(0)}%）。`,
    `主な強み: ${strengthList}。`,
    best.tradeoffs.length > 0
      ? `検討点: ${best.tradeoffs.join("、")}。`
      : "",
    best.missingFields.length > 0
      ? `一部データが不足しているため（${best.missingFields.join("、")}）、精度に影響が出る可能性があります。`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { summaryJa, summaryEn, processingMode: "fallback" };
}

export async function generateExplanation(
  input: ExplanationInput
): Promise<ExplanationOutput> {
  const { category, rankedResults, products, preferences } = input;

  // Guard: only call LLM if key is available
  if (!process.env.GROQ_API_KEY) {
    logger.info("GROQ_API_KEY not found, using fallback");
    return buildFallback(rankedResults, products, category);
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const best = rankedResults[0]!;
  const bestProduct = productMap.get(best.productId);

  const rankedSummary = rankedResults
    .map((r) => {
      const p = productMap.get(r.productId);
      return `#${r.rank} ${r.productName} (${p?.nameJa ?? ""}) — score: ${(r.score * 100).toFixed(1)}%\n  Strengths: ${r.strengths.join(", ") || "none"}\n  Tradeoffs: ${r.tradeoffs.join(", ") || "none"}\n  Cautions: ${r.cautions.join(", ") || "none"}\n  Missing data: ${r.missingFields.join(", ") || "none"}`;
    })
    .join("\n\n");

  const prefsDesc = [
    `Budget sensitivity: ${preferences.budgetSensitivity}`,
    `Nutrition priority: ${preferences.nutritionPriority}`,
    `Caffeine sensitivity: ${preferences.caffeineSensitivity}`,
    `Allergen concerns: ${preferences.allergenConcerns.join(", ") || "none"}`,
    `Value for money: ${preferences.valueForMoney}`,
    `Ingredient simplicity: ${preferences.ingredientSimplicity}`,
    `Skin sensitivity: ${preferences.skinSensitivity}`,
    `Protein priority: ${preferences.proteinPriority}`,
    `Sugar avoidance: ${preferences.sugarAvoidance}`,
  ].join("; ");

  const prompt = `You are a bilingual Japanese-English product comparison assistant for KonbiniCompare.

The ranking below was produced by a DETERMINISTIC scoring engine — do NOT change the ranking. Your ONLY job is to write a brief, factual explanation of WHY these products ranked as they did, based solely on the data provided.

IMPORTANT RULES:
- Distinguish between "Score" (0-100%) and "Content" (grams/mg). 
- A Score of 100% on a dimension like Protein means the product is the BEST in this set, but if the value is 0g, do NOT call it "High Protein". Say "No protein" or "Contains no protein".
- Similarly for Sugar: a 100% Score means LOW sugar. Do NOT say "High Sugar" if the score is high.
- If the calorie count is low (e.g. < 100), call it "Low calorie".
- Do NOT invent nutritional facts. If data is missing (NaN/null), mention it as a data gap.

Category: ${category}
User preferences: ${prefsDesc}

Ranked results:
${rankedSummary}

Write two paragraphs — one in Japanese, one in English — explaining:
1. Why ${best.productName} (${bestProduct?.nameJa ?? ""}) is the top choice given the user's preferences
2. Key trade-offs between the products the user should know about (e.g. if one has much more sugar than the other)
3. Any important cautions or data gaps

Rules:
- Base your explanation ONLY on the data above; do not invent facts
- Keep each paragraph to 3–4 sentences
- Be specific: mention actual values (e.g. "contains 31g of sugar"), not just vague scores
- Japanese first, then English
- Separate with "---"
- Do not include headers or labels`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_LLAMA_MODEL,
      temperature: 0.2,
      max_tokens: 1024,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    const parts = text.split("---");

    if (parts.length >= 2) {
      return {
        summaryJa: parts[0]!.trim(),
        summaryEn: parts[1]!.trim(),
        processingMode: "live",
      };
    }

    return {
      summaryJa: text.trim(),
      summaryEn: text.trim(),
      processingMode: "live",
    };
  } catch (err) {
    logger.warn({ err }, "Groq explanation failed, using fallback");
    return buildFallback(rankedResults, products, category);
  }
}
