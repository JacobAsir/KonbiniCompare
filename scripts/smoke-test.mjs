// Live smoke test for the KonbiniCompare API
// Tests all major endpoints and prints sample output

const BASE = "http://localhost:3000/api";

async function test(name, fn) {
  console.log(`\n▶ ${name}`);
  console.log("─".repeat(60));
  try {
    await fn();
    console.log("✓ PASS");
  } catch (err) {
    console.log("✗ FAIL:", err.message);
  }
}

async function getJson(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

// Test 1: Health check
await test("Health check", async () => {
  const data = await getJson("/healthz");
  console.log("Response:", data);
});

// Test 2: Get categories
await test("Get categories", async () => {
  const data = await getJson("/categories");
  console.log(`Categories: ${data.categories.length}`);
  for (const c of data.categories) {
    console.log(`  ${c.icon} ${c.name} (${c.nameJa}) - ${c.scoringDimensions.length} dimensions`);
  }
});

// Test 3: Search local catalog only
await test("Search: local product (green tea)", async () => {
  const data = await getJson("/search?q=green+tea");
  console.log(`Total results: ${data.total}`);
  for (const p of data.products.slice(0, 5)) {
    const source = p.id.startsWith("off-") ? "[OFF]" : "[LOCAL]";
    console.log(`  ${source} ${p.name} - ${p.brand || "?"} - ¥${p.priceJpy || "?"}`);
  }
});

// Test 4: Search that hits Open Food Facts
await test("Search: Open Food Facts (pocari sweat)", async () => {
  const data = await getJson("/search?q=pocari+sweat");
  console.log(`Total results: ${data.total}`);
  for (const p of data.products.slice(0, 5)) {
    const source = p.id.startsWith("off-") ? "[OFF]" : "[LOCAL]";
    console.log(`  ${source} ${p.name} - ${p.brand || "?"}`);
    if (p.nutrition) {
      const n = p.nutrition;
      console.log(`    Nutrition: ${n.calories || "?"}kcal, sugar ${n.sugar || "?"}g, sodium ${n.sodium || "?"}mg`);
    }
  }
});

// Test 5: Search with Japanese query
await test("Search: Japanese text (お茶)", async () => {
  const data = await getJson(`/search?q=${encodeURIComponent("お茶")}`);
  console.log(`Total results: ${data.total}`);
  for (const p of data.products.slice(0, 5)) {
    const source = p.id.startsWith("off-") ? "[OFF]" : "[LOCAL]";
    console.log(`  ${source} ${p.name} (${p.nameJa || "?"})`);
  }
});

// Test 6: Barcode lookup (Coca-Cola 500ml, a widely-cataloged barcode)
await test("Barcode lookup (5449000000996 - Coca-Cola)", async () => {
  const res = await fetch(`${BASE}/barcode/5449000000996`);
  if (res.status === 404) {
    console.log("Product not found (OK — OFF may not have this one)");
    return;
  }
  const data = await res.json();
  if (data.product) {
    console.log(`Product: ${data.product.name}`);
    console.log(`  Brand: ${data.product.brand}`);
    console.log(`  Category detected: ${data.product.category}`);
    console.log(`  Volume: ${data.product.volumeMl || "?"}ml`);
    if (data.product.nutrition) {
      console.log(`  Sugar: ${data.product.nutrition.sugar}g, Calories: ${data.product.nutrition.calories}kcal`);
    }
    console.log(`  Allergens: ${data.product.allergens.join(", ") || "none"}`);
    console.log(`  Additives (first 3): ${data.product.additives.slice(0, 3).join(", ") || "none"}`);
  }
});

// Test 7: Quick compare — 2 local drinks with "health" profile
await test("Quick compare: Ito En Green Tea vs Monster Energy (health profile)", async () => {
  const data = await postJson("/quick-compare", {
    productIds: ["drink-002", "drink-004"],
    profile: "health",
    allergens: [],
  });
  console.log(`Winner: ${data.bestMatch} (${(data.rankedResults[0].score * 100).toFixed(0)}%)`);
  console.log(`Processing: ${data.processingMode}`);
  console.log(`\nRanking:`);
  for (const r of data.rankedResults) {
    console.log(`  #${r.rank} ${r.productName}: ${(r.score * 100).toFixed(0)}%`);
    if (r.strengths.length > 0) console.log(`    Strengths: ${r.strengths.join(", ")}`);
    if (r.tradeoffs.length > 0) console.log(`    Trade-offs: ${r.tradeoffs.join(", ")}`);
  }
  console.log(`\nSummary EN: ${data.summaryEn.slice(0, 200)}...`);
});

// Test 8: Quick compare — same products with "budget" profile (should flip ranking)
await test("Quick compare: same products with budget profile", async () => {
  const data = await postJson("/quick-compare", {
    productIds: ["drink-002", "drink-004"],
    profile: "budget",
    allergens: [],
  });
  console.log(`Winner: ${data.bestMatch} (${(data.rankedResults[0].score * 100).toFixed(0)}%)`);
  console.log(`Ranking:`);
  for (const r of data.rankedResults) {
    console.log(`  #${r.rank} ${r.productName}: ${(r.score * 100).toFixed(0)}%`);
  }
});

// Test 9: Quick compare with allergen conflict
await test("Quick compare: snacks with milk allergen flag", async () => {
  const data = await postJson("/quick-compare", {
    productIds: ["snack-001", "snack-006"], // Jagarico (has milk) vs Salad Chicken
    profile: "health",
    allergens: ["milk"],
  });
  console.log(`Winner: ${data.bestMatch}`);
  for (const r of data.rankedResults) {
    console.log(`  #${r.rank} ${r.productName}: ${(r.score * 100).toFixed(0)}%`);
    if (r.cautions.length > 0) console.log(`    ⚠ Cautions: ${r.cautions.join(", ")}`);
  }
});

console.log("\n" + "═".repeat(60));
console.log("All tests complete.");
