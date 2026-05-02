import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCompareResult } from "@/lib/CompareContext";
import type { RankedResult, Product } from "@workspace/api-client-react";

function MissingBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground border border-muted-foreground/30">
      データ不足 / Incomplete
    </span>
  );
}

function ScoreBar({ label, labelJa, value }: { label: string; labelJa: string; value: number | null | undefined }) {
  if (value === null || value === undefined) return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <MissingBadge />
    </div>
  );
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label} <span className="text-muted-foreground/60">{labelJa}</span></span>
        <span className="font-mono text-foreground">{pct}%</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

const BREAKDOWN_LABELS: { key: keyof NonNullable<RankedResult["scoreBreakdown"]>; label: string; labelJa: string }[] = [
  { key: "price", label: "Price", labelJa: "価格" },
  { key: "valueForMoney", label: "Value/ml", labelJa: "コスパ" },
  { key: "caffeine", label: "Caffeine", labelJa: "カフェイン" },
  { key: "calories", label: "Calories", labelJa: "カロリー" },
  { key: "sugar", label: "Sugar", labelJa: "糖分" },
  { key: "protein", label: "Protein", labelJa: "たんぱく質" },
  { key: "additives", label: "Additives", labelJa: "添加物" },
  { key: "allergenSafety", label: "Allergen Safety", labelJa: "アレルゲン安全性" },
  { key: "skinSafety", label: "Skin Safety", labelJa: "肌安全性" },
  { key: "convenience", label: "Convenience", labelJa: "携帯性" },
];

function ProductCard({ result, product }: { result: RankedResult; product: Product | undefined }) {
  const scorePercent = Math.round(result.score * 100);
  return (
    <Card className={`relative ${result.isBestMatch ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border"}`}>
      {result.isBestMatch && (
        <div className="absolute -top-3 left-4">
          <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
            おすすめ Best Match
          </Badge>
        </div>
      )}
      <CardHeader className="pb-2 pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-muted-foreground">#{result.rank}</span>
              <CardTitle className="text-base leading-tight">{result.productName}</CardTitle>
            </div>
            {product?.nameJa && (
              <p className="text-xs text-muted-foreground mt-0.5">{product.nameJa}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-primary">{scorePercent}<span className="text-sm text-muted-foreground">%</span></div>
            <div className="text-xs text-muted-foreground">overall</div>
          </div>
        </div>
        <Progress value={scorePercent} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score breakdown */}
        <div className="space-y-1.5">
          {BREAKDOWN_LABELS.map(({ key, label, labelJa }) => {
            const val = result.scoreBreakdown?.[key];
            if (val === null || val === undefined) return null;
            return (
              <ScoreBar key={key} label={label} labelJa={labelJa} value={val} />
            );
          })}
        </div>

        {/* Strengths */}
        {result.strengths.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-accent mb-1">Strengths / 強み</div>
            <div className="flex flex-wrap gap-1">
              {result.strengths.map((s) => (
                <Badge key={s} variant="outline" className="text-xs border-accent/30 text-accent bg-accent/5">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tradeoffs */}
        {result.tradeoffs.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">Trade-offs / 検討点</div>
            <div className="flex flex-wrap gap-1">
              {result.tradeoffs.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cautions */}
        {result.cautions.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-destructive mb-1">Cautions / 注意点</div>
            <div className="flex flex-wrap gap-1">
              {result.cautions.map((c) => (
                <Badge key={c} variant="destructive" className="text-xs opacity-80">{c}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Missing data */}
        {result.missingFields.length > 0 && (
          <div className="text-xs text-muted-foreground border border-muted rounded p-2 bg-muted/30">
            <span className="font-medium">Missing data / 不足データ: </span>
            {result.missingFields.join(", ")}
          </div>
        )}

        {/* Product details */}
        {product && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-border">
            {product.priceJpy && <Badge variant="outline" className="text-xs">¥{product.priceJpy}</Badge>}
            {product.volumeMl && <Badge variant="outline" className="text-xs">{product.volumeMl}ml</Badge>}
            {product.weightG && <Badge variant="outline" className="text-xs">{product.weightG}g</Badge>}
            {product.store && <Badge variant="secondary" className="text-xs">{product.store}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Result() {
  const [, navigate] = useLocation();
  const { result } = useCompareResult();

  if (!result) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <p className="text-muted-foreground">No comparison results yet.</p>
        <Button onClick={() => navigate("/compare")}>Start a Comparison</Button>
      </div>
    );
  }

  const productMap = new Map(result.products.map((p) => [p.id, p]));
  const modeLabel = result.processingMode === "live" ? "AI-powered" : result.processingMode === "fallback" ? "Offline mode" : "Demo mode";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comparison Results</h1>
          <p className="text-sm text-muted-foreground">
            {result.rankedResults.length} products ranked in {result.category} &bull;{" "}
            <span className="text-xs">{modeLabel}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/compare")}>
          New Comparison
        </Button>
      </div>

      {/* Bilingual summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Summary / 日本語まとめ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{result.summaryJa}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Summary / English</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{result.summaryEn}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranked products */}
      <div className="space-y-4">
        {result.rankedResults.map((r) => (
          <ProductCard
            key={r.productId}
            result={r}
            product={productMap.get(r.productId)}
          />
        ))}
      </div>

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparison Table / 比較表</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium w-28">Field</th>
                {result.products.map((p) => (
                  <th key={p.id} className="text-left py-1.5 px-2 font-medium text-xs max-w-32">
                    <div className="truncate">{p.name.split(" ").slice(0, 3).join(" ")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.comparisonTable as Record<string, Record<string, string | number | null>>).map(([field, values]) => (
                <tr key={field} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-1.5 pr-3 text-muted-foreground font-medium capitalize">
                    {field.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </td>
                  {result.products.map((p) => {
                    const val = values[p.id];
                    return (
                      <td key={p.id} className="py-1.5 px-2 max-w-32">
                        {val === null || val === undefined ? (
                          <span className="text-muted-foreground/40">—</span>
                        ) : (
                          <span className="text-foreground">{String(val)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/demo")}>Try a Demo Scenario</Button>
        <Button onClick={() => navigate("/compare")}>Compare Again</Button>
      </div>
    </div>
  );
}
