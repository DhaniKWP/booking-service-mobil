const Booking = require('../models/booking');

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ order: [['createdAt', 'DESC']] });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted' or 'rejected'

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    res.json({ message: 'Booking updated', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markBookingAsCompleted = async (req, res) => {
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
};

module.exports = { getAllBookings, updateBookingStatus, markBookingAsCompleted };
