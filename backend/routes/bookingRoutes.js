const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const User = require('../models/user');

router.post('/create', async (req, res) => {
  const { email, serviceType, date, time, notes } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'User tidak ditemukan atau belum verifikasi.' });
    }

    const booking = await Booking.create({
      userId: user.id,
      serviceType,
      date,
      time,
      notes
    });

    res.json({ message: 'Booking berhasil', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat booking' });
  }
});

router.get('/user', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    const bookings = await Booking.findAll({ where: { userId: user.id } });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data booking' });
  }
});


module.exports = router;
