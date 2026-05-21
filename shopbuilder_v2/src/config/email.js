const nodemailer = require("nodemailer");
const env = require("./env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD.replace(/\s/g, ""),
    },
  });

  return transporter;
}

module.exports = { getTransporter };