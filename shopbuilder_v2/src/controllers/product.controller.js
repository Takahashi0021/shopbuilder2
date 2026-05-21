const productService = require("../services/product.service");
const { success, error, paginated } = require("../utils/response");

function getTenantId(req) {
  return req.user.tenantId || req.query.tenantId || req.body.tenantId;
}

async function create(req, res, next) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return error(res, "Merchant account required", 403);
    const { tenantId: _, ...body } = req.body;
    const product = await productService.createProduct({ ...body, tenantId });
    return success(res, { product }, 201);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return error(res, "Merchant account required", 403);
    const { cursor, limit } = req.query;
    const result = await productService.listProducts({
      tenantId,
      cursor,
      limit: limit ? parseInt(limit) : 20,
    });
    return paginated(res, result.items, result.nextCursor, result.total);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return error(res, "Merchant account required", 403);
    const product = await productService.getProduct(req.params.productId, tenantId);
    return success(res, { product });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return error(res, "Merchant account required", 403);
    const { tenantId: _, ...body } = req.body;
    const product = await productService.updateProduct(req.params.productId, tenantId, body);
    return success(res, { product });
  } catch (err) {
    next(err);
  }
}

async function generateVariants(req, res, next) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return error(res, "Merchant account required", 403);
    const { tenantId: _, ...body } = req.body;
    const variants = await productService.generateVariants(
      req.params.productId,
      tenantId,
      body
    );
    return success(res, { variants, count: variants.length }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateStock(req, res, next) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return error(res, "Merchant account required", 403);
    const { delta } = req.body;
    if (typeof delta !== "number") return error(res, "delta must be a number", 422);
    const variant = await productService.updateVariantStock(req.params.variantId, tenantId, delta);
    return success(res, { variant });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update, generateVariants, updateStock };