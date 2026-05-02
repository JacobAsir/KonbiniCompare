import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DIMENSIONS = [
  {
    key: "price",
    label: "Price",
    labelJa: "価格",
    desc: "Lower absolute price scores higher. Products are compared relative to each other.",
  },
  {
    key: "valueForMoney",
    label: "Value for Money",
    labelJa: "コスパ",
    desc: "Volume or weight (ml or g) divided by price. More per yen = higher score.",
  },
  {
    key: "caffeine",
    label: "Caffeine",
    labelJa: "カフェイン",
    desc: "Lower caffeine scores higher when caffeine sensitivity is enabled.",
  },
  {
    key: "calories",
    label: "Calories",
    labelJa: "カロリー",
    desc: "Fewer calories per serving = higher score. Weighted by nutrition priority.",
  },
  {
    key: "sugar",
    label: "Sugar",
    labelJa: "糖分",
    desc: "Less sugar per serving = higher score. Weighted by sugar avoidance preference.",
  },
  {
    key: "protein",
    label: "Protein",
    labelJa: "たんぱく質",
    desc: "More protein = higher score. Weighted by protein priority preference.",
  },
  {
    key: "additives",
    label: "Additives",
    labelJa: "添加物",
    desc: "Fewer additives = higher score. Products with zero additives score 1.0.",
  },
  {
    key: "allergenSafety",
    label: "Allergen Safety",
    labelJa: "アレルゲン安全性",
    desc: "Products containing your flagged allergens score 0.0. Clean products score 1.0. Only weighted when you list allergen concerns.",
  },
  {
    key: "skinSafety",
    label: "Skin Safety",
    labelJa: "肌安全性",
    desc: "Combines irritation risk (low/medium/high), fragrance-free, and alcohol-free status. Only applies to skincare products.",
  },
  {
    key: "convenience",
    label: "Convenience",
    labelJa: "携帯性",
    desc: "Single-serve and small-volume products score higher. Weighted by convenience preference.",
  },
];

const STEPS = [
  {
    num: "01",
    label: "Normalise",
    desc: "All raw product values (price, caffeine, sugar, etc.) are collected for the selected products and normalised together using min-max scaling so the best product on each dimension gets 1.0 and the worst gets 0.0.",
  },
  {
    num: "02",
    label: "Weight",
    desc: "Each normalised dimension score is multiplied by the user-set preference weight (0–1). A weight of 0 means the dimension is ignored entirely. Allergen safety receives a weight of 1.0 if any allergens are listed.",
  },
  {
    num: "03",
    label: "Aggregate",
    desc: "The weighted sum of all dimension scores is divided by the sum of their weights to produce a final score in [0, 1]. Products with more missing data receive a small automatic penalty.",
  },
  {
    num: "04",
    label: "Rank",
    desc: "Products are sorted by descending final score. Ties are broken alphabetically to ensure the ranking is always deterministic and reproducible.",
  },
  {
    num: "05",
    label: "Explain",
    desc: "After ranking, the data is passed to an LLM (OpenAI) which generates a bilingual (Japanese + English) natural-language explanation grounded in the actual product fields. The LLM cannot change the ranking.",
  },
];

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">How Scoring Works</h1>
        <p className="text-muted-foreground text-lg">
          スコアリングの仕組み
        </p>
        <p className="text-muted-foreground">
          KonbiniCompare uses a fully deterministic scoring engine. The ranking is always based on real product data and your explicit preference weights — never on AI guesswork.
        </p>
      </div>

      {/* Core principle */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="font-semibold text-sm">Core principle: The AI explains, the engine decides.</p>
          <p className="text-sm text-muted-foreground mt-1">
            The LLM is only used to generate natural-language summaries after the ranking is complete. It cannot invent product facts, change scores, or alter the ranking in any way.
          </p>
        </CardContent>
      </Card>

      {/* Steps */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Scoring Process</h2>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {step.num}
              </div>
              <div className="pt-1.5">
                <div className="font-semibold">{step.label}</div>
                <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dimensions */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Scoring Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DIMENSIONS.map((d) => (
            <Card key={d.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {d.label} <span className="text-muted-foreground font-normal">{d.labelJa}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{d.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Missing data */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-base">Missing Data / データ不足について</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            When a product's fields are missing (e.g. sugar content not listed), that dimension is excluded from scoring for all products — it is not set to zero, which would unfairly penalise the product.
          </p>
          <p>
            Each missing critical field applies a small penalty (-4%) to the final score, and all missing fields are listed clearly in the results so you can make an informed decision.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/compare">
          <Button>Try a Comparison</Button>
        </Link>
        <Link href="/demo">
          <Button variant="outline">Browse Demo Scenarios</Button>
        </Link>
      </div>
    </div>
  );
}
