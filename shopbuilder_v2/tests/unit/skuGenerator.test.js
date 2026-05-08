const { generateVariantMatrix } = require("../../src/utils/skuGenerator");

describe("generateVariantMatrix", () => {
  const productId = "550e8400-e29b-41d4-a716-446655440000";

  test("generates correct number of combinations for Size x Color", () => {
    const variants = generateVariantMatrix(productId, {
      sizes: ["S", "M", "L"],
      colors: ["Red", "Blue"],
    });
    expect(variants).toHaveLength(6);
  });

  test("generates correct SKUs for Size x Color x Material", () => {
    const variants = generateVariantMatrix(productId, {
      sizes: ["S"],
      colors: ["Red"],
      materials: ["Cotton"],
    });
    expect(variants).toHaveLength(1);
    expect(variants[0].sku).toContain("550E8400");
    expect(variants[0].size).toBe("S");
    expect(variants[0].color).toBe("Red");
    expect(variants[0].material).toBe("Cotton");
  });

  test("generates only size variants when only sizes provided", () => {
    const variants = generateVariantMatrix(productId, { sizes: ["S", "M", "L", "XL"] });
    expect(variants).toHaveLength(4);
    variants.forEach((v) => expect(v.size).toBeDefined());
  });

  test("throws when no attributes provided", () => {
    expect(() => generateVariantMatrix(productId, {})).toThrow();
  });

  test("SKUs are unique across all combinations", () => {
    const variants = generateVariantMatrix(productId, {
      sizes: ["S", "M", "L"],
      colors: ["Red", "Blue", "Green"],
      materials: ["Cotton", "Polyester"],
    });
    expect(variants).toHaveLength(18);
    const skus = variants.map((v) => v.sku);
    const uniqueSkus = new Set(skus);
    expect(uniqueSkus.size).toBe(18);
  });
});
