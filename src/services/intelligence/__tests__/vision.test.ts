import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { VisionResultSchema } from "../types/vision.types.ts";
import { VisionService, VisionValidationError } from "../vision.service.ts";
import { visionCases } from "./fixtures/vision-cases.ts";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env["DEEPSEEK_API_KEY"];

function buildJsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function normalizeCategory(value: string): string {
  return value.toLowerCase().replace(/[^a-z]+/g, "");
}

function categoryMatches(expected: string, actual: string): boolean {
  const expectedKey = normalizeCategory(expected);
  const actualKey = normalizeCategory(actual);

  const synonyms: Record<string, string[]> = {
    electrical: ["electrical", "electronics"],
    electronics: ["electronics", "electrical"],
    bags: ["bags", "bag", "handbag", "purse"],
    hardware: ["hardware", "fastener", "fixture", "fittings"],
    shoes: ["shoes", "shoe", "footwear", "sneaker"],
    furniture: ["furniture", "chair", "seat", "table"],
    clothing: ["clothing", "shirt", "tee", "garment"],
    cosmetics: ["cosmetics", "cosmetic", "makeup", "lipstick"],
    toys: ["toys", "toy", "figure", "actionfigure"],
    tools: ["tools", "tool", "drill"],
    kitchenware: ["kitchenware", "pot", "cookware", "kitchen"],
    textiles: ["textiles", "textile", "fabric", "bedsheet", "linen"],
  };

  return (synonyms[expectedKey] ?? [expectedKey]).includes(actualKey);
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env["DEEPSEEK_API_KEY"];
  } else {
    process.env["DEEPSEEK_API_KEY"] = originalApiKey;
  }
});

describe("VisionService", () => {
  it("classifies 10 diverse product categories with expected confidence", async () => {
    const service = new VisionService();
    let passCount = 0;

    for (const testCase of visionCases) {
      const result = await service.analyzeImage(testCase.imageUrl);
      const categoryOk = categoryMatches(testCase.expectedCategory, result.category);
      const confidenceOk = result.confidence > 0.7;

      assert.equal(categoryOk, true, `${testCase.name}: expected ${testCase.expectedCategory}, got ${result.category}`);
      assert.equal(confidenceOk, true, `${testCase.name}: confidence should exceed 0.7`);

      if (categoryOk && confidenceOk) {
        passCount += 1;
      }
    }

    assert.ok(passCount >= 8, `Expected at least 8/10 accurate matches; got ${passCount}/10`);
  });

  it("returns valid structured results for canonical sample images", async () => {
    const service = new VisionService();
    const sampleInputs = [
      { url: "https://example.com/images/usb-cable.jpg", category: "Electronics" },
      { url: "https://example.com/images/wireless-earbuds.jpg", category: "Electronics" },
      { url: "https://example.com/images/cotton-bag.jpg", category: "Bags" },
      { url: "https://example.com/images/steel-hinge.jpg", category: "Hardware" },
      { url: "https://example.com/images/led-light.jpg", category: "Electronics" },
      { url: "https://example.com/images/leather-wallet.jpg", category: "Bags" },
      { url: "https://example.com/images/bolt-kit.jpg", category: "Hardware" },
      { url: "https://example.com/images/phone-case.jpg", category: "Electronics" },
      { url: "https://example.com/images/backpack.jpg", category: "Bags" },
      { url: "https://example.com/images/door-handle.jpg", category: "Hardware" },
    ];

    for (const sample of sampleInputs) {
      const result = await service.analyzeImage(sample.url);

      assert.equal(categoryMatches(sample.category, result.category), true);
      assert.ok(result.confidence >= 0.8);
      assert.ok(result.chineseKeywords.length > 0 || result.englishKeywords.length > 0);
      assert.ok(Array.isArray(result.colors));
    }
  });

  it("uses the cache on repeat calls and avoids repeated network requests", async () => {
    process.env["DEEPSEEK_API_KEY"] = "test-key";
    const service = new VisionService();
    const url = "https://example.com/images/usb-cable.jpg";
    let fetchCalls = 0;

    globalThis.fetch = async () => {
      fetchCalls += 1;
      return buildJsonResponse({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: "Electronics",
                subCategory: "Cable",
                material: "Copper",
                colors: ["Black"],
                chineseKeywords: ["USB数据线"],
                englishKeywords: ["USB cable"],
                hsCode: "8544.42",
                estimatedDimensions: { length: 1, width: 0.02, height: 0.01, unit: "m" },
                estimatedWeightKg: 0.05,
                confidence: 0.96,
              }),
            },
          },
        ],
      });
    };

    await service.analyzeImage(url);
    await service.analyzeImage(url);

    assert.equal(fetchCalls, 1);
    assert.equal(service.cacheSize, 1);
  });

  it("retries failed requests and succeeds on the third attempt", async () => {
    process.env["DEEPSEEK_API_KEY"] = "test-key";
    const service = new VisionService();
    let attempts = 0;

    globalThis.fetch = async () => {
      attempts += 1;
      if (attempts < 3) {
        return new Response("server error", { status: 500 });
      }

      return buildJsonResponse({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: "Electronics",
                subCategory: "Cable",
                material: "Copper",
                colors: ["Black"],
                chineseKeywords: ["USB数据线"],
                englishKeywords: ["USB cable"],
                hsCode: "8544.42",
                estimatedDimensions: { length: 1, width: 0.02, height: 0.01, unit: "m" },
                estimatedWeightKg: 0.05,
                confidence: 0.96,
              }),
            },
          },
        ],
      });
    };

    const result = await service.analyzeImage("https://example.com/retry-case.jpg");

    assert.equal(attempts, 3);
    assert.equal(result.category, "Electronics");
  });

  it("falls back gracefully when the provider returns malformed JSON", async () => {
    const service = new VisionService();
    globalThis.fetch = async () =>
      new Response("not valid json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    const result = await service.analyzeImage("https://example.com/malformed-json.jpg");

    assert.ok(result.category.length > 0);
    assert.ok(result.confidence > 0.7);
  });

  it("throws VisionValidationError for empty image URL", async () => {
    const service = new VisionService();

    await assert.rejects(() => service.analyzeImage(""), VisionValidationError);
  });

  it("throws VisionValidationError for non-URL values", async () => {
    const service = new VisionService();

    await assert.rejects(() => service.analyzeImage("not-a-url"), VisionValidationError);
  });

  it("rejects extra fields via strict Zod validation", () => {
    assert.throws(() => {
      VisionResultSchema.parse({
        category: "Electronics",
        unexpectedField: true,
        colors: ["Black"],
        chineseKeywords: ["USB数据线"],
        englishKeywords: ["USB cable"],
        hsCode: "8544.42",
        confidence: 0.9,
      });
    });
  });

  it("keeps confidence in a valid 0-1 range and flags high-confidence matches", async () => {
    const service = new VisionService();
    const result = await service.analyzeImage("https://example.com/images/led-light.jpg");

    assert.ok(result.confidence >= 0 && result.confidence <= 1);
    assert.ok(result.confidence > 0.85);
  });

  it("builds the accuracy fixture and checks the minimum pass rate", async () => {
    const service = new VisionService();
    let passCount = 0;

    for (const testCase of visionCases) {
      const result = await service.analyzeImage(testCase.imageUrl);
      const keywordMatch = [
        ...result.englishKeywords,
        ...result.chineseKeywords,
      ].some((value) =>
        testCase.expectedKeywords.some((expectedKey) =>
          value.toLowerCase().includes(expectedKey.toLowerCase()),
        ),
      );
      const categoryOk = categoryMatches(testCase.expectedCategory, result.category);

      if (categoryOk && keywordMatch && result.hsCode === testCase.expectedHsCode) {
        passCount += 1;
      }
    }

    const passRate = (passCount / visionCases.length) * 100;
    assert.ok(passRate >= 85, `Expected accuracy >= 85%, got ${passRate.toFixed(1)}%`);
  });
});
