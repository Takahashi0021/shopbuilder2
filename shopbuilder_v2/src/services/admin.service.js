const prisma = require("../config/database");
const { addEmailJob } = require("../workers/queue");

async function listAllTenants({ cursor, limit = 20 }) {
  const take = Math.min(limit, 100);
  const tenants = await prisma.tenant.findMany({
    take: take + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { email: true, username: true } },
      _count: { select: { products: true, orders: true } },
    },
  });

  const hasMore = tenants.length > take;
  const items = hasMore ? tenants.slice(0, take) : tenants;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

async function suspendTenant(tenantId, reason) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { owner: true },
  });

  if (!tenant) {
    const err = new Error("Tenant not found");
    err.statusCode = 404;
    throw err;
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: "SUSPENDED" },
  });

  const emailService = require("./email.service");
try {
  await emailService.sendTenantSuspendedEmail(tenant.owner.email, {
    shopName: tenant.name,
    reason,
  });
} catch (e) {
  console.error("Email error:", e.message);
}

  return { message: "Tenant suspended" };
}

async function activateTenant(tenantId) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    const err = new Error("Tenant not found");
    err.statusCode = 404;
    throw err;
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: "ACTIVE" },
  });

  return { message: "Tenant activated" };
}

async function listAllUsers({ cursor, limit = 20 }) {
  const take = Math.min(limit, 100);
  const users = await prisma.user.findMany({
    take: take + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, username: true, role: true, isEmailVerified: true, isActive: true, createdAt: true },
  });

  const hasMore = users.length > take;
  const items = hasMore ? users.slice(0, take) : users;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

async function deactivateUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  });

  return { message: "User deactivated" };
}

async function getDashboard() {
  const [totalUsers, totalTenants, totalOrders, totalProducts] = await Promise.all([
    prisma.user.count(),
    prisma.tenant.count(),
    prisma.order.count(),
    prisma.product.count(),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { email: true } }, tenant: { select: { name: true } } },
  });

  return { totalUsers, totalTenants, totalOrders, totalProducts, recentOrders };
}

module.exports = { listAllTenants, suspendTenant, activateTenant, listAllUsers, deactivateUser, getDashboard };
