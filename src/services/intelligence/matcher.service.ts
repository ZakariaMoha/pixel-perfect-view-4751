import type { ProductKnowledge } from "../../domain/intelligence/product-knowledge.ts";
import type { VisionResult } from "./types/vision.types.ts";

export type ProductMatchSignal = "category" | "subCategory" | "hsCode" | "keywords";

export interface ProductMatchQuery {
  tenantId: string;
  query: Pick<
    VisionResult,
    "category" | "subCategory" | "hsCode" | "englishKeywords" | "chineseKeywords"
  >;
}

export interface ProductKnowledgeMatch {
  product: ProductKnowledge;
  score: number;
  signals: ProductMatchSignal[];
}

const weights: Record<ProductMatchSignal, number> = {
  category: 0.4,
  subCategory: 0.15,
  hsCode: 0.25,
  keywords: 0.2,
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function normalizeCategory(value: string): string {
  const category = normalize(value);
  return category === "electrical" || category === "electronics" ? "electrical" : category;
}

function tokenize(values: readonly string[]): Set<string> {
  return new Set(values.flatMap((value) => value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []));
}

function scoreProduct(
  product: ProductKnowledge,
  query: ProductMatchQuery["query"],
): Omit<ProductKnowledgeMatch, "product"> {
  let score = 0;
  let applicableWeight = 0;
  const signals: ProductMatchSignal[] = [];

  applicableWeight += weights.category;
  if (normalizeCategory(product.category) === normalizeCategory(query.category)) {
    score += weights.category;
    signals.push("category");
  }

  if (query.subCategory) {
    applicableWeight += weights.subCategory;
    if (product.subCategory && normalize(product.subCategory) === normalize(query.subCategory)) {
      score += weights.subCategory;
      signals.push("subCategory");
    }
  }

  if (query.hsCode) {
    applicableWeight += weights.hsCode;
    if (product.hsCode && normalize(product.hsCode) === normalize(query.hsCode)) {
      score += weights.hsCode;
      signals.push("hsCode");
    }
  }

  const queryKeywords = tokenize([...query.englishKeywords, ...query.chineseKeywords]);
  if (queryKeywords.size > 0) {
    applicableWeight += weights.keywords;
    const productKeywords = tokenize([...product.englishKeywords, ...product.chineseKeywords]);
    const matchedKeywords = [...queryKeywords].filter((keyword) => productKeywords.has(keyword));

    if (matchedKeywords.length > 0) {
      score += weights.keywords * (matchedKeywords.length / queryKeywords.size);
      signals.push("keywords");
    }
  }

  return {
    score: Number((score / applicableWeight).toFixed(4)),
    signals,
  };
}

export function matchProductKnowledge(
  request: ProductMatchQuery,
  products: readonly ProductKnowledge[],
): ProductKnowledgeMatch[] {
  return products
    .filter((product) => product.tenantId === request.tenantId)
    .map((product) => ({
      product,
      ...scoreProduct(product, request.query),
    }))
    .filter((match) => match.score > 0)
    .sort(
      (left, right) => right.score - left.score || left.product.id.localeCompare(right.product.id),
    );
}
