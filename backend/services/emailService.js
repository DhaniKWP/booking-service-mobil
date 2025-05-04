const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,            
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,  // dari .env
    pass: process.env.EMAIL_PASS   
  }
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verifikasi OTP',
    text: `Kode OTP kamu adalah ${otp}. Jangan kasih ke siapa pun ya!`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTP };
