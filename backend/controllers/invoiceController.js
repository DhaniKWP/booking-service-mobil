const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Booking = require('../models/booking');
const AdditionalService = require('../models/additionalService');
const path = require('path');

router.get('/bookings/:id/invoice', async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

  const additionalServices = await AdditionalService.findAll({
    where: { bookingId: booking.id }
  });

  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${booking.invoiceNumber || "invoice"}.pdf`);
  doc.pipe(res);

  // Logo
  try {
    const logoPath = path.join(__dirname, '../../frontend/img/WJM2.png');
    doc.image(logoPath, doc.page.margins.left, 40, { width: 80 });
  } catch (err) {
    console.warn("Logo gagal dimuat:", err.message);
  }

  // Header kanan (judul & nomor invoice)
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('INVOICE SERVICE', 0, 50, { align: 'right' });

  doc
    .moveDown(0.3)
    .fontSize(10)
    .font('Helvetica')
    .text(`No. Invoice: ${booking.invoiceNumber || '-'}`, { align: 'right' })
    .text(`Tanggal    : ${new Date(booking.completedAt).toLocaleDateString('id-ID')}`, { align: 'right' });

  // Alamat & kontak bengkel di bawah logo
  const addressTop = 130;
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Wijaya Motor', doc.page.margins.left, addressTop)
    .text('Jl. Arya Wangsakara, RT.001/001, Bugel, Kec. Karawaci,', { continued: true })
    .text('Kota Tangerang, Banten 15114')
    .text('Telp: +62 877-8823-6277')
    .moveDown();

  // Garis pemisah
  doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke();

  // Informasi Pelanggan
  doc
    .moveDown(1)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Informasi Pelanggan')
    .font('Helvetica')
    .moveDown(0.5)
    .text(`Nama         : ${booking.name}`)
    .text(`Telepon      : ${booking.phone}`)
    .text(`Kendaraan    : ${booking.vehicleType} (${booking.vehicleYear})`)
    .text(`Plat Nomor   : ${booking.licensePlate}`)
    .moveDown();

  // Detail Servis
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Detail Servis')
    .font('Helvetica')
    .moveDown(0.5)
    .text(`Layanan Utama: ${booking.serviceType}`)
    .text(`Catatan      : ${booking.notes || '-'}`)
    .moveDown();

  // Garis pemisah
  doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke();

  // Rincian Biaya dengan tabel sederhana
  doc
    .moveDown(1)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Rincian Biaya')
    .moveDown(0.5);

  const formatRp = (val) => `Rp${Number(val).toLocaleString('id-ID')}`;

  // Header tabel
  const tableTop = doc.y;
  const itemX = 50;
  const priceX = 400;

  doc.font('Helvetica-Bold');
  doc.text('Deskripsi', itemX, tableTop);
  doc.text('Harga', priceX, tableTop, { width: 90, align: 'right' });
  doc.moveDown(0.5);
  doc.font('Helvetica');

  // Item utama
  doc.text('Estimasi Servis Awal', itemX);
  doc.text(formatRp(booking.estimatedPrice), priceX, doc.y - 15, { width: 90, align: 'right' });

  // Tambahan
  if (additionalServices.length > 0) {
    additionalServices.forEach(s => {
      doc.text(s.serviceName, itemX);
      doc.text(formatRp(s.price), priceX, doc.y - 15, { width: 90, align: 'right' });
    });
  } else {
    doc.text('Tidak ada layanan tambahan', itemX);
    doc.text('-', priceX, doc.y - 15, { width: 90, align: 'right' });
  }

  // Garis pembatas
  doc.moveTo(itemX, doc.y + 5).lineTo(545, doc.y + 5).stroke();

  // Total harga akhir
  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .text('TOTAL (Final Price)', itemX, doc.y + 10);

  doc.text(formatRp(booking.finalPrice), priceX, doc.y, { width: 90, align: 'right' });

  // Footer
  doc
    .moveDown(4)
    .fontSize(10)
    .fillColor('gray')
    .font('Helvetica-Oblique')
    .text('Terima kasih telah mempercayakan service mobil Anda kepada Wijaya Motor.', {
      align: 'center',
      italic: true
    });

  doc.end();
});

module.exports = router;
