// Focused test to verify LLM-generated bilingual explanations are live
const BASE = "http://localhost:3000/api";

const res = await fetch(`${BASE}/quick-compare`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    productIds: ["drink-002", "drink-004"],
    profile: "health",
    allergens: [],
  }),
});

if (!res.ok) {
  console.error("HTTP", res.status);
  console.error(await res.text());
  process.exit(1);
}

const data = await res.json();

console.log("═".repeat(70));
console.log("🤖 LLM Processing Mode:", data.processingMode);
console.log("═".repeat(70));
console.log();
console.log("🏆 Winner:", data.bestMatch);
console.log(`   Score: ${(data.rankedResults[0].score * 100).toFixed(0)}%`);
console.log();
console.log("📊 Ranking:");
for (const r of data.rankedResults) {
  console.log(`   #${r.rank} ${r.productName} — ${(r.score * 100).toFixed(0)}%`);
}
console.log();
console.log("─".repeat(70));
console.log("🇬🇧 English Summary:");
console.log("─".repeat(70));
console.log(data.summaryEn);
console.log();
console.log("─".repeat(70));
console.log("🇯🇵 Japanese Summary:");
console.log("─".repeat(70));
console.log(data.summaryJa);
console.log();
console.log("═".repeat(70));

if (data.processingMode === "live") {
  console.log("✅ SUCCESS — Groq LLM is generating live explanations!");
} else if (data.processingMode === "fallback") {
  console.log("⚠️  STILL IN FALLBACK — GROQ_API_KEY not loaded or API call failed");
} else {
  console.log("❓ Unknown processing mode:", data.processingMode);
}
