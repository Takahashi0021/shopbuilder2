const orderService = require("../services/order.service");
const prisma = require("../config/database");
const { success, error, paginated } = require("../utils/response");

async function createBySlug(req, res, next) {
  try {
    const { tenantSlug } = req.params;
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) return error(res, "Store not found", 404);

    const order = await orderService.createOrder({
      tenantId: tenant.id,
      customerId: req.user.userId,
      items: req.body.items,
      notes: req.body.notes,
    });
    return success(res, { order }, 201);
  } catch (err) { next(err); }
}

async function listOrders(req, res, next) {
  try {
    const { cursor, limit } = req.query;
    const isCustomer = req.user.role === "CUSTOMER";

    const result = await orderService.listOrders({
      tenantId: req.user.tenantId,
      customerId: isCustomer ? req.user.userId : undefined,
      cursor,
      limit: limit ? parseInt(limit) : 20,
    });
    return paginated(res, result.items, result.nextCursor, result.items.length);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const order = await orderService.getOrder(req.params.orderId, req.user.userId, req.user.role);
    return success(res, { order });
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    if (!req.user.tenantId) return error(res, "Merchant account required", 403);
    const order = await orderService.updateOrderStatus(
      req.params.orderId,
      req.user.tenantId,
      req.body.status
    );
    return success(res, { order });
  } catch (err) { next(err); }
}

module.exports = { createBySlug, listOrders, getOne, updateStatus };
