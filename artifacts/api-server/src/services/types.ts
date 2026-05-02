export interface ProductNutrition {
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  sugar: number | null;
  sodium: number | null;
  caffeine: number | null;
  fiber: number | null;
}

export interface ProductSkincare {
  spf: number | null;
  fragranceFree: boolean | null;
  alcoholFree: boolean | null;
  irritationRisk: "low" | "medium" | "high" | null;
  keyIngredients: string[];
}

export interface Product {
  id: string;
  name: string;
  nameJa: string | null;
  brand: string | null;
  category: string;
  store: string | null;
  priceJpy: number | null;
  volumeMl: number | null;
  weightG: number | null;
  servings: number | null;
  nutrition: ProductNutrition | null;
  skincare: ProductSkincare | null;
  allergens: string[];
  additives: string[];
  tags: string[];
  imageUrl?: string | null;
}

export interface UserPreferences {
  budgetSensitivity: number;
  nutritionPriority: number;
  caffeineSensitivity: number;
  allergenConcerns: string[];
  ingredientSimplicity: number;
  valueForMoney: number;
  convenience: number;
  skinSensitivity: number;
  proteinPriority: number;
  sugarAvoidance: number;
}

export interface ScoreBreakdown {
  price: number | null;
  valueForMoney: number | null;
  caffeine: number | null;
  calories: number | null;
  sugar: number | null;
  protein: number | null;
  additives: number | null;
  allergenSafety: number | null;
  skinSafety: number | null;
  convenience: number | null;
  missingDataPenalty: number | null;
}

export interface RankedResult {
  rank: number;
  productId: string;
  productName: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  strengths: string[];
  tradeoffs: string[];
  cautions: string[];
  missingFields: string[];
  isBestMatch: boolean;
}

export interface CompareProductsRequest {
  category: string;
  productIds: string[];
  preferences?: Partial<UserPreferences>;
}

export interface CompareProductsResult {
  category: string;
  products: Product[];
  rankedResults: RankedResult[];
  bestMatch: string;
  summaryJa: string;
  summaryEn: string;
  comparisonTable: Record<string, unknown>;
  processingMode: "mock" | "live" | "fallback";
  preferences: UserPreferences;
}

export interface Category {
  id: string;
  name: string;
  nameJa: string;
  icon: string;
  scoringDimensions: string[];
}

export interface DemoScenario {
  id: string;
  title: string;
  titleJa: string;
  description: string;
  category: string;
  productIds: string[];
  preferences: Partial<UserPreferences>;
}
