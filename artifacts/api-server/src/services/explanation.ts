/**
 * Explanation service — uses the OpenAI LLM to generate bilingual
 * natural-language summaries of the deterministic ranking.
 *
 * RULES:
 * - The LLM ONLY explains; it NEVER changes the ranking or invents product facts.
 * - If the LLM fails, deterministic fallback explanations are returned.
 * - All product data passed to the LLM comes from the actual product fixtures.
 */

import { openai } from "@workspace/integrations-openai-ai-server";
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

  // Guard: only call LLM if key is available and not dummy
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!baseUrl) {
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

Category: ${category}
User preferences: ${prefsDesc}

Ranked results:
${rankedSummary}

Write two paragraphs — one in Japanese, one in English — explaining:
1. Why ${best.productName} (${bestProduct?.nameJa ?? ""}) is the top choice given the user's preferences
2. Key trade-offs between the products the user should know about
3. Any important cautions or data gaps

Rules:
- Base your explanation ONLY on the data above; do not invent facts
- Keep each paragraph to 3–4 sentences
- Be specific: mention actual values, not vague claims
- Japanese first, then English
- Separate with "---"
- Do not include headers or labels`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "You are a bilingual Japanese-English consumer product comparison assistant. You explain rankings clearly and factually.",
        },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    const parts = text.split("---");

    if (parts.length >= 2) {
      return {
        summaryJa: parts[0]!.trim(),
        summaryEn: parts[1]!.trim(),
        processingMode: "live",
      };
    }

    // Fallback if format is unexpected
    return {
      summaryJa: text.trim(),
      summaryEn: text.trim(),
      processingMode: "live",
    };
  } catch (err) {
    logger.warn({ err }, "LLM explanation failed, using fallback");
    return buildFallback(rankedResults, products, category);
  }
}
