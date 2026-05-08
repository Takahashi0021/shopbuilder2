const { Queue } = require("bullmq");
const env = require("../config/env");

const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
};

const emailQueue = new Queue("email", { connection });
const webhookQueue = new Queue("webhook", { connection });

async function addEmailJob(type, data) {
  return emailQueue.add(type, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
}

async function addWebhookJob(data) {
  return webhookQueue.add("dispatch", data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
  });
}

module.exports = { emailQueue, webhookQueue, addEmailJob, addWebhookJob, connection };
