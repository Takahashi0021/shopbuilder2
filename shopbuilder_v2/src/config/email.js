const nodemailer = require("nodemailer");
const env = require("./env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      ignoreTLS: true,
    });
  }

  return transporter;
}

module.exports = { getTransporter };
