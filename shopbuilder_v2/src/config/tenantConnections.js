const { PrismaClient } = require("@prisma/client");

const connectionPool = new Map();
const MAX_CONNECTIONS_PER_TENANT = 5;

function getTenantClient(dbUrl, tenantId) {
  if (connectionPool.has(tenantId)) {
    return connectionPool.get(tenantId);
  }

  if (connectionPool.size >= 20) {
    const firstKey = connectionPool.keys().next().value;
    const oldClient = connectionPool.get(firstKey);
    oldClient.$disconnect().catch(() => {});
    connectionPool.delete(firstKey);
  }

  const client = new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: ["error"],
    connection_limit: MAX_CONNECTIONS_PER_TENANT,
  });

  connectionPool.set(tenantId, client);
  return client;
}

async function disconnectAll() {
  for (const [, client] of connectionPool) {
    await client.$disconnect().catch(() => {});
  }
  connectionPool.clear();
}

process.on("beforeExit", disconnectAll);

module.exports = { getTenantClient, disconnectAll, connectionPool };
