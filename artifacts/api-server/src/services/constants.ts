import type { Category } from "./types.js";

export const CATEGORIES: Category[] = [
  {
    id: "drinks",
    name: "Drinks",
    nameJa: "飲み物",
    icon: "☕",
    scoringDimensions: [
      "price",
      "valueForMoney",
      "caffeine",
      "calories",
      "sugar",
      "additives",
      "allergenSafety",
      "convenience",
    ],
  },
  {
    id: "snacks",
    name: "Snacks",
    nameJa: "スナック・軽食",
    icon: "🍘",
    scoringDimensions: [
      "price",
      "valueForMoney",
      "calories",
      "sugar",
      "protein",
      "additives",
      "allergenSafety",
      "convenience",
    ],
  },
  {
    id: "supplements",
    name: "Supplements",
    nameJa: "サプリメント",
    icon: "💊",
    scoringDimensions: [
      "price",
      "valueForMoney",
      "additives",
      "allergenSafety",
    ],
  },
  {
    id: "skincare",
    name: "Skincare",
    nameJa: "スキンケア",
    icon: "✨",
    scoringDimensions: [
      "price",
      "valueForMoney",
      "skinSafety",
      "additives",
      "allergenSafety",
      "convenience",
    ],
  },
  {
    id: "household",
    name: "Household",
    nameJa: "日用品",
    icon: "🏠",
    scoringDimensions: ["price", "valueForMoney", "convenience", "additives"],
  },
];

