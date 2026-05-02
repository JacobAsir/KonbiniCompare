import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetDemoScenarios,
  useCompareProducts,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompareResult } from "@/lib/CompareContext";

const CATEGORY_ICONS: Record<string, string> = {
  drinks: "☕",
  snacks: "🍘",
  supplements: "💊",
  skincare: "✨",
  household: "🏠",
};

export default function Demo() {
  const [, navigate] = useLocation();
  const { setResult } = useCompareResult();
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useGetDemoScenarios();
  const compareProducts = useCompareProducts();

  const runScenario = async (scenarioId: string) => {
    const scenario = data?.scenarios.find((s) => s.id === scenarioId);
    if (!scenario || runningId) return;
    setRunningId(scenarioId);
    setError(null);
    try {
      const result = await compareProducts.mutateAsync({
        data: {
          category: scenario.category,
          productIds: scenario.productIds,
          preferences: scenario.preferences ?? {},
        },
      });
      setResult(result);
      navigate("/result");
    } catch {
      setError("Something went wrong. Please try again.");
      setRunningId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Demo Scenarios</h1>
        <p className="text-muted-foreground">
          デモシナリオ &mdash; Prebuilt comparisons you can run instantly to see how scoring works.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.scenarios.map((scenario) => {
            const isRunning =
              compareProducts.isPending &&
              compareProducts.variables?.category === scenario.category;
            return (
              <Card key={scenario.id} className="hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {CATEGORY_ICONS[scenario.category] ?? "?"}
                      </div>
                      <div>
                        <CardTitle className="text-base">{scenario.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{scenario.titleJa}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs capitalize">{scenario.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>

                  {/* Preference highlights */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(scenario.preferences ?? {}).map(([key, val]) => {
                      if (key === "allergenConcerns" || typeof val !== "number") return null;
                      if (val < 0.5) return null;
                      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                      return (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {label}: {val.toFixed(1)}
                        </Badge>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {scenario.productIds.length} products
                    </span>
                    <Button
                      size="sm"
                      onClick={() => runScenario(scenario.id)}
                      disabled={runningId !== null}
                    >
                      {runningId === scenario.id ? "Running..." : "Run Scenario"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm text-center">{error}</p>
      )}

      <div className="pt-2 border-t border-border text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Want to build your own comparison?
        </p>
        <Button variant="outline" onClick={() => navigate("/compare")}>
          Start a Custom Comparison
        </Button>
      </div>
    </div>
  );
}
