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
    serviceNumber,
    status
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
      serviceNumber,
      status
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

router.put('/admin/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Status booking diperbarui', booking });
  } catch (error) {
    console.error('Update status gagal:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat update status' });
  }
});

router.put('/admin/bookings/:id/complete', async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.invoiceNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${booking.id}`;
    await booking.save();

    res.json({ message: 'Booking ditandai selesai', booking });
  } catch (error) {
    console.error('Gagal update ke selesai:', error);
    res.status(500).json({ message: 'Gagal update ke selesai' });
  }
});

function getEstimatedPrice(vehicle, service) {
    const priceMap = {
      "Toyota Avanza": {
        "Ganti Oli": 500000,
        "Service Ringan": 850000,
        Overhoul: 6500000,
        "Panggilan Darurat": 350000,
        Scanning: 250000,
        "Kaki - Kaki": 3250000
      },
      "Daihatsu Xenia": {
        "Ganti Oli": 500000,
        "Service Ringan": 850000,
        Overhoul: 6500000,
        "Panggilan Darurat": 350000,
        Scanning: 250000,
        "Kaki - Kaki": 3250000
      },
      "Toyota Kijang Innova": {
        "Ganti Oli": 800000,
        "Service Ringan": 1150000,
        Overhoul: 8000000,
        "Panggilan Darurat": 425000,
        Scanning: 350000,
        "Kaki - Kaki": 4000000
      },
      "Mitsubishi Xpander": {
        "Ganti Oli": 550000,
        "Service Ringan": 950000,
        Overhoul: 7000000,
        "Panggilan Darurat": 350000,
        Scanning: 275000,
        "Kaki - Kaki": 3550000
      },
      "Suzuki Ertiga": {
        "Ganti Oli": 550000,
        "Service Ringan": 950000,
        Overhoul: 7000000,
        "Panggilan Darurat": 350000,
        Scanning: 275000,
        "Kaki - Kaki": 3550000
      },
      "Toyota Agya": {
        "Ganti Oli": 450000,
        "Service Ringan": 700000,
        Overhoul: 5750000,
        "Panggilan Darurat": 325000,
        Scanning: 225000,
        "Kaki - Kaki": 2750000
      },
      "Daihatsu Ayla": {
        "Ganti Oli": 450000,
        "Service Ringan": 700000,
        Overhoul: 5750000,
        "Panggilan Darurat": 325000,
        Scanning: 225000,
        "Kaki - Kaki": 2750000
      },
      "Honda Brio Satya": {
        "Ganti Oli": 500000,
        "Service Ringan": 850000,
        Overhoul: 6250000,
        "Panggilan Darurat": 350000,
        Scanning: 250000,
        "Kaki - Kaki": 3050000
      },
      "Datsun Go/Go+": {
        "Ganti Oli": 450000,
        "Service Ringan": 700000,
        Overhoul: 5750000,
        "Panggilan Darurat": 325000,
        Scanning: 225000,
        "Kaki - Kaki": 2750000
      },
      "Toyota Rush": {
        "Ganti Oli": 550000,
        "Service Ringan": 950000,
        Overhoul: 7000000,
        "Panggilan Darurat": 350000,
        Scanning: 275000,
        "Kaki - Kaki": 3550000
      },
      "Daihatsu Terios": {
        "Ganti Oli": 550000,
        "Service Ringan": 950000,
        Overhoul: 7000000,
        "Panggilan Darurat": 350000,
        Scanning: 275000,
        "Kaki - Kaki": 3550000
      },
      "Honda CR-V": {
        "Ganti Oli": 800000,
        "Service Ringan": 1300000,
        Overhoul: 8250000,
        "Panggilan Darurat": 425000,
        Scanning: 350000,
        "Kaki - Kaki": 4500000
      },
      "Toyota Fortuner": {
        "Ganti Oli": 950000,
        "Service Ringan": 1500000,
        Overhoul: 9500000,
        "Panggilan Darurat": 500000,
        Scanning: 425000,
        "Kaki - Kaki": 5250000
      },
      "Honda Jazz": {
        "Ganti Oli": 550000,
        "Service Ringan": 950000,
        Overhoul: 7000000,
        "Panggilan Darurat": 350000,
        Scanning: 275000,
        "Kaki - Kaki": 3550000
      },
      "Toyota Yaris": {
        "Ganti Oli": 550000,
        "Service Ringan": 950000,
        Overhoul: 7000000,
        "Panggilan Darurat": 350000,
        Scanning: 275000,
        "Kaki - Kaki": 3550000
      },
      "Suzuki Swift": {
        "Ganti Oli": 550000,
        "Service Ringan": 950000,
        Overhoul: 7000000,
        "Panggilan Darurat": 350000,
        Scanning: 275000,
        "Kaki - Kaki": 3550000
      },
      "Toyota Vios": {
        "Ganti Oli": 500000,
        "Service Ringan": 850000,
        Overhoul: 6500000,
        "Panggilan Darurat": 350000,
        Scanning: 250000,
        "Kaki - Kaki": 3550000
      },
      "Honda Civic": {
        "Ganti Oli": 650000,
        "Service Ringan": 1100000,
        Overhoul: 7500000,
        "Panggilan Darurat": 425000,
        Scanning: 350000,
        "Kaki - Kaki": 4150000
      },
      "Toyota Corolla Altis": {
        "Ganti Oli": 650000,
        "Service Ringan": 1100000,
        Overhoul: 7500000,
        "Panggilan Darurat": 425000,
        Scanning: 350000,
        "Kaki - Kaki": 4150000
      },
    };

    return priceMap[vehicle]?.[service] || 0;
  }
// Edit Booking (hanya status pending)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    vehicleType,
    vehicleYear,
    licensePlate,
    serviceType,
    date,
    time,
    notes
  } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking hanya bisa diubah jika status masih pending' });
    }

    booking.vehicleType = vehicleType;
    booking.vehicleYear = vehicleYear;
    booking.licensePlate = licensePlate;
    booking.serviceType = serviceType;
    booking.date = date;
    booking.time = time;
    booking.notes = notes;

    booking.estimatedPrice = getEstimatedPrice(vehicleType, serviceType);

    await booking.save();
    res.json({ message: 'Booking berhasil diupdate', booking });
  } catch (error) {
    console.error('Gagal update booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat update booking' });
  }
});




module.exports = router;