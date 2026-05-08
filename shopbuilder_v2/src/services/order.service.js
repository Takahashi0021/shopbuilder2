const prisma = require("../config/database");
const { addEmailJob, addWebhookJob } = require("../workers/queue");

async function createOrder({ tenantId, customerId, items, notes }) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant || tenant.status !== "ACTIVE") {
    const err = new Error("Store not available");
    err.statusCode = 404;
    throw err;
  }

  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, product: { tenantId, isActive: true } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    const err = new Error("One or more products not found or unavailable");
    err.statusCode = 404;
    throw err;
  }

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (variant.stock < item.quantity) {
      const err = new Error(`Insufficient stock for SKU: ${variant.sku}`);
      err.statusCode = 409;
      throw err;
    }
  }

  let totalAmount = 0;
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    totalAmount += parseFloat(variant.price) * item.quantity;
  }

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        tenantId,
        customerId,
        totalAmount,
        notes,
        items: {
          create: items.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId);
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: variant.price,
            };
          }),
        },
      },
      include: { items: { include: { variant: true } }, customer: true },
    });

    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return o;
  });

  const customer = await prisma.user.findUnique({ where: { id: customerId } });

  await addEmailJob("order_confirmed", {
    to: customer.email,
    type: "order_confirmed",
    data: {
      orderId: order.id.slice(0, 8).toUpperCase(),
      totalAmount: totalAmount.toFixed(2),
      itemCount: items.length,
      shopName: tenant.name,
    },
  });

  const webhooks = await prisma.webhook.findMany({
    where: { tenantId, eventType: "ORDER_CREATED", isActive: true },
  });

  for (const webhook of webhooks) {
    await addWebhookJob({
      webhookId: webhook.id,
      event: "ORDER_CREATED",
      payload: { orderId: order.id, totalAmount, customerId },
    });
  }

  return order;
}

async function listOrders({ tenantId, customerId, cursor, limit = 20 }) {
  const take = Math.min(limit, 100);
  const where = { tenantId };
  if (customerId) where.customerId = customerId;

  const orders = await prisma.order.findMany({
    where,
    take: take + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: { items: { include: { variant: true } }, customer: { select: { email: true, username: true } } },
  });

  const hasMore = orders.length > take;
  const items = hasMore ? orders.slice(0, take) : orders;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

async function getOrder(orderId, userId, role) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: true } }, customer: true, tenant: true },
  });

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  if (role === "CUSTOMER" && order.customerId !== userId) {
    const err = new Error("Access denied");
    err.statusCode = 403;
    throw err;
  }

  return order;
}

async function updateOrderStatus(orderId, tenantId, status) {
  const order = await prisma.order.findFirst({ where: { id: orderId, tenantId } });
  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { customer: true },
  });

  await addEmailJob("order_status_update", {
    to: updated.customer.email,
    type: "order_status_update",
    data: { orderId: orderId.slice(0, 8).toUpperCase(), status },
  });

  const webhooks = await prisma.webhook.findMany({
    where: { tenantId, eventType: "ORDER_UPDATED", isActive: true },
  });

  for (const webhook of webhooks) {
    await addWebhookJob({
      webhookId: webhook.id,
      event: "ORDER_UPDATED",
      payload: { orderId, status },
    });
  }

  return updated;
}

module.exports = { createOrder, listOrders, getOrder, updateOrderStatus };
