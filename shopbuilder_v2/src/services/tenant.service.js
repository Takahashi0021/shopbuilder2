const { v4: uuidv4 } = require("uuid");
const prisma = require("../config/database");
const { getTenantClient } = require("../config/tenantConnections");
const env = require("../config/env");

const MOCK_TENANT_DBS = {
  merchant1: env.MERCHANT_1_DB_URL || env.DATABASE_URL,
  merchant2: env.MERCHANT_2_DB_URL || env.DATABASE_URL,
};

async function onboardTenant({ name, slug, ownerId, dbUrl }) {
  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    const err = new Error("Tenant slug already taken");
    err.statusCode = 409;
    throw err;
  }

  const resolvedDbUrl = dbUrl || MOCK_TENANT_DBS[slug] || env.DATABASE_URL;

  const tenant = await prisma.$transaction(async (tx) => {
    const t = await tx.tenant.create({
      data: { name, slug, ownerId, dbUrl: resolvedDbUrl },
    });
    await tx.user.update({
      where: { id: ownerId },
      data: { tenantId: t.id, role: "MERCHANT" },
    });
    return t;
  });

  return tenant;
}

async function getTenant(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, slug: true, status: true, createdAt: true },
  });
  if (!tenant) {
    const err = new Error("Tenant not found");
    err.statusCode = 404;
    throw err;
  }
  return tenant;
}

function getTenantConnection(tenant) {
  return getTenantClient(tenant.dbUrl, tenant.id);
}

async function createWebhook({ tenantId, url, eventType }) {
  const secret = uuidv4();
  const webhook = await prisma.webhook.create({
    data: { tenantId, url, eventType, secret },
  });
  return webhook;
}

async function listWebhooks(tenantId) {
  return prisma.webhook.findMany({
    where: { tenantId, isActive: true },
    select: { id: true, url: true, eventType: true, retryCount: true, lastStatus: true, createdAt: true },
  });
}

module.exports = { onboardTenant, getTenant, getTenantConnection, createWebhook, listWebhooks };
