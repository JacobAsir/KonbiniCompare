import { ReactNode } from "react";
import { Link } from "wouter";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
            KonbiniCompare
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/compare" className="text-foreground/80 hover:text-primary transition-colors">Compare</Link>
            <Link href="/demo" className="text-foreground/80 hover:text-primary transition-colors">Demos</Link>
            <Link href="/how-it-works" className="text-foreground/80 hover:text-primary transition-colors">How it works</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>KonbiniCompare — Your quiet, knowledgeable friend.</p>
        </div>
      </footer>
    </div>
  );
}
