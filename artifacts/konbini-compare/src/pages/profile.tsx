import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompareResult } from "@/lib/CompareContext";
import { useLang } from "@/lib/LanguageContext";
import { Wallet, Heart, Leaf, Scale, X } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

const PROFILES: Array<{
  id: string;
  icon: typeof Wallet;
  color: string;
  bgColor: string;
  selectedBg: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
}> = [
  {
    id: "budget",
    icon: Wallet,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    selectedBg: "bg-green-100 border-green-500 ring-2 ring-green-500/20",
    labelKey: "profileBudget",
    descKey: "profileBudgetDesc",
  },
  {
    id: "health",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50 border-red-200",
    selectedBg: "bg-red-100 border-red-500 ring-2 ring-red-500/20",
    labelKey: "profileHealth",
    descKey: "profileHealthDesc",
  },
  {
    id: "clean",
    icon: Leaf,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
    selectedBg: "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500/20",
    labelKey: "profileClean",
    descKey: "profileCleanDesc",
  },
  {
    id: "balanced",
    icon: Scale,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    selectedBg: "bg-blue-100 border-blue-500 ring-2 ring-blue-500/20",
    labelKey: "profileBalanced",
    descKey: "profileBalancedDesc",
  },
];

const COMMON_ALLERGENS: Array<{ id: string; labelKey: TranslationKey }> = [
  { id: "milk", labelKey: "allergenMilk" },
  { id: "wheat", labelKey: "allergenWheat" },
  { id: "egg", labelKey: "allergenEgg" },
  { id: "peanuts", labelKey: "allergenPeanuts" },
  { id: "soy", labelKey: "allergenSoy" },
  { id: "fish", labelKey: "allergenFish" },
  { id: "shellfish", labelKey: "allergenShellfish" },
];

export default function Profile() {
  const [, navigate] = useLocation();
  const { profile, setProfile, allergens, setAllergens } = useCompareResult();
  const { t } = useLang();

  const [selectedProfile, setSelectedProfile] = useState(profile ?? "balanced");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(allergens ?? []);
  const [customAllergen, setCustomAllergen] = useState("");

  const toggleAllergen = (a: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const addCustomAllergen = () => {
    const trimmed = customAllergen.trim().toLowerCase();
    if (trimmed && !selectedAllergens.includes(trimmed)) {
      setSelectedAllergens((prev) => [...prev, trimmed]);
    }
    setCustomAllergen("");
  };

  const handleSave = () => {
    setProfile(selectedProfile);
    setAllergens(selectedAllergens);
    navigate("/");
  };

  const commonAllergenIds = COMMON_ALLERGENS.map((a) => a.id);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-2xl font-bold">{t("profileHeading")}</h1>
        <p className="text-muted-foreground">{t("profileSubtitle")}</p>
      </div>

      <div className="space-y-3">
        {PROFILES.map(({ id, icon: Icon, color, bgColor, selectedBg, labelKey, descKey }) => (
          <button
            key={id}
            onClick={() => setSelectedProfile(id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedProfile === id ? selectedBg : bgColor + " hover:opacity-80"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{t(labelKey)}</div>
                <p className="text-sm text-muted-foreground mt-0.5">{t(descKey)}</p>
              </div>
              {selectedProfile === id && <div className="text-primary font-bold">✓</div>}
            </div>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-sm">{t("allergenHeading")}</h2>
            <p className="text-xs text-muted-foreground">{t("allergenDesc")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGENS.map(({ id, labelKey }) => (
              <button
                key={id}
                onClick={() => toggleAllergen(id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedAllergens.includes(id)
                    ? "bg-destructive/10 border-destructive/50 text-destructive"
                    : "bg-muted border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {t(labelKey)}
                {selectedAllergens.includes(id) && " ✕"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAllergen}
              onChange={(e) => setCustomAllergen(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomAllergen()}
              placeholder={t("allergenAddPlaceholder")}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button variant="outline" size="sm" onClick={addCustomAllergen}>
              {t("addButton")}
            </Button>
          </div>
          {selectedAllergens.filter((a) => !commonAllergenIds.includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedAllergens
                .filter((a) => !commonAllergenIds.includes(a))
                .map((a) => (
                  <Badge
                    key={a}
                    variant="destructive"
                    className="cursor-pointer text-xs"
                    onClick={() => toggleAllergen(a)}
                  >
                    {a} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
          {t("skipForNow")}
        </Button>
        <Button onClick={handleSave} className="flex-1">
          {t("saveAndCompare")}
        </Button>
      </div>
    </div>
  );
}
