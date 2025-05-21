const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Booking = require('../models/booking');

router.get('/bookings/:id/invoice', async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${booking.invoiceNumber}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text("INVOICE SERVICE", { align: "center" });
  doc.moveDown();
  doc.text(`No. Invoice: ${booking.invoiceNumber}`);
  doc.text(`Tanggal: ${new Date(booking.completedAt).toLocaleDateString('id-ID')}`);
  doc.moveDown();
  doc.text(`Nama Pelanggan: ${booking.name}`);
  doc.text(`No. Telepon: ${booking.phone}`);
  doc.moveDown();
  doc.text(`Kendaraan: ${booking.vehicleType} (${booking.vehicleYear})`);
  doc.text(`Plat Nomor: ${booking.licensePlate}`);
  doc.text(`Layanan: ${booking.serviceType}`);
  doc.text(`Harga Estimasi: ${booking.estimatedPrice}`);
  doc.moveDown();
  doc.text(`Catatan: ${booking.notes}`);
  doc.moveDown();
  doc.text("Terima kasih telah mempercayakan service mobil Anda kepada kami!", { align: "center" });

  doc.end();
});

module.exports = router;
