const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'GMAIL_LO',       // ganti
    pass: 'PASSWORD_GMAIL'  // ganti, kalau pakai 2FA harus App Password
  }
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: 'GMAIL_LO',
    to: email,
    subject: 'Verifikasi OTP',
    text: `Kode OTP kamu adalah ${otp}. Jangan kasih ke siapa pun ya!`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTP };
