const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: `"WIJAYA MOTOR" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Kode OTP Verifikasi - WIJAYA MOTOR',
    text: `Halo,

Kode OTP Anda untuk verifikasi di Website WIJAYA MOTOR adalah: ${otp}

Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari WIJAYA MOTOR.

Terima kasih telah menggunakan layanan kami.

Salam,
Tim Keamanan WIJAYA MOTOR`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #003366; margin: 0;">Verifikasi Akun Anda</h2>
          <p style="color: #555; font-size: 16px; margin-top: 8px;">Kode OTP dari <strong>Website WIJAYA MOTOR</strong></p>
        </div>
        <div style="background-color: #f0f4f8; padding: 20px; border-radius: 10px; text-align: center;">
          <span style="font-size: 36px; font-weight: bold; color: #003366; letter-spacing: 4px;">${otp}</span>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          Demi keamanan Anda, <strong>jangan bagikan kode ini</strong> kepada siapa pun, termasuk pihak yang mengaku dari WIJAYA MOTOR. Kami tidak akan pernah meminta kode ini secara langsung.
        </p>
        <p style="font-size: 14px; color: #999; margin-top: 10px;">
          Jika Anda tidak meminta kode ini, abaikan email ini atau hubungi kami melalui layanan pelanggan.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          Terima kasih telah menggunakan layanan kami.<br><br>
          Hormat kami,<br>
          <strong>Tim Keamanan WIJAYA MOTOR</strong>
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTP };
