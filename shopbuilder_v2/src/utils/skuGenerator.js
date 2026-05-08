function generateVariantMatrix(productId, attributes) {
  const { sizes = [], colors = [], materials = [] } = attributes;

  if (!sizes.length && !colors.length && !materials.length) {
    throw new Error("At least one attribute dimension required");
  }

  const dimensions = [];
  if (sizes.length) dimensions.push(sizes.map((s) => ({ type: "size", value: s })));
  if (colors.length) dimensions.push(colors.map((c) => ({ type: "color", value: c })));
  if (materials.length) dimensions.push(materials.map((m) => ({ type: "material", value: m })));

  const combinations = cartesianProduct(dimensions);

  return combinations.map((combo) => {
    const parts = [productId.slice(0, 8).toUpperCase()];
    const variant = { productId };

    for (const attr of combo) {
      parts.push(attr.value.toUpperCase().replace(/\s+/g, "-").slice(0, 6));
      variant[attr.type] = attr.value;
    }

    variant.sku = parts.join("-");
    return variant;
  });
}

function cartesianProduct(arrays) {
  return arrays.reduce(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]]
  );
}

module.exports = { generateVariantMatrix };
