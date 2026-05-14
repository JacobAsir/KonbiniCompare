import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/lib/LanguageContext";
import {
  Search,
  ScanBarcode,
  Database,
  Sparkles,
  Wallet,
  Heart,
  Leaf,
  Scale,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

const USER_STEPS: Array<{
  num: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: typeof Search;
}> = [
  { num: "1", labelKey: "hiwStep1", descKey: "hiwStep1Desc", icon: Search },
  { num: "2", labelKey: "hiwStep2", descKey: "hiwStep2Desc", icon: Database },
  { num: "3", labelKey: "hiwStep3", descKey: "hiwStep3Desc", icon: Sparkles },
];

const PROFILES: Array<{
  labelKey: TranslationKey;
  shortKey: TranslationKey;
  icon: typeof Wallet;
  color: string;
}> = [
  { labelKey: "profileBudget", shortKey: "hiwProfileBudgetShort", icon: Wallet, color: "text-green-600" },
  { labelKey: "profileHealth", shortKey: "hiwProfileHealthShort", icon: Heart, color: "text-red-500" },
  { labelKey: "profileClean", shortKey: "hiwProfileCleanShort", icon: Leaf, color: "text-emerald-600" },
  { labelKey: "profileBalanced", shortKey: "hiwProfileBalancedShort", icon: Scale, color: "text-blue-600" },
];

const ENGINE_STEPS: Array<{ num: string; labelKey: TranslationKey; descKey: TranslationKey }> = [
  { num: "01", labelKey: "hiwEng1", descKey: "hiwEng1Desc" },
  { num: "02", labelKey: "hiwEng2", descKey: "hiwEng2Desc" },
  { num: "03", labelKey: "hiwEng3", descKey: "hiwEng3Desc" },
  { num: "04", labelKey: "hiwEng4", descKey: "hiwEng4Desc" },
  { num: "05", labelKey: "hiwEng5", descKey: "hiwEng5Desc" },
];

// Scoring dimensions with bilingual descriptions
const DIM_DETAILS = [
  {
    labelKey: "dimPrice" as TranslationKey,
    en: "Lower absolute price scores higher. Products are compared relative to each other in the set.",
    ja: "絶対的な価格が低いほど高スコア。同じセット内で相対的に比較されます。",
  },
  {
    labelKey: "dimValueForMoney" as TranslationKey,
    en: "Volume or weight (ml or g) divided by price. More quantity per yen = higher score.",
    ja: "容量または重さ (ml または g) を価格で割った値。円あたりの量が多いほど高スコア。",
  },
  {
    labelKey: "dimCaffeine" as TranslationKey,
    en: "Lower caffeine scores higher when caffeine sensitivity is active (Health profile).",
    ja: "カフェイン感度がオン (健康プロフィール) のとき、カフェインが少ないほど高スコア。",
  },
  {
    labelKey: "dimCalories" as TranslationKey,
    en: "Fewer calories per serving = higher score. Weighted heavily by the Health profile.",
    ja: "1食あたりのカロリーが少ないほど高スコア。健康プロフィールで重要視されます。",
  },
  {
    labelKey: "dimSugar" as TranslationKey,
    en: "Less sugar per serving = higher score. Strong factor in Health profile.",
    ja: "1食あたりの糖分が少ないほど高スコア。健康プロフィールで重要な要素。",
  },
  {
    labelKey: "dimProtein" as TranslationKey,
    en: "More protein = higher score. Boosted by the Health profile.",
    ja: "たんぱく質が多いほど高スコア。健康プロフィールで強化されます。",
  },
  {
    labelKey: "dimAdditives" as TranslationKey,
    en: "Fewer additives = higher score. Near-perfect weight in the Clean Ingredients profile.",
    ja: "添加物が少ないほど高スコア。成分重視プロフィールではほぼ最大の重み。",
  },
  {
    labelKey: "dimAllergenSafety" as TranslationKey,
    en: "Products containing your flagged allergens score 0.0. Clean products score 1.0. Only weighted when you list allergen concerns in your profile.",
    ja: "設定したアレルゲンを含む商品は 0.0、含まない商品は 1.0。プロフィールでアレルゲンを指定した場合のみ適用されます。",
  },
  {
    labelKey: "dimSkinSafety" as TranslationKey,
    en: "Combines irritation risk (low/medium/high), fragrance-free, and alcohol-free status. Only applies to skincare products.",
    ja: "刺激リスク (低/中/高)・無香料・アルコールフリーを組み合わせて評価。スキンケア商品のみに適用。",
  },
  {
    labelKey: "dimConvenience" as TranslationKey,
    en: "Single-serve and small-volume products score higher. Useful for on-the-go decisions.",
    ja: "個食・小容量の商品ほど高スコア。外出先での判断に便利です。",
  },
];

export default function HowItWorks() {
  const { lang, t } = useLang();

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">{t("hiwHeading")}</h1>
        <p className="text-muted-foreground">{t("hiwIntro")}</p>
      </div>

      {/* For Users */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t("hiwForUsers")}</h2>
        <div className="space-y-3">
          {USER_STEPS.map(({ num, labelKey, descKey, icon: Icon }) => (
            <Card key={num}>
              <CardContent className="p-5 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">
                      {lang === "ja" ? `ステップ${num}` : `Step ${num}`}
                    </span>
                    <span className="font-semibold">{t(labelKey)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t(descKey)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Data sources */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t("hiwDataSources")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-700" />
                <h3 className="font-semibold text-sm">{t("hiwCurated")}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{t("hiwCuratedDesc")}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-700" />
                <h3 className="font-semibold text-sm">{t("hiwOFF")}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{t("hiwOFFDesc")}</p>
            </CardContent>
          </Card>
        </div>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3">
            <ScanBarcode className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{t("hiwBarcodeTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("hiwBarcodeDesc")}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Profiles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t("hiwProfileSystem")}</h2>
        <p className="text-sm text-muted-foreground">{t("hiwProfileIntro")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROFILES.map(({ labelKey, shortKey, icon: Icon, color }) => (
            <Card key={labelKey}>
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="font-semibold">{t(labelKey)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t(shortKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("hiwProfileAllergenNote")}</p>
      </section>

      {/* Core principle */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 space-y-2">
          <p className="font-semibold">{t("hiwCorePrinciple")}</p>
          <p className="text-sm text-muted-foreground">{t("hiwCorePrincipleDesc")}</p>
        </CardContent>
      </Card>

      {/* Engine steps */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t("hiwEngineTitle")}</h2>
        <div className="space-y-3">
          {ENGINE_STEPS.map((step) => (
            <div key={step.num} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {step.num}
              </div>
              <div className="pt-1.5">
                <div className="font-semibold">{t(step.labelKey)}</div>
                <p className="text-sm text-muted-foreground mt-0.5">{t(step.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dimensions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t("hiwDimensionsTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("hiwDimensionsIntro")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DIM_DETAILS.map(({ labelKey, en, ja }) => (
            <Card key={labelKey}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t(labelKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{lang === "ja" ? ja : en}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Missing data */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-base">{t("hiwMissingDataTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("hiwMissingData1")}</p>
          <p>{t("hiwMissingData2")}</p>
          <p>{t("hiwMissingData3")}</p>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("hiwPrivacyTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("hiwPrivacy1")}</p>
          <p>{t("hiwPrivacy2")}</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/">
          <Button>{t("hiwTryButton")}</Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline">{t("hiwProfileButton")}</Button>
        </Link>
      </div>
    </div>
  );
}
