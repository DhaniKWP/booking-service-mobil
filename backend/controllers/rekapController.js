const express = require('express');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');
const path = require('path');
const router = express.Router();
const Booking = require('../models/booking');

router.post('/pdf', async (req, res) => {
  const { startDate, endDate } = req.body;
  const doc = new PDFDocument({ margin: 50 });
  const formatRp = val => 'Rp' + Number(val).toLocaleString('id-ID');

  try {
    const whereClause = { status: 'completed' };
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    const bookings = await Booking.findAll({ where: whereClause });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rekap_income.pdf');
    doc.pipe(res);

    // === HEADER ===
    try {
      const logoPath = path.join(__dirname, '../../frontend/img/WJM2.jpg');
      doc.image(logoPath, 50, 30, { width: 60 });
    } catch (e) {
      console.warn("Logo gagal dimuat:", e.message);
    }

    doc
      .fontSize(16).font('Helvetica-Bold').text("WIJAYA MOTOR", 130, 30)
      .fontSize(10).font('Helvetica')
      .text("Jl. Arya Wangsakara, RT.001/001, Bugel, Kec. Karawaci", 130, 48)
      .text("Kota Tangerang, Banten 15114 | Telp: +62 877-8823-6277", 130, 62);

    doc.moveTo(50, 85).lineTo(545, 85).stroke();
    doc.y = 100;

    doc
      .fontSize(14).font('Helvetica-Bold')
      .text("REKAPITULASI PENDAPATAN", { align: 'center' });

    const periode = startDate && endDate
      ? `Periode: ${startDate} s.d. ${endDate}`
      : "Periode: Semua Tanggal";

    doc.fontSize(10).font('Helvetica').text(periode, { align: 'center' });
    doc.y += 20;

    // === TABLE ===
    const headers = ["No", "Nama", "Mobil", "Layanan", "Tanggal", "No. Servis", "Harga Final"];
    const colWidths = [25, 70, 100, 70, 65, 90, 75];
    const rowHeight = 18;

    const drawTableHeader = () => {
      let x = 50;
      const y = doc.y;
      doc.font('Helvetica-Bold').fontSize(9);
      headers.forEach((h, i) => {
        doc.text(h, x, y, {
          width: colWidths[i],
          align: i === headers.length - 1 ? 'right' : 'left',
        });
        x += colWidths[i];
      });
      doc.moveTo(50, y + rowHeight - 5).lineTo(545, y + rowHeight - 5).stroke();
      doc.y = y + rowHeight;
    };

    let total = 0;
    let no = 1;

    drawTableHeader();

    if (bookings.length === 0) {
      doc.text("Tidak ada data booking yang ditemukan.", 50, doc.y);
    } else {
      bookings.forEach(b => {
        if (doc.y + rowHeight > doc.page.height - 60) {
          doc.addPage();
          drawTableHeader();
        }

        const row = [
          no,
          b.name,
          `${b.vehicleType.split(' ')[1]} (${b.vehicleYear})`,  // Pendekin nama mobil
          b.serviceType,
          b.date,
          b.serviceNumber,
          formatRp(b.finalPrice)
        ];

        let x = 50;
        const y = doc.y;
        doc.font('Helvetica').fontSize(9);
        row.forEach((val, i) => {
          doc.text(String(val), x, y, {
            width: colWidths[i],
            align: i === row.length - 1 ? 'right' : 'left',
            ellipsis: true,
            lineBreak: false
          });
          x += colWidths[i];
        });

        doc.y = y + rowHeight;
        total += Number(b.finalPrice);
        no++;
      });

      // === GARIS TOTAL ===
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.y += 6;

      // === TOTAL ===
      const yTotal = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text("TOTAL", 400, yTotal, { width: 100, align: 'left' });
      doc.text(formatRp(total), 470, yTotal, { width: 75, align: 'right' });
    }

    // === FOOTER ===
    doc.y += 40;
    doc
      .fontSize(9)
      .fillColor('gray')
      .font('Helvetica-Oblique')
      .text("Dokumen ini dicetak otomatis dari sistem Wijaya Motor.", { align: 'center' });

    doc.end();
  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).json({ message: 'Gagal generate PDF' });
  }
});



module.exports = router;
