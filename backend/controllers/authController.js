const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const OTP = require('../models/otp.js');
const jwt = require('jsonwebtoken'); // tambahkan ini di atas (jika belum)
const { sendOTP, sendResetLink } = require('../services/emailService.js');
const crypto = require('crypto');

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
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

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



// otp
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Cari OTP berdasarkan email saja
    const otpRecord = await OTP.findOne({ where: { email } });

    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP tidak ditemukan. Silakan minta ulang.' });
    }

    // Cek expired dulu
    if (otpRecord.expiresAt < new Date()) {
      await OTP.destroy({ where: { email } });

      const newOtp = generateOTP();
      const newExpiry = new Date(Date.now() + 1 * 60 * 1000);
      await OTP.create({ email, otp: newOtp, expiresAt: newExpiry });
      await sendOTP(email, newOtp);

      return res.status(410).json({ error: 'Kode OTP sudah kadaluarsa. OTP baru telah dikirim ke email Anda.' });
    }

    // Bandingkan OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Kode OTP salah.' });
    }

    // Verifikasi berhasil
    await User.update({ isVerified: true }, { where: { email } });
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

// LUPA PASSWORD - Kirim Link
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Email tidak ditemukan' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 menit

    user.resetToken = resetToken;
    user.resetTokenExpires = expiresAt;
    await user.save();

    await sendResetLink(email, resetToken);
    res.status(200).json({ message: 'Link reset dikirim ke email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengirim link reset.' });
  }
};

// RESET PASSWORD - Pakai Token
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [require('sequelize').Op.gt]: Date.now() },
      },
    });

    if (!user) return res.status(400).json({ error: 'Token tidak valid atau kadaluarsa' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password berhasil direset.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mereset password.' });
  }
};