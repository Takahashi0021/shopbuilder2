require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
  },
});

transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: process.env.GMAIL_USER,
  subject: 'ShopBuilder Test',
  html: '<h1>Test email works!</h1>',
}, (err, info) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Email sent:', info.response);
  }
});
