import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ProductKnowledge } from "../../../domain/intelligence/product-knowledge.ts";
import { matchProductKnowledge } from "../matcher.service.ts";
import type { VisionResult } from "../types/vision.types.ts";

const tenantId = "tenant-a";

function productKnowledge(overrides: Partial<ProductKnowledge> = {}): ProductKnowledge {
  return {
    id: "product-a",
    tenantId,
    category: "Electronics",
    subCategory: "Connectors",
    englishKeywords: ["splicing connector", "terminal block"],
    chineseKeywords: ["接线端子"],
    hsCode: "8544.42",
    avgUnitPriceCny: null,
    avgMoq: null,
    avgLeadTimeDays: null,
    avgWeightKg: null,
    avgCbmPerPiece: null,
    preferredSupplierId: null,
    orderCount: 0,
    lastOrderedAt: null,
    lastKnownPrice: null,
    lastPriceUpdatedAt: null,
    confidenceScore: 0.9,
    needsReview: false,
    createdAt: "2026-10-08T00:00:00.000Z",
    updatedAt: "2026-10-08T00:00:00.000Z",
    ...overrides,
  };
}

const visionQuery: VisionResult = {
  category: "Electrical",
  subCategory: "Connectors",
  material: "Copper",
  colors: [],
  chineseKeywords: ["接线端子"],
  englishKeywords: ["splicing", "connector", "terminal"],
  hsCode: "8544.42",
  confidence: 0.96,
};

describe("matchProductKnowledge", () => {
  it("ranks the closest product knowledge record first", () => {
    const exactMatch = productKnowledge({ id: "exact" });
    const partialMatch = productKnowledge({
      id: "partial",
      category: "Electronics",
      subCategory: "Cables",
      englishKeywords: ["usb cable"],
      chineseKeywords: [],
      hsCode: "8544.42",
    });

    const matches = matchProductKnowledge({ tenantId, query: visionQuery }, [
      partialMatch,
      exactMatch,
    ]);

    assert.equal(matches[0]?.product.id, "exact");
    assert.ok(matches[0]!.score > matches[1]!.score);
    assert.deepEqual(matches[0]?.signals, ["category", "subCategory", "hsCode", "keywords"]);
  });

  it("excludes records belonging to another tenant", () => {
    const otherTenantProduct = productKnowledge({ tenantId: "tenant-b" });

    assert.deepEqual(
      matchProductKnowledge({ tenantId, query: visionQuery }, [otherTenantProduct]),
      [],
    );
  });

  it("matches equivalent electrical and electronics categories", () => {
    const product = productKnowledge({ category: "Electronics" });

    const matches = matchProductKnowledge({ tenantId, query: visionQuery }, [product]);

    assert.equal(matches.length, 1);
    assert.ok(matches[0]?.signals.includes("category"));
  });

  it("does not award optional-signal points when query fields are absent", () => {
    const query: VisionResult = {
      ...visionQuery,
      subCategory: undefined,
      hsCode: undefined,
      englishKeywords: [],
      chineseKeywords: [],
    };

    const matches = matchProductKnowledge({ tenantId, query }, [productKnowledge()]);

    assert.equal(matches[0]?.score, 1);
    assert.deepEqual(matches[0]?.signals, ["category"]);
  });

  it("returns no match when there are no shared signals", () => {
    const product = productKnowledge({
      category: "Furniture",
      subCategory: "Chair",
      englishKeywords: ["wooden chair"],
      chineseKeywords: [],
      hsCode: "9403.20",
    });

    assert.deepEqual(matchProductKnowledge({ tenantId, query: visionQuery }, [product]), []);
  });
});
