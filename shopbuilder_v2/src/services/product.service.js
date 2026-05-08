const prisma = require("../config/database");
const { generateVariantMatrix } = require("../utils/skuGenerator");

async function createProduct({ tenantId, name, description, basePrice, attributes }) {
  return prisma.product.create({
    data: { tenantId, name, description, basePrice, attributes },
  });
}

async function listProducts({ tenantId, cursor, limit = 20 }) {
  const take = Math.min(limit, 100);
  const where = { tenantId, isActive: true };

  const products = await prisma.product.findMany({
    where,
    take: take + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { variants: true } } },
  });

  const hasMore = products.length > take;
  const items = hasMore ? products.slice(0, take) : products;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor, total: items.length };
}

async function getProduct(productId, tenantId) {
  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
    include: { variants: true },
  });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  return product;
}

async function updateProduct(productId, tenantId, data) {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.product.update({ where: { id: productId }, data });
}

async function generateVariants(productId, tenantId, { sizes, colors, materials, basePrice, initialStock }) {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  const variants = generateVariantMatrix(productId, { sizes, colors, materials });

  if (!variants.length) {
    const err = new Error("No variant combinations generated");
    err.statusCode = 400;
    throw err;
  }

  const created = await prisma.$transaction(
    variants.map((v) =>
      prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          productId,
          sku: v.sku,
          size: v.size || null,
          color: v.color || null,
          material: v.material || null,
          price: basePrice,
          stock: initialStock,
        },
      })
    )
  );

  return created;
}

async function updateVariantStock(variantId, tenantId, delta) {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { tenantId } },
  });
  if (!variant) {
    const err = new Error("Variant not found");
    err.statusCode = 404;
    throw err;
  }

  const newStock = variant.stock + delta;
  if (newStock < 0) {
    const err = new Error("Insufficient stock");
    err.statusCode = 409;
    throw err;
  }

  return prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock },
  });
}

module.exports = { createProduct, listProducts, getProduct, updateProduct, generateVariants, updateVariantStock };
