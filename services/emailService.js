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

async function sendResetLink(email, token) {
  // const resetUrl = `https://b1e7-2404-c0-2420-00-adb-a81b.ngrok-free.app/reset-password.html?token=${token}`;
  const resetUrl = `https://wijayamotor.ti24se3.my.id/reset-password.html?token=${token}`;

  const mailOptions = {
    from: `"WIJAYA MOTOR" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Password Anda - WIJAYA MOTOR',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #d32f2f;">WIJAYA MOTOR</h2>
          <p>Halo,</p>
          <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
          <p>Silakan klik tombol di bawah ini untuk membuat password baru Anda:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #d32f2f; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Reset Password</a>
          </p>
          <p>Atau salin dan tempel link berikut ke browser Anda jika tombol di atas tidak berfungsi:</p>
          <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
          <p><strong>Catatan:</strong> Link ini hanya berlaku selama 10 menit.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
          <br>
          <p>Salam hangat,</p>
          <p><em>Tim WIJAYA MOTOR</em></p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTP, sendResetLink };
