import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetCategories } from "@workspace/api-client-react";

export default function Home() {
  const { data: categoriesData, isLoading } = useGetCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center space-y-6 py-12">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground">
          Find exactly what fits your life.
          <br />
          <span className="text-primary">生活に合ったものを見つける</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          KonbiniCompare is your quiet, knowledgeable friend standing next to you in a Japanese convenience store. Compare everyday products deliberately.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/compare">
            <Button size="lg" className="text-lg px-8 py-6 h-auto">Start Comparing</Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">Try a Demo</Button>
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">What can you compare?</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-32 bg-muted/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesData?.categories.map((cat) => (
              <Card key={cat.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-4xl" aria-hidden="true">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.nameJa}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="bg-secondary/50 rounded-xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">How it works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select a category, pick 2-5 products you're choosing between, and set your personal preferences like budget, nutrition, or caffeine sensitivity. Our deterministic engine ranks them and gives you a bilingual summary of strengths, trade-offs, and cautions.
        </p>
        <Link href="/how-it-works">
          <Button variant="link" className="text-primary mt-2">Learn more about scoring →</Button>
        </Link>
      </section>
    </div>
  );
}
