require("../config/env");
const { connection } = require("./queue");
const { startEmailWorker } = require("./emailWorker");
const { startWebhookWorker } = require("./webhookWorker");
const logger = require("../utils/logger");

const emailWorker = startEmailWorker(connection);
const webhookWorker = startWebhookWorker(connection);

logger.info("Workers started: email, webhook");

process.on("SIGTERM", async () => {
  await emailWorker.close();
  await webhookWorker.close();
  process.exit(0);
});
