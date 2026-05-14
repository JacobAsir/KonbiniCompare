import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCompareResult } from "@/lib/CompareContext";
import { useLang } from "@/lib/LanguageContext";
import { ArrowLeft, Trophy, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

interface RankedResult {
  rank: number;
  productId: string;
  productName: string;
  score: number;
  scoreBreakdown: Record<string, number | null>;
  strengths: string[];
  tradeoffs: string[];
  cautions: string[];
  missingFields: string[];
  isBestMatch: boolean;
}

interface Product {
  id: string;
  name: string;
  nameJa?: string | null;
  brand?: string | null;
  category: string;
  store?: string | null;
  priceJpy?: number | null;
  volumeMl?: number | null;
  weightG?: number | null;
  tags: string[];
  imageUrl?: string | null;
}

interface CompareResponse {
  category: string;
  products: Product[];
  rankedResults: RankedResult[];
  bestMatch: string;
  summaryJa: string;
  summaryEn: string;
  comparisonTable: Record<string, Record<string, string | number | null>>;
  processingMode: string;
  profile: string;
}

const DIMENSION_KEY_MAP: Record<string, TranslationKey> = {
  price: "dimPrice",
  valueForMoney: "dimValueForMoney",
  caffeine: "dimCaffeine",
  calories: "dimCalories",
  sugar: "dimSugar",
  protein: "dimProtein",
  additives: "dimAdditives",
  allergenSafety: "dimAllergenSafety",
  skinSafety: "dimSkinSafety",
  convenience: "dimConvenience",
};

export default function Result() {
  const [, navigate] = useLocation();
  const { selectedProducts, profile, allergens } = useCompareResult();
  const { lang, t } = useLang();
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!selectedProducts || selectedProducts.length < 2) {
      navigate("/");
      return;
    }

    setLoading(true);
    setError(null);

    const baseUrl = import.meta.env.VITE_API_URL || "";
    fetch(`${baseUrl}/api/quick-compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productIds: selectedProducts.map((p) => p.id),
        profile: profile ?? "balanced",
        allergens: allergens ?? [],
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Comparison failed");
        return res.json();
      })
      .then((data) => setResult(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedProducts, profile, allergens, navigate]);

  const displayName = (p: Product | undefined, fallback: string): string => {
    if (!p) return fallback;
    return lang === "ja" && p.nameJa ? p.nameJa : p.name;
  };
  const secondaryName = (p: Product | undefined): string | null => {
    if (!p) return null;
    return lang === "ja" ? p.name : p.nameJa ?? null;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
        <p className="text-muted-foreground text-sm mt-4">{t("comparingProducts")}</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <p className="text-destructive">{error ?? t("somethingWentWrong")}</p>
        <Button onClick={() => navigate("/")}>{t("tryAgain")}</Button>
      </div>
    );
  }

  const winner = result.rankedResults[0]!;
  const others = result.rankedResults.slice(1);
  const winnerProduct = result.products.find((p) => p.id === winner.productId);
  const scoreDiff = others.length > 0 ? Math.round((winner.score - others[0]!.score) * 100) : 0;
  const summary = lang === "ja" ? result.summaryJa : result.summaryEn;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> {t("newComparison")}
      </Button>

      <Card className="border-primary border-2 overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="h-5 w-5" />
            <span className="font-bold text-sm uppercase tracking-wide">{t("bestMatch")}</span>
          </div>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {winnerProduct?.imageUrl && (
                <img
                  src={winnerProduct.imageUrl}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{displayName(winnerProduct, winner.productName)}</h1>
                {secondaryName(winnerProduct) && (
                  <p className="text-muted-foreground mt-0.5">{secondaryName(winnerProduct)}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {winnerProduct?.brand && <Badge variant="outline">{winnerProduct.brand}</Badge>}
                  {winnerProduct?.priceJpy && <Badge variant="outline">¥{winnerProduct.priceJpy}</Badge>}
                  {winnerProduct?.store && <Badge variant="secondary">{winnerProduct.store}</Badge>}
                  {winnerProduct?.volumeMl && <Badge variant="outline">{winnerProduct.volumeMl}ml</Badge>}
                  {winnerProduct?.weightG && <Badge variant="outline">{winnerProduct.weightG}g</Badge>}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold text-primary">
                {Math.round(winner.score * 100)}%
              </div>
              {scoreDiff > 0 && (
                <p className="text-xs text-muted-foreground">{t("pointsAhead", scoreDiff)}</p>
              )}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">{summary}</p>
          </div>

          {winner.strengths.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {winner.strengths.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="border-green-300 text-green-700 bg-green-50 text-xs"
                >
                  ✓ {s}
                </Badge>
              ))}
            </div>
          )}

          {winner.cautions.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800">
                {winner.cautions.map((c, i) => (
                  <span key={c}>
                    {c}
                    {i < winner.cautions.length - 1 ? " • " : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {others.map((r) => {
        const product = result.products.find((p) => p.id === r.productId);
        return (
          <Card key={r.productId} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">#{r.rank}</span>
                    <span className="font-medium text-sm truncate">
                      {displayName(product, r.productName)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product?.priceJpy && <Badge variant="outline" className="text-xs">¥{product.priceJpy}</Badge>}
                    {product?.store && <Badge variant="secondary" className="text-xs">{product.store}</Badge>}
                  </div>
                  {r.tradeoffs.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {r.tradeoffs.slice(0, 2).join(" • ")}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-muted-foreground">
                    {Math.round(r.score * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showDetails ? t("hideDetails") : t("showDetails")}
      </button>

      {showDetails && (
        <div className="space-y-4 pb-8">
          {result.rankedResults.map((r) => {
            const product = result.products.find((p) => p.id === r.productId);
            const breakdown = r.scoreBreakdown;
            const dims = Object.entries(breakdown).filter(
              ([key, val]) => val !== null && key !== "missingDataPenalty"
            );
            return (
              <Card key={r.productId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">#{r.rank}</span>
                    {displayName(product, r.productName)}
                    <span className="ml-auto font-mono text-primary">
                      {Math.round(r.score * 100)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dims.map(([key, val]) => {
                    const transKey = DIMENSION_KEY_MAP[key];
                    const label = transKey ? t(transKey) : key;
                    return (
                      <div key={key} className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-mono">{Math.round((val as number) * 100)}%</span>
                        </div>
                        <Progress value={Math.round((val as number) * 100)} className="h-1.5" />
                      </div>
                    );
                  })}
                  {r.missingFields.length > 0 && (
                    <p className="text-xs text-muted-foreground pt-1">
                      {t("missingDataLabel", r.missingFields.join(", "))}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("sideBySide")}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium">Field</th>
                    {result.products.map((p) => (
                      <th key={p.id} className="text-left py-1.5 px-2 font-medium max-w-28">
                        <div className="truncate">
                          {displayName(p, p.name).split(" ").slice(0, 2).join(" ")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.comparisonTable).map(([field, values]) => (
                    <tr key={field} className="border-b border-border/50">
                      <td className="py-1.5 pr-3 text-muted-foreground capitalize">
                        {field.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </td>
                      {result.products.map((p) => (
                        <td key={p.id} className="py-1.5 px-2">
                          {values[p.id] == null ? (
                            <span className="text-muted-foreground/40">—</span>
                          ) : (
                            String(values[p.id])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-3 pb-8">
        <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
          {t("compareSomethingElse")}
        </Button>
      </div>
    </div>
  );
}
