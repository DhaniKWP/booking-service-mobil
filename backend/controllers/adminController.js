const Booking = require('../models/booking');
const AdditionalService = require('../models/additionalService');

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

const completeBookingWithServices = async (req, res) => {
  const { id } = req.params;
  const { additionalServices } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    let totalAdditional = 0;
    for (const svc of additionalServices) {
      await AdditionalService.create({
        bookingId: id,
        serviceName: svc.serviceName,
        price: svc.price
      });
      totalAdditional += svc.price;
    }

    const finalPrice = parseInt(booking.estimatedPrice) + totalAdditional;

    booking.status = 'completed';
    booking.finalPrice = finalPrice;
    booking.completedAt = new Date();
    booking.invoiceNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${booking.id}`;

    await booking.save();

    res.json({ message: 'Booking selesai dan layanan tambahan disimpan.', booking });
  } catch (error) {
    console.error('Gagal menyelesaikan booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data.' });
  }
};

module.exports = { getAllBookings, updateBookingStatus, completeBookingWithServices };
