const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ""),
  },
});

async function sendVerificationEmail(to, token, username) {
  const link = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your ShopBuilder account",
    html: `
      <h2>Welcome to ShopBuilder, ${username}!</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${link}" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Verify Email
      </a>
      <p>Or copy this link: ${link}</p>
      <p>Link expires in 24 hours.</p>
    `,
  });
}

async function sendPasswordResetEmail(to, token, username) {
  const link = `${process.env.APP_URL}/api/v1/auth/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your ShopBuilder password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${username}, click the link below to reset your password:</p>
      <a href="${link}" style="background:#2196F3;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Reset Password
      </a>
      <p>Or copy this link: ${link}</p>
      <p>Link expires in 1 hour.</p>
    `,
  });
}

async function sendOrderConfirmedEmail(to, data) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Order Confirmed - #${data.orderId}`,
    html: `
      <h2>Your order is confirmed!</h2>
      <p>Order ID: <strong>#${data.orderId}</strong></p>
      <p>Total: <strong>$${data.totalAmount}</strong></p>
      <p>Items: ${data.itemCount}</p>
      <p>Thank you for shopping at ${data.shopName}!</p>
    `,
  });
}

async function sendOrderStatusEmail(to, data) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Order #${data.orderId} - Status Updated to ${data.status}`,
    html: `
      <h2>Order Status Update</h2>
      <p>Your order <strong>#${data.orderId}</strong> is now: <strong>${data.status}</strong></p>
    `,
  });
}

async function sendTenantSuspendedEmail(to, data) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your ShopBuilder store has been suspended",
    html: `
      <h2>Store Suspended</h2>
      <p>Your store <strong>${data.shopName}</strong> has been suspended.</p>
      <p>Reason: ${data.reason || "Policy violation"}</p>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmedEmail,
  sendOrderStatusEmail,
  sendTenantSuspendedEmail,
};