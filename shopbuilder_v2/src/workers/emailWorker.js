const { Worker } = require("bullmq");
const { getTransporter } = require("../config/email");
const env = require("../config/env");
const logger = require("../utils/logger");

const templates = {
  verify_email: (data) => ({
    subject: "Verify your ShopBuilder account",
    html: `<h2>Welcome to ShopBuilder!</h2>
           <p>Click the link below to verify your email:</p>
           <a href="${env.APP_URL}/api/v1/auth/verify-email?token=${data.token}">
             Verify Email
           </a>
           <p>Link expires in 24 hours.</p>`,
  }),
  password_reset: (data) => ({
    subject: "Reset your ShopBuilder password",
    html: `<h2>Password Reset Request</h2>
           <p>Click the link below to reset your password:</p>
           <a href="${env.APP_URL}/api/v1/auth/reset-password?token=${data.token}">
             Reset Password
           </a>
           <p>Link expires in 1 hour.</p>`,
  }),
  order_confirmed: (data) => ({
    subject: `Order Confirmed - #${data.orderId}`,
    html: `<h2>Your order is confirmed!</h2>
           <p>Order ID: <strong>${data.orderId}</strong></p>
           <p>Total: <strong>$${data.totalAmount}</strong></p>
           <p>Items: ${data.itemCount}</p>
           <p>Thank you for shopping at ${data.shopName}!</p>`,
  }),
  order_status_update: (data) => ({
    subject: `Order #${data.orderId} - Status Updated`,
    html: `<h2>Order Status Update</h2>
           <p>Your order <strong>#${data.orderId}</strong> status changed to: <strong>${data.status}</strong></p>`,
  }),
  tenant_suspended: (data) => ({
    subject: "Your ShopBuilder store has been suspended",
    html: `<h2>Store Suspended</h2>
           <p>Your store <strong>${data.shopName}</strong> has been suspended by admin.</p>
           <p>Reason: ${data.reason || "Policy violation"}</p>`,
  }),
};

function startEmailWorker(connection) {
  const worker = new Worker(
    "email",
    async (job) => {
      const { to, type, data } = job.data;
      const template = templates[type];

      if (!template) {
        throw new Error(`Unknown email template: ${type}`);
      }

      const { subject, html } = template(data);
      const transporter = getTransporter();

      await transporter.sendMail({
        from: env.EMAIL_FROM || "ShopBuilder <noreply@shopbuilder.com>",
        to,
        subject,
        html,
      });

      logger.info(`Email sent: ${type} to ${to}`);
    },
    { connection, concurrency: 5 }
  );

  worker.on("completed", (job) => {
    logger.info(`Email job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`Email job ${job.id} failed: ${err.message}`);
  });

  return worker;
}

module.exports = { startEmailWorker };
