import { ReactNode } from "react";
import { Link } from "wouter";
import LanguageToggle from "@/components/LanguageToggle";
import { useLang } from "@/lib/LanguageContext";

export default function Layout({ children }: { children: ReactNode }) {
  const { t } = useLang();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight text-primary flex items-center gap-2 shrink-0"
          >
            🍱 <span className="hidden sm:inline">{t("appName")}</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium">
            <Link href="/profile" className="text-foreground/80 hover:text-primary transition-colors">
              {t("navProfile")}
            </Link>
            <Link href="/how-it-works" className="text-foreground/80 hover:text-primary transition-colors hidden sm:inline">
              {t("navHowItWorks")}
            </Link>
            <LanguageToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>{t("footerTagline")}</p>
        </div>
      </footer>
    </div>
  );
}
