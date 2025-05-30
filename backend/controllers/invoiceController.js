const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Booking = require('../models/booking');
const AdditionalService = require('../models/additionalService'); // ⬅️ Import tambahan

router.get('/bookings/:id/invoice', async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

  const additionalServices = await AdditionalService.findAll({
    where: { bookingId: booking.id }
  });

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${booking.invoiceNumber || "invoice"}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(18).text("INVOICE SERVICE", { align: "center" });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`No. Invoice: ${booking.invoiceNumber || "-"}`);
  doc.text(`Tanggal: ${new Date(booking.completedAt).toLocaleDateString('id-ID')}`);
  doc.moveDown();

  // Info Pelanggan
  doc.text(`Nama Pelanggan: ${booking.name}`);
  doc.text(`No. Telepon: ${booking.phone}`);
  doc.moveDown();
  doc.text(`Kendaraan: ${booking.vehicleType} (${booking.vehicleYear})`);
  doc.text(`Plat Nomor: ${booking.licensePlate}`);
  doc.text(`Layanan Utama: ${booking.serviceType}`);
  doc.moveDown();

  // Biaya
  doc.text("Detail Biaya:");
  doc.text(`• Estimasi Servis Awal: Rp${Number(booking.estimatedPrice).toLocaleString('id-ID')}`);

  if (additionalServices.length > 0) {
    additionalServices.forEach(s => {
      doc.text(`+ ${s.serviceName}: Rp${Number(s.price).toLocaleString('id-ID')}`);
    });
  } else {
    doc.text("+ Tidak ada layanan tambahan");
  }

  doc.moveDown();
  doc.text(`TOTAL (Final Price): Rp${Number(booking.finalPrice).toLocaleString('id-ID')}`, {
    underline: true,
    bold: true
  });
  doc.moveDown();

  // Catatan & penutup
  if (booking.notes) {
    doc.text(`Catatan: ${booking.notes}`);
    doc.moveDown();
  }

  doc.text("Terima kasih telah mempercayakan service mobil Anda kepada kami!", {
    align: "center"
  });

  doc.end();
});

module.exports = router;
