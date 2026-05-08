const { Worker } = require("bullmq");
const prisma = require("../config/database");
const logger = require("../utils/logger");

function startWebhookWorker(connection) {
  const worker = new Worker(
    "webhook",
    async (job) => {
      const { webhookId, event, payload } = job.data;

      const webhook = await prisma.webhook.findUnique({ where: { id: webhookId } });
      if (!webhook || !webhook.isActive) return;

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ShopBuilder-Event": event,
          "X-ShopBuilder-Secret": webhook.secret,
        },
        body: JSON.stringify(payload),
      });

      await prisma.webhook.update({
        where: { id: webhookId },
        data: {
          lastStatus: response.status,
          retryCount: { increment: 1 },
        },
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      logger.info(`Webhook ${webhookId} delivered: ${response.status}`);
    },
    { connection }
  );

  worker.on("failed", async (job, err) => {
    logger.error(`Webhook job failed: ${err.message}`);
    if (job.data.webhookId) {
      const delay = Math.pow(2, job.attemptsMade) * 5000;
      await prisma.webhook.update({
        where: { id: job.data.webhookId },
        data: { nextRetryAt: new Date(Date.now() + delay) },
      });
    }
  });

  return worker;
}

module.exports = { startWebhookWorker };
