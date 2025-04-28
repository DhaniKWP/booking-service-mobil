const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const OTP = require('../models/otp.js');
const { sendOTP } = require('../services/emailService.js');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashPassword, isVerified: false });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit expired

    await OTP.create({ email, otp, expiresAt });

    await sendOTP(email, otp);

    res.status(201).json({ message: 'User terdaftar. Cek email untuk OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Register gagal' });
  }
};

// Verifikasi OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const validOtp = await OTP.findOne({ where: { email, otp } });

    if (!validOtp) return res.status(400).json({ error: 'OTP tidak valid' });

    if (validOtp.expiresAt < new Date()) return res.status(400).json({ error: 'OTP Expired' });

    await User.update({ isVerified: true }, { where: { email } });
    await OTP.destroy({ where: { email } });

    res.json({ message: 'Verifikasi berhasil' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verifikasi gagal' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    if (!user.isVerified) return res.status(400).json({ error: 'User belum verifikasi' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Password salah' });

    res.json({ message: 'Login berhasil' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login gagal' });
  }
};
