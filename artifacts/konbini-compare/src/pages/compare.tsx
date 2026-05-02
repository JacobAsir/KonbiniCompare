import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetCategories,
  useGetDemoProducts,
  useCompareProducts,
  type UserPreferences,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompareResult } from "@/lib/CompareContext";

const STEPS = ["Category", "Products", "Preferences", "Compare"] as const;

type Step = 0 | 1 | 2 | 3;

const PREF_LABELS: { key: keyof UserPreferences; label: string; labelJa: string; description: string }[] = [
  { key: "budgetSensitivity", label: "Budget Sensitivity", labelJa: "予算重視", description: "How important is price?" },
  { key: "nutritionPriority", label: "Nutrition Priority", labelJa: "栄養重視", description: "How much does nutritional quality matter?" },
  { key: "caffeineSensitivity", label: "Caffeine Sensitivity", labelJa: "カフェイン感度", description: "Prefer lower caffeine options?" },
  { key: "valueForMoney", label: "Value for Money", labelJa: "コスパ重視", description: "Prefer more volume/weight per yen?" },
  { key: "ingredientSimplicity", label: "Ingredient Simplicity", labelJa: "成分シンプル重視", description: "Prefer fewer additives?" },
  { key: "proteinPriority", label: "Protein Priority", labelJa: "たんぱく質重視", description: "How important is protein content?" },
  { key: "sugarAvoidance", label: "Sugar Avoidance", labelJa: "低糖質重視", description: "Prefer lower sugar options?" },
  { key: "skinSensitivity", label: "Skin Sensitivity", labelJa: "肌敏感度", description: "Prefer gentle, low-irritation skincare?" },
  { key: "convenience", label: "Convenience", labelJa: "携帯性重視", description: "Prefer single-serve or portable options?" },
];

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

export default function Compare() {
  const [, navigate] = useLocation();
  const { setResult } = useCompareResult();

  const [step, setStep] = useState<Step>(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [allergenInput, setAllergenInput] = useState("");

  const { data: categoriesData, isLoading: catLoading } = useGetCategories();
  const { data: productsData, isLoading: prodLoading } = useGetDemoProducts(
    { category: selectedCategory },
    { query: { enabled: !!selectedCategory } }
  );

  const compareProducts = useCompareProducts();

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : prev.length < 5
        ? [...prev, id]
        : prev
    );
  };

  const setPref = (key: keyof UserPreferences, value: number) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const result = await compareProducts.mutateAsync({
      data: {
        category: selectedCategory,
        productIds: selectedProductIds,
        preferences,
      },
    });
    setResult(result);
    navigate("/result");
  };

  const canProceed =
    step === 0
      ? !!selectedCategory
      : step === 1
      ? selectedProductIds.length >= 2
      : step === 2
      ? true
      : false;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 transition-colors ${
                i < step
                  ? "bg-accent text-accent-foreground border-accent"
                  : i === step
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-muted"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-accent" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Category */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Category</CardTitle>
            <p className="text-sm text-muted-foreground">カテゴリを選択してください</p>
          </CardHeader>
          <CardContent>
            {catLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoriesData?.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedProductIds([]);
                    }}
                    className={`p-4 rounded-lg border-2 text-center transition-all space-y-2 hover:border-primary/70 ${
                      selectedCategory === cat.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="text-3xl">{cat.icon}</div>
                    <div className="font-semibold text-sm">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">{cat.nameJa}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: Products */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Pick 2–5 Products</CardTitle>
            <p className="text-sm text-muted-foreground">
              比較する商品を2〜5品選んでください
              <span className="ml-2 text-primary font-medium">
                {selectedProductIds.length}/5 selected
              </span>
            </p>
          </CardHeader>
          <CardContent>
            {prodLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {productsData?.products.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const isDisabled = !isSelected && selectedProductIds.length >= 5;
                  return (
                    <label
                      key={product.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : isDisabled
                          ? "border-border opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => toggleProduct(product.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{product.name}</div>
                        {product.nameJa && (
                          <div className="text-xs text-muted-foreground">{product.nameJa}</div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.priceJpy && (
                            <Badge variant="outline" className="text-xs">¥{product.priceJpy}</Badge>
                          )}
                          {product.store && (
                            <Badge variant="secondary" className="text-xs">{product.store}</Badge>
                          )}
                          {product.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Set Your Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">優先したい項目を設定してください (0 = 重視しない, 1 = 最重視)</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {PREF_LABELS.map(({ key, label, labelJa, description }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{labelJa}</span>
                  </div>
                  <span className="text-sm font-mono text-primary">
                    {(preferences[key] as number).toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[preferences[key] as number]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([v]) => setPref(key, v!)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            ))}

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-sm font-medium">
                Allergen Concerns <span className="text-muted-foreground text-xs ml-1">アレルゲン懸念</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={allergenInput}
                  onChange={(e) => setAllergenInput(e.target.value)}
                  placeholder="e.g. gluten, dairy, nuts"
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && allergenInput.trim()) {
                      setPreferences((prev) => ({
                        ...prev,
                        allergenConcerns: [...(prev.allergenConcerns ?? []), allergenInput.trim()],
                      }));
                      setAllergenInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (allergenInput.trim()) {
                      setPreferences((prev) => ({
                        ...prev,
                        allergenConcerns: [...(prev.allergenConcerns ?? []), allergenInput.trim()],
                      }));
                      setAllergenInput("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(preferences.allergenConcerns ?? []).map((a) => (
                  <Badge
                    key={a}
                    variant="destructive"
                    className="cursor-pointer text-xs"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        allergenConcerns: (prev.allergenConcerns ?? []).filter((x) => x !== a),
                      }))
                    }
                  >
                    {a} x
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < 2 ? (
          <Button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={!canProceed}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={compareProducts.isPending}
            className="min-w-32"
          >
            {compareProducts.isPending ? "Comparing..." : "Compare Now"}
          </Button>
        )}
      </div>

      {compareProducts.isError && (
        <p className="text-destructive text-sm text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
