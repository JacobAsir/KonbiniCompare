/**
 * Bilingual translation dictionary for KonbiniCompare.
 * Every UI string lives here keyed by id. Use the `useT()` hook in components.
 */

export type Language = "en" | "ja";

export const translations = {
  // Layout / Navigation
  appName: { en: "KonbiniCompare", ja: "コンビニ比較" },
  documentTitle: {
    en: "🍱 KonbiniCompare — Which one should I grab?",
    ja: "🍱 コンビニ比較 — どっちを選ぶ？",
  },
  navProfile: { en: "Profile", ja: "プロフィール" },
  navHowItWorks: { en: "How it works", ja: "使い方" },
  footerTagline: {
    en: "KonbiniCompare — Your quiet, knowledgeable friend in the konbini.",
    ja: "コンビニ比較 — あなたのコンビニでの静かな賢い味方。",
  },

  // Language toggle
  languageToggleAria: { en: "Change language", ja: "言語を変更" },

  // Home page
  homeHeading: { en: "Which one should I grab?", ja: "どっちを選ぶ？" },
  homeSubtitle: {
    en: "Search or scan, get an instant answer.",
    ja: "検索またはスキャンで、すぐに答えが分かります。",
  },
  searchPlaceholder: {
    en: "Search any product... (e.g. 'pocari', 'matcha')",
    ja: "商品を検索... (例: 'ポカリ', '抹茶')",
  },
  searchAriaLabel: { en: "Search products", ja: "商品を検索" },
  clearSearchAriaLabel: { en: "Clear search", ja: "検索をクリア" },
  searching: { en: "Searching products...", ja: "検索中..." },
  noResults: {
    en: (q: string) => `No products found for "${q}"`,
    ja: (q: string) => `「${q}」の商品は見つかりませんでした`,
  },
  dataAttribution: {
    en: "Product data from Open Food Facts (ODbL license)",
    ja: "商品データは Open Food Facts より (ODbLライセンス)",
  },
  scanBarcode: { en: "Scan Barcode", ja: "バーコードをスキャン" },
  comparingCount: {
    en: (n: number) => `Comparing (${n}/5)`,
    ja: (n: number) => `比較中 (${n}/5)`,
  },
  compareNow: { en: "Compare Now", ja: "今すぐ比較" },
  addOneMore: {
    en: "Add at least one more product to compare",
    ja: "比較するにはもう1つ商品を追加してください",
  },
  removeAriaLabel: {
    en: (name: string) => `Remove ${name}`,
    ja: (name: string) => `${name} を削除`,
  },
  profileCtaSetup: {
    en: "Set up your profile for personalized results",
    ja: "プロフィールを設定してパーソナライズされた結果を得る",
  },
  profileCtaSetupDesc: {
    en: "Tell us what matters to you — takes 10 seconds",
    ja: "あなたの優先事項を教えてください — 10秒で完了",
  },
  profileCtaSetupButton: { en: "Set Up", ja: "設定する" },
  profileActive: {
    en: (p: string) => `Profile: ${p}`,
    ja: (p: string) => `プロフィール: ${p}`,
  },
  profileActiveDesc: {
    en: "Your comparisons are personalized",
    ja: "比較があなた向けにパーソナライズされています",
  },
  profileEditButton: { en: "Edit", ja: "編集" },
  howSearchHeader: { en: "Search or Scan", ja: "検索・スキャン" },
  howSearchDesc: {
    en: "Find any product by name or barcode",
    ja: "名前またはバーコードで商品を検索",
  },
  howCompareHeader: { en: "Instant Compare", ja: "即時比較" },
  howCompareDesc: {
    en: "Real nutrition data scored for you",
    ja: "実際の栄養データをあなた向けに採点",
  },
  howDecideHeader: { en: "Clear Winner", ja: "明確な勝者" },
  howDecideDesc: {
    en: "Honest verdict with trade-offs",
    ja: "正直な判断とトレードオフ",
  },
  poweredBy: {
    en: "Powered by Open Food Facts — the free food products database.",
    ja: "Open Food Facts (無料の食品データベース) を利用しています。",
  },
  poweredBySubtext: {
    en: "Thousands of real products with nutrition, allergens & ingredients.",
    ja: "栄養・アレルゲン・成分情報付きの実在する商品が数千点。",
  },

  // Profile page
  profileHeading: { en: "What matters to you?", ja: "あなたの優先事項は？" },
  profileSubtitle: {
    en: "This personalizes every comparison.",
    ja: "すべての比較がパーソナライズされます。",
  },
  profileBudget: { en: "Budget First", ja: "予算重視" },
  profileBudgetDesc: {
    en: "I want the best deal — price and value per yen matter most.",
    ja: "お得なものが欲しい — 価格とコスパを最優先。",
  },
  profileHealth: { en: "Health Focused", ja: "健康重視" },
  profileHealthDesc: {
    en: "Low sugar, high protein, good nutrition — I'm watching what I consume.",
    ja: "低糖質・高たんぱく・良い栄養 — 食べるものに気を配っています。",
  },
  profileClean: { en: "Clean Ingredients", ja: "成分重視" },
  profileCleanDesc: {
    en: "Fewer additives, simpler formulas — I prefer natural and gentle products.",
    ja: "添加物が少なくシンプルな成分 — 自然で優しい商品が好きです。",
  },
  profileBalanced: { en: "Balanced", ja: "バランス型" },
  profileBalancedDesc: {
    en: "A bit of everything — no strong preference, just show me the best overall.",
    ja: "どれも少しずつ — 総合的に最も良いものを教えてほしい。",
  },
  allergenHeading: { en: "Any allergen concerns?", ja: "アレルゲンの心配はありますか？" },
  allergenDesc: {
    en: "Products with these will be flagged",
    ja: "これらを含む商品には警告が表示されます",
  },
  allergenAddPlaceholder: { en: "Add other...", ja: "他を追加..." },
  addButton: { en: "Add", ja: "追加" },
  skipForNow: { en: "Skip for now", ja: "今はスキップ" },
  saveAndCompare: { en: "Save & Compare", ja: "保存して比較" },

  // Common allergens (common 7 in Japan)
  allergenMilk: { en: "milk", ja: "乳" },
  allergenWheat: { en: "wheat", ja: "小麦" },
  allergenEgg: { en: "egg", ja: "卵" },
  allergenPeanuts: { en: "peanuts", ja: "落花生" },
  allergenSoy: { en: "soy", ja: "大豆" },
  allergenFish: { en: "fish", ja: "魚" },
  allergenShellfish: { en: "shellfish", ja: "甲殻類" },

  // Result page
  newComparison: { en: "New comparison", ja: "新しい比較" },
  bestMatch: { en: "Best Match", ja: "ベストマッチ" },
  pointsAhead: {
    en: (n: number) => `+${n}pts ahead`,
    ja: (n: number) => `+${n}点リード`,
  },
  hideDetails: { en: "Hide details", ja: "詳細を隠す" },
  showDetails: { en: "Show detailed breakdown", ja: "詳細な内訳を表示" },
  missingDataLabel: {
    en: (fields: string) => `Missing data: ${fields}`,
    ja: (fields: string) => `データ不足: ${fields}`,
  },
  sideBySide: { en: "Side-by-side", ja: "並べて比較" },
  compareSomethingElse: { en: "Compare Something Else", ja: "別のものを比較" },
  tryAgain: { en: "Try Again", ja: "再試行" },
  somethingWentWrong: { en: "Something went wrong", ja: "エラーが発生しました" },
  comparingProducts: { en: "Comparing products...", ja: "商品を比較中..." },

  // Barcode scanner
  scannerHeading: { en: "Scan Barcode", ja: "バーコードをスキャン" },
  scannerCloseAria: { en: "Close scanner", ja: "スキャナーを閉じる" },
  scannerInstruction: {
    en: "Point camera at barcode",
    ja: "カメラをバーコードに向けてください",
  },
  scannerPrompt: {
    en: "Scan a product barcode to look it up instantly",
    ja: "商品のバーコードをスキャンしてすぐに検索",
  },
  openCamera: { en: "Open Camera", ja: "カメラを開く" },
  manualEntryPrompt: {
    en: "Or enter barcode manually",
    ja: "またはバーコードを手動で入力",
  },
  manualEntryPlaceholder: {
    en: "e.g. 4901085617335",
    ja: "例: 4901085617335",
  },
  lookUp: { en: "Look Up", ja: "検索" },
  cameraDeniedError: {
    en: "Camera access denied. You can enter the barcode manually below.",
    ja: "カメラへのアクセスが拒否されました。下で手動入力できます。",
  },
  barcodeNotSupportedError: {
    en: "Your browser doesn't support barcode scanning. Enter the code manually below.",
    ja: "このブラウザはバーコードスキャンに対応していません。下で手動入力してください。",
  },

  // Scoring dimension labels (for result breakdown)
  dimPrice: { en: "Price", ja: "価格" },
  dimValueForMoney: { en: "Value/ml", ja: "コスパ" },
  dimCaffeine: { en: "Caffeine", ja: "カフェイン" },
  dimCalories: { en: "Calories", ja: "カロリー" },
  dimSugar: { en: "Sugar", ja: "糖分" },
  dimProtein: { en: "Protein", ja: "たんぱく質" },
  dimAdditives: { en: "Additives", ja: "添加物" },
  dimAllergenSafety: { en: "Allergen Safety", ja: "アレルゲン安全性" },
  dimSkinSafety: { en: "Skin Safety", ja: "肌安全性" },
  dimConvenience: { en: "Convenience", ja: "携帯性" },

  // How it works page
  hiwHeading: { en: "How It Works", ja: "使い方・仕組み" },
  hiwIntro: {
    en: "KonbiniCompare is a decision tool for real life. Search or scan any product, set a profile once, and get an instant, honest comparison grounded in real data — not AI guesswork.",
    ja: "コンビニ比較は日常のための判断ツールです。商品を検索またはスキャンし、プロフィールを一度設定すれば、実際のデータに基づいた正直な比較が瞬時に得られます — AIの推測ではありません。",
  },
  hiwForUsers: { en: "For Users", ja: "使い方" },
  hiwStep1: { en: "Search or Scan", ja: "検索 or スキャン" },
  hiwStep1Desc: {
    en: "Type a product name in English or Japanese, or scan the barcode with your phone camera. Results come from both our Japan-curated catalog and Open Food Facts (thousands of real products worldwide).",
    ja: "英語または日本語で商品名を入力するか、スマホのカメラでバーコードをスキャンします。結果は日本向けに厳選されたカタログと Open Food Facts (世界中の実在する商品数千点) の両方から提供されます。",
  },
  hiwStep2: { en: "Pick 2–5 products", ja: "2〜5品を選ぶ" },
  hiwStep2Desc: {
    en: "Add the items you're choosing between. See price, brand, volume, and allergens at a glance before selecting.",
    ja: "選ぶ候補の商品を追加します。選択前に価格・ブランド・容量・アレルゲンを一目で確認できます。",
  },
  hiwStep3: { en: "Get an instant verdict", ja: "即時結果" },
  hiwStep3Desc: {
    en: "One clear winner with a bilingual explanation, honest trade-offs, and optional detailed score breakdowns — all in seconds.",
    ja: "明確な1位の商品を、バイリンガルの解説、正直なトレードオフ、詳細な内訳 (任意) とともに数秒で表示します。",
  },
  hiwDataSources: {
    en: "Where the Data Comes From",
    ja: "データの出典",
  },
  hiwCurated: { en: "Japan-Curated Catalog", ja: "日本向けカタログ" },
  hiwCuratedDesc: {
    en: "35+ popular konbini items hand-entered with Japan-specific pricing. Always shown first.",
    ja: "日本の価格情報付きで厳選した35以上の人気コンビニ商品。常に最初に表示されます。",
  },
  hiwOFF: { en: "Open Food Facts", ja: "Open Food Facts" },
  hiwOFFDesc: {
    en: "Real-world product database (ODbL license). Nutrition, allergens, ingredients, images, and barcodes — thousands of products.",
    ja: "実世界の商品データベース (ODbLライセンス)。栄養・アレルゲン・成分・画像・バーコード付きで数千点。",
  },
  hiwBarcodeTitle: { en: "Barcode Scanning", ja: "バーコードスキャン" },
  hiwBarcodeDesc: {
    en: "The app uses your phone's camera via the native BarcodeDetector API to read EAN/UPC codes and look them up in Open Food Facts. Manual entry works as a fallback on desktops.",
    ja: "スマホのカメラと標準の BarcodeDetector API を使って EAN/UPC コードを読み取り、Open Food Facts で検索します。デスクトップでは手動入力が代替手段として使えます。",
  },
  hiwProfileSystem: { en: "The Profile System", ja: "プロフィールシステム" },
  hiwProfileIntro: {
    en: "Instead of tweaking 9 sliders every time, you pick one profile that matches your priorities. The profile maps to preference weights behind the scenes.",
    ja: "毎回9つのスライダーを調整する代わりに、優先事項に合うプロフィールを1つ選びます。プロフィールは内部で重み付けに変換されます。",
  },
  hiwProfileBudgetShort: {
    en: "Price and value-per-yen weighted highest.",
    ja: "価格と円あたりの価値を最も重視します。",
  },
  hiwProfileHealthShort: {
    en: "Low sugar, high protein, clean nutrition prioritized.",
    ja: "低糖質・高たんぱく・クリーンな栄養を優先します。",
  },
  hiwProfileCleanShort: {
    en: "Minimal additives, gentle formulas, ingredient simplicity wins.",
    ja: "添加物最小・優しい処方・成分のシンプルさを優先します。",
  },
  hiwProfileBalancedShort: {
    en: "Equal weight across all dimensions — no strong preference.",
    ja: "全項目に均等な重み — 特別な優先事項なし。",
  },
  hiwProfileAllergenNote: {
    en: "Allergen concerns are tracked separately and always applied as a hard constraint on top of whichever profile is active.",
    ja: "アレルゲンの心配事項は別に管理され、どのプロフィールでも絶対的な制約として常に適用されます。",
  },
  hiwCorePrinciple: {
    en: "Core principle: The AI explains, the engine decides.",
    ja: "核となる原則: AIは説明し、エンジンが決定する。",
  },
  hiwCorePrincipleDesc: {
    en: "The ranking is calculated by a fully deterministic scoring engine. The LLM only generates natural-language summaries after the ranking is complete — it cannot invent product facts, change scores, or alter the order in any way.",
    ja: "ランキングは完全に決定論的なスコアリングエンジンで算出されます。LLMはランキング完了後に自然言語の要約を生成するのみ — 商品の事実を作り出したり、スコアや順序を変更したりはできません。",
  },
  hiwEngineTitle: {
    en: "How the Scoring Engine Works",
    ja: "スコアリングエンジンの仕組み",
  },
  hiwEng1: { en: "Normalise", ja: "正規化" },
  hiwEng1Desc: {
    en: "All raw product values (price, caffeine, sugar, protein, etc.) are collected and normalised together using min-max scaling — the best product on each dimension gets 1.0, the worst gets 0.0.",
    ja: "すべての生データ (価格・カフェイン・糖分・たんぱく質など) を集めて min-max スケーリングで正規化します。各項目で最良は 1.0、最悪は 0.0 になります。",
  },
  hiwEng2: { en: "Weight by profile", ja: "プロフィールで重み付け" },
  hiwEng2Desc: {
    en: "Each normalised dimension is multiplied by the preference weight derived from your selected profile (Budget / Health / Clean / Balanced). Dimensions with zero weight are skipped entirely.",
    ja: "正規化された各項目に、選択したプロフィール (予算/健康/成分/バランス) から算出された重みを乗じます。重み0の項目は完全にスキップされます。",
  },
  hiwEng3: { en: "Aggregate", ja: "集計" },
  hiwEng3Desc: {
    en: "Weighted sum ÷ sum of weights = final score in [0, 1]. Products with more missing data receive a small automatic penalty (-4% per critical missing field).",
    ja: "重み付き合計 ÷ 重みの合計 = [0, 1] 範囲の最終スコア。データが欠けている商品には自動で小さなペナルティ (重要項目1つにつき -4%) が適用されます。",
  },
  hiwEng4: { en: "Rank", ja: "ランク付け" },
  hiwEng4Desc: {
    en: "Sorted by descending final score. Ties are broken alphabetically — the ranking is always deterministic and reproducible.",
    ja: "最終スコアの降順で並べ替えます。同点の場合はアルファベット順 — ランキングは常に決定論的で再現可能です。",
  },
  hiwEng5: { en: "Explain", ja: "説明" },
  hiwEng5Desc: {
    en: "After ranking, the results are sent to Groq's Llama 3.3 70B model which generates a bilingual (Japanese + English) natural-language explanation grounded strictly in the actual product fields. The LLM cannot change the ranking — it only describes it.",
    ja: "ランキング完了後、結果を Groq の Llama 3.3 70B モデルに送信し、実際の商品データに厳密に基づくバイリンガル (日本語+英語) の自然言語による説明を生成します。LLMはランキングを変更できません — 説明するだけです。",
  },
  hiwDimensionsTitle: { en: "Scoring Dimensions", ja: "スコアリング項目" },
  hiwDimensionsIntro: {
    en: "Not every dimension applies to every category. For example, caffeine is scored for drinks but ignored for household items.",
    ja: "すべての項目がすべてのカテゴリに適用されるわけではありません。例えばカフェインは飲み物で採点されますが、日用品では無視されます。",
  },
  hiwMissingDataTitle: {
    en: "Missing Data",
    ja: "データ不足について",
  },
  hiwMissingData1: {
    en: "When a product's fields are missing (e.g. sugar content not listed), that dimension is excluded from scoring for all products — it is never set to zero, which would unfairly penalise the product.",
    ja: "商品のデータが欠けている場合 (例: 糖分が未記載)、その項目は全商品のスコアリングから除外されます — 0に設定すると商品を不当に低評価してしまうためです。",
  },
  hiwMissingData2: {
    en: "Each missing critical field applies a small penalty (-4%) to the final score, and all missing fields are listed clearly in the results so you can make an informed decision.",
    ja: "重要な項目が欠けている場合、最終スコアに小さなペナルティ (-4%) が適用され、欠けている項目は結果に明記されるので、情報に基づいた判断ができます。",
  },
  hiwMissingData3: {
    en: "This matters especially for products sourced from Open Food Facts, where data quality varies. We're honest about what we don't know rather than guessing.",
    ja: "これは特に Open Food Facts 由来の商品で重要です — データの質にばらつきがあるためです。推測せず、分からないことは正直に伝えます。",
  },
  hiwPrivacyTitle: { en: "Privacy", ja: "プライバシー" },
  hiwPrivacy1: {
    en: "Your profile and allergen list are stored locally in your browser (localStorage). Nothing about you is sent to a server or tracked.",
    ja: "プロフィールとアレルゲンリストはブラウザ内 (localStorage) に保存されます。あなたに関する情報がサーバーに送信されたり追跡されたりすることはありません。",
  },
  hiwPrivacy2: {
    en: "The only external calls are: Open Food Facts (public product data) and Groq (the LLM receives anonymized ranking data to write the summary — no user identifiers).",
    ja: "外部への通信は2つのみ: Open Food Facts (公開商品データ) と Groq (要約作成のため匿名化されたランキングデータを送信 — ユーザー識別子なし)。",
  },
  hiwTryButton: { en: "Try a Comparison", ja: "比較してみる" },
  hiwProfileButton: { en: "Set Up Profile", ja: "プロフィールを設定" },

  // Score breakdown helpers
  overall: { en: "overall", ja: "総合" },
} as const;

export type TranslationKey = keyof typeof translations;
