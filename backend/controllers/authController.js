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
    // Cek kalau email sudah ada
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashPassword, isVerified: false });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit expired

    await OTP.create({ email, otp, expiresAt });

    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error('Gagal kirim OTP:', emailError.message);
      return res.status(500).json({ error: 'Gagal kirim OTP ke email.' });
    }

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
    const otpRecord = await OTP.findOne({ where: { email, otp } });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Kode OTP salah atau tidak ditemukan.' });
    }

    // Cek expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Kode OTP sudah kadaluarsa.' });
    }

    // Update user menjadi verified
    await User.update({ isVerified: true }, { where: { email } });

    // Hapus OTP setelah sukses
    await OTP.destroy({ where: { email } });

    res.status(200).json({ message: 'Verifikasi OTP berhasil.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verifikasi OTP gagal.' });
  }
};


// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });

    // Kalau user tidak ada
    if (!user) {
      return res.status(400).json({ error: 'Email belum terdaftar.' });
    }

    // Kalau user belum verifikasi
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Akun belum diverifikasi. Silakan cek email untuk OTP.' });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email atau password salah.' });
    }

    // Kalau semua cocok
    res.status(200).json({ message: 'Login berhasil.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login gagal.' });
  }
};

