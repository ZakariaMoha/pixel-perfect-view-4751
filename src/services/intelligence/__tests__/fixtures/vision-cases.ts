export type VisionFixtureCase = {
  name: string;
  imageUrl: string;
  expectedCategory: string;
  expectedKeywords: string[];
  expectedHsCode: string;
};

export const visionCases: VisionFixtureCase[] = [
  {
    name: "Splicing Kit M11",
    imageUrl: "data:image/webp;base64,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",
    expectedCategory: "electrical",
    expectedKeywords: ["splicing", "connector", "terminal"],
    expectedHsCode: "8544.42",
  },
  {
    name: "Handbag",
    imageUrl: "https://example.com/handbag.jpg",
    expectedCategory: "bags",
    expectedKeywords: ["handbag", "purse", "carry"],
    expectedHsCode: "4202.92",
  },
  {
    name: "Sneakers",
    imageUrl: "https://example.com/sneakers.jpg",
    expectedCategory: "shoes",
    expectedKeywords: ["shoe", "sneaker", "athletic"],
    expectedHsCode: "6404.11",
  },
  {
    name: "Chair",
    imageUrl: "https://example.com/chair.jpg",
    expectedCategory: "furniture",
    expectedKeywords: ["chair", "seating", "wooden"],
    expectedHsCode: "9403.20",
  },
  {
    name: "T-shirt",
    imageUrl: "https://example.com/tshirt.jpg",
    expectedCategory: "clothing",
    expectedKeywords: ["shirt", "cotton", "tee"],
    expectedHsCode: "6109.10",
  },
  {
    name: "Lipstick",
    imageUrl: "https://example.com/lipstick.jpg",
    expectedCategory: "cosmetics",
    expectedKeywords: ["lipstick", "cosmetic", "makeup"],
    expectedHsCode: "3304.99",
  },
  {
    name: "Action Figure",
    imageUrl: "https://example.com/action-figure.jpg",
    expectedCategory: "toys",
    expectedKeywords: ["toy", "figure", "action"],
    expectedHsCode: "9503.00",
  },
  {
    name: "Drill",
    imageUrl: "https://example.com/drill.jpg",
    expectedCategory: "tools",
    expectedKeywords: ["drill", "tool", "power"],
    expectedHsCode: "8207.40",
  },
  {
    name: "Cooking Pot",
    imageUrl: "https://example.com/pot.jpg",
    expectedCategory: "kitchenware",
    expectedKeywords: ["pot", "cookware", "kitchen"],
    expectedHsCode: "7615.10",
  },
  {
    name: "Bedsheet",
    imageUrl: "https://example.com/bedsheet.jpg",
    expectedCategory: "textiles",
    expectedKeywords: ["sheet", "textile", "linen"],
    expectedHsCode: "6302.31",
  },
];
