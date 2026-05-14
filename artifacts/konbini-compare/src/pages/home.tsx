import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCompareResult } from "@/lib/CompareContext";
import { useLang } from "@/lib/LanguageContext";
import BarcodeScanner from "@/components/BarcodeScanner";
import { Search, X, ArrowRight, Zap, Shield, ScanBarcode, Loader2 } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

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

const PROFILE_LABEL_KEY: Record<string, TranslationKey> = {
  budget: "profileBudget",
  health: "profileHealth",
  clean: "profileClean",
  balanced: "profileBalanced",
};

export default function Home() {
  const [, navigate] = useLocation();
  const { setSelectedProducts, profile } = useCompareResult();
  const { lang, t } = useLang();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addProduct = (product: Product) => {
    if (selected.length >= 5) return;
    if (selected.find((p) => p.id === product.id)) return;
    setSelected((prev) => [...prev, product]);
    setQuery("");
    setShowResults(false);
    inputRef.current?.focus();
  };

  const removeProduct = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCompare = () => {
    if (selected.length < 2) return;
    setSelectedProducts(selected);
    navigate("/result");
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setScanLoading(true);
    try {
      const res = await fetch(`/api/barcode/${barcode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.product) addProduct(data.product);
      } else {
        setQuery(barcode);
        setShowResults(true);
      }
    } catch {
      setQuery(barcode);
    } finally {
      setScanLoading(false);
    }
  };

  const displayName = (p: Product) =>
    lang === "ja" && p.nameJa ? p.nameJa : p.name;
  const secondaryName = (p: Product) =>
    lang === "ja" ? p.name : p.nameJa ?? null;

  const hasProfile = !!profile;
  const isOFFProduct = (p: Product) => p.id.startsWith("off-");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {showScanner && (
        <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
      )}

      <section className="text-center space-y-4 pt-6 pb-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("homeHeading")}</h1>
        <p className="text-base text-muted-foreground">{t("homeSubtitle")}</p>
      </section>

      <div className="space-y-3">
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-12 pr-12 py-4 text-base rounded-xl border-2 border-border bg-card focus:border-primary focus:outline-none transition-colors"
              aria-label={t("searchAriaLabel")}
            />
            {query ? (
              <button
                onClick={() => { setQuery(""); setResults([]); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t("clearSearchAriaLabel")}
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          {showResults && query.length >= 2 && (
            <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("searching")}
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {t("noResults", query)}
                </div>
              ) : (
                <>
                  {results.map((product) => {
                    const alreadySelected = selected.find((p) => p.id === product.id);
                    const fromOFF = isOFFProduct(product);
                    return (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        disabled={!!alreadySelected || selected.length >= 5}
                        className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start gap-3">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0 bg-muted" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{displayName(product)}</div>
                            {secondaryName(product) && (
                              <div className="text-xs text-muted-foreground truncate">{secondaryName(product)}</div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.brand && (
                                <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                              )}
                              {product.priceJpy && (
                                <Badge variant="outline" className="text-xs">¥{product.priceJpy}</Badge>
                              )}
                              {product.store && (
                                <Badge variant="secondary" className="text-xs">{product.store}</Badge>
                              )}
                              {product.volumeMl && (
                                <Badge variant="outline" className="text-xs">{product.volumeMl}ml</Badge>
                              )}
                              {product.weightG && (
                                <Badge variant="outline" className="text-xs">{product.weightG}g</Badge>
                              )}
                              {fromOFF && (
                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                  Open Food Facts
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30 text-center">
                    {t("dataAttribution")}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowScanner(true)}
            className="gap-2"
            disabled={scanLoading}
          >
            {scanLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanBarcode className="h-4 w-4" />}
            {t("scanBarcode")}
          </Button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              {t("comparingCount", selected.length)}
            </h2>
            {selected.length >= 2 && (
              <Button onClick={handleCompare} className="gap-2">
                {t("compareNow")} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {selected.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                <span className="text-lg font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt="" className="w-8 h-8 rounded object-cover bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{displayName(product)}</div>
                  <div className="flex gap-1 mt-0.5">
                    {product.brand && (<Badge variant="outline" className="text-xs">{product.brand}</Badge>)}
                    {product.priceJpy && (<Badge variant="outline" className="text-xs">¥{product.priceJpy}</Badge>)}
                    {product.volumeMl && (<Badge variant="outline" className="text-xs">{product.volumeMl}ml</Badge>)}
                    {product.weightG && (<Badge variant="outline" className="text-xs">{product.weightG}g</Badge>)}
                  </div>
                </div>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  aria-label={t("removeAriaLabel", displayName(product))}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {selected.length < 2 && (
            <p className="text-xs text-muted-foreground text-center">{t("addOneMore")}</p>
          )}
        </div>
      )}

      {!hasProfile && selected.length === 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">{t("profileCtaSetup")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("profileCtaSetupDesc")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
              {t("profileCtaSetupButton")}
            </Button>
          </CardContent>
        </Card>
      )}

      {hasProfile && selected.length === 0 && (
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-sm">✓</div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {t("profileActive", t(PROFILE_LABEL_KEY[profile] ?? "profileBalanced"))}
              </p>
              <p className="text-xs text-muted-foreground">{t("profileActiveDesc")}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              {t("profileEditButton")}
            </Button>
          </CardContent>
        </Card>
      )}

      {selected.length === 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="text-center space-y-2 p-4">
            <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">{t("howSearchHeader")}</h3>
            <p className="text-xs text-muted-foreground">{t("howSearchDesc")}</p>
          </div>
          <div className="text-center space-y-2 p-4">
            <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">{t("howCompareHeader")}</h3>
            <p className="text-xs text-muted-foreground">{t("howCompareDesc")}</p>
          </div>
          <div className="text-center space-y-2 p-4">
            <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">{t("howDecideHeader")}</h3>
            <p className="text-xs text-muted-foreground">{t("howDecideDesc")}</p>
          </div>
        </section>
      )}

      {selected.length === 0 && (
        <div className="text-center pb-6">
          <p className="text-xs text-muted-foreground">
            {t("poweredBy")}
            <br />
            {t("poweredBySubtext")}
          </p>
        </div>
      )}
    </div>
  );
}
