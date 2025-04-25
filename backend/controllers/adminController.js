const db = require("../models");
const Booking = db.bookings;

exports.resetBookings = async (req, res) => {
  try {
    await Booking.destroy({
      where: {},
      truncate: true,           // hapus semua
      restartIdentity: true     // reset ID ke 1
    });

    res.status(200).send({ message: "Semua data booking berhasil di-reset." });
  } catch (error) {
    console.error("❌ Gagal reset bookings:", error);
    res.status(500).send({ message: "Terjadi kesalahan saat reset." });
  }
};
