const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const OTP = require('../models/otp.js');
const jwt = require('jsonwebtoken'); // tambahkan ini di atas (jika belum)
const { sendOTP } = require('../services/emailService.js');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
exports.register = async (req, res) => {
  const { name, phone, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      phone,
      email,
      password: hashPassword,
      isVerified: false
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

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
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Email belum terdaftar.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: 'Akun belum diverifikasi. Silakan cek email untuk OTP.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email atau password salah.' });
    }

    // ✅ Buat token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret', // pakai .env kalau ada
      { expiresIn: '1d' }
    );

    // ✅ Kirim token + user info ke frontend
    res.status(200).json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login gagal.' });
  }
};