const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const User = require('../models/user');

// Booking baru
router.post('/create', async (req, res) => {
  const {
    email,
    serviceType,
    date,
    time,
    notes,
    vehicleType,
    vehicleYear,
    licensePlate,
    estimatedPrice,
    workshopName,
    serviceNumber
  } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'User tidak ditemukan atau belum verifikasi.' });
    }

    // Validasi minimal
    if (!vehicleType || !vehicleYear || !licensePlate) {
      return res.status(400).json({ error: 'Data kendaraan wajib diisi.' });
    }

    const booking = await Booking.create({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      serviceType,
      date,
      time,
      notes,
      vehicleType,
      vehicleYear,
      licensePlate,
      estimatedPrice,
      workshopName,
      serviceNumber
    });

    res.json({ message: 'Booking berhasil', booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: 'Terjadi kesalahan saat booking' });
  }
});

// Ambil semua booking berdasarkan email user
router.get('/user', async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const bookings = await Booking.findAll({ where: { userId: user.id } });

    res.json(bookings);
  } catch (error) {
    console.error("Gagal mengambil booking:", error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data booking' });
  }
});

module.exports = router;