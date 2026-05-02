import type { Category, DemoScenario } from "./types.js";

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

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "scenario-caffeine-conscious",
    title: "Caffeine-Conscious Coffee vs Tea",
    titleJa: "カフェイン控えめ: コーヒー vs お茶比較",
    description:
      "Compare popular convenience store drinks for users who are sensitive to caffeine",
    category: "drinks",
    productIds: ["drink-001", "drink-002", "drink-005", "drink-006"],
    preferences: {
      caffeineSensitivity: 0.9,
      budgetSensitivity: 0.4,
      sugarAvoidance: 0.5,
    },
  },
  {
    id: "scenario-sports-drinks",
    title: "Sports Drink Showdown",
    titleJa: "スポーツドリンク対決",
    description:
      "Zero-calorie and electrolyte drinks — which is best for your workout?",
    category: "drinks",
    productIds: ["drink-003", "drink-004", "drink-007"],
    preferences: {
      budgetSensitivity: 0.5,
      sugarAvoidance: 0.8,
      nutritionPriority: 0.7,
    },
  },
  {
    id: "scenario-high-protein-snacks",
    title: "High-Protein Convenience Snacks",
    titleJa: "高タンパクなコンビニおやつ",
    description:
      "Best protein-rich snacks at 7-Eleven, FamilyMart, and Lawson",
    category: "snacks",
    productIds: ["snack-004", "snack-006", "snack-002"],
    preferences: {
      proteinPriority: 0.9,
      nutritionPriority: 0.8,
      budgetSensitivity: 0.3,
    },
  },
  {
    id: "scenario-sensitive-skincare",
    title: "Gentle Skincare for Sensitive Skin",
    titleJa: "敏感肌向けスキンケア比較",
    description:
      "Fragrance-free and alcohol-free options for sensitive skin types",
    category: "skincare",
    productIds: ["skin-001", "skin-003", "skin-004", "skin-007"],
    preferences: {
      skinSensitivity: 1.0,
      ingredientSimplicity: 0.8,
      budgetSensitivity: 0.3,
    },
  },
  {
    id: "scenario-budget-skincare",
    title: "Budget Sunscreen Comparison",
    titleJa: "コスパ最高の日焼け止め比較",
    description:
      "Compare SPF50+ sunscreens by price, volume, and skin compatibility",
    category: "skincare",
    productIds: ["skin-002", "skin-006", "house-004"],
    preferences: {
      budgetSensitivity: 0.9,
      valueForMoney: 0.9,
      skinSensitivity: 0.5,
    },
  },
  {
    id: "scenario-supplement-value",
    title: "Daily Supplement Value Check",
    titleJa: "デイリーサプリ コスパ比較",
    description:
      "Which supplement gives the best value per serving with minimal additives?",
    category: "supplements",
    productIds: ["supp-001", "supp-002", "supp-004", "supp-005"],
    preferences: {
      valueForMoney: 0.9,
      ingredientSimplicity: 0.8,
      budgetSensitivity: 0.7,
    },
  },
];
