const express = require("express");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const path = require("path");
const router = express.Router();
const Booking = require("../models/booking");

router.post("/pdf", async (req, res) => {
  const { startDate, endDate } = req.body;
  const doc = new PDFDocument({ margin: 50 });
  const formatRp = (val) => "Rp" + Number(val).toLocaleString("id-ID");
  const formatDate = (val) => {
    const d = new Date(val);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  try {
    const whereClause = { status: "completed" };
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    const bookings = await Booking.findAll({ where: whereClause });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=rekap_income.pdf"
    );
    doc.pipe(res);

    try {
      const logoPath = path.join(__dirname, "../frontend/img/WJM2.jpg");
      doc.image(logoPath, 50, 30, { width: 60 });
    } catch (e) {
      console.warn("Logo gagal dimuat:", e.message);
    }

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("WIJAYA MOTOR", 130, 30)
      .fontSize(10)
      .font("Helvetica")
      .text("Jl. Arya Wangsakara, RT.001/001, Bugel, Kec. Karawaci", 130, 48)
      .text("Kota Tangerang, Banten 15114 | Telp: +62 877-8823-6277", 130, 62);

    doc.moveTo(50, 85).lineTo(545, 85).stroke();
    doc.y = 100;

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("REKAPITULASI PENDAPATAN", { align: "center" });

    const periode =
      startDate && endDate
        ? `Periode: ${formatDate(startDate)} s.d. ${formatDate(endDate)}`
        : "Periode: Semua Tanggal";

    doc.fontSize(10).font("Helvetica").text(periode, { align: "center" });
    doc.y += 20;

    const headers = [
      "No",
      "Nama",
      "Mobil",
      "Layanan",
      "Tanggal",
      "No. Servis",
      "Harga Final",
    ];
    const colWidths = [25, 70, 100, 70, 65, 90, 110];
    const rowHeight = 30;

    const drawTableHeader = () => {
      let x = 50;
      const y = doc.y;
      doc.font("Helvetica-Bold").fontSize(9);

      headers.forEach((h, i) => {
        doc
          .rect(x, y, colWidths[i], rowHeight)
          .fillAndStroke("#eeeeee", "black");
        doc.fillColor("black").text(h, x + 2, y + 6, {
          width: colWidths[i] - 4,
          align: "center",
        });
        x += colWidths[i];
      });

      doc.y = y + rowHeight;
    };

    let total = 0;
    let no = 1;

    drawTableHeader();

    if (bookings.length === 0) {
      doc.text("Tidak ada data booking yang ditemukan.", 50, doc.y);
    } else {
      bookings.forEach((b) => {
        if (
          doc.y + rowHeight + 60 >
          doc.page.height - doc.page.margins.bottom
        ) {
          doc.addPage();
          drawTableHeader();
        }

        const row = [
          no,
          b.name,
          `${b.vehicleType.split(" ")[1]} (${b.vehicleYear})`,
          b.serviceType,
          formatDate(b.date),
          b.serviceNumber,
          formatRp(b.finalPrice),
        ];

        const y = doc.y;
        let x = 50;
        doc.font("Helvetica").fontSize(9);

        row.forEach((val, i) => {
          doc.rect(x, y, colWidths[i], rowHeight).stroke();
          doc.text(String(val), x + 2, y + 6, {
            width: colWidths[i] - 4,
            align: i === row.length - 1 ? "right" : "center",
            lineBreak: false,
          });
          x += colWidths[i];
        });

        doc.y = y + rowHeight;
        total += Number(b.finalPrice);
        no++;
      });

      if (doc.y + rowHeight + 40 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        drawTableHeader();
      }

      const yTotal = doc.y;
      const totalLabelWidth = colWidths.slice(0, 6).reduce((a, b) => a + b, 0);
      const xStart = 50;

      doc
        .rect(xStart, yTotal, totalLabelWidth, rowHeight)
        .fillAndStroke("#f2f2f2", "black");
      doc
        .fillColor("black")
        .font("Helvetica-Bold")
        .text("TOTAL", xStart + 4, yTotal + 6, {
          width: totalLabelWidth - 8,
          align: "center",
        });

      const xTotalVal = xStart + totalLabelWidth;
      doc
        .rect(xTotalVal, yTotal, colWidths[6], rowHeight)
        .fillAndStroke("#f2f2f2", "black");
      doc.fillColor("black");
      doc.text(formatRp(total), xTotalVal + 2, yTotal + 6, {
        width: colWidths[6] - 4,
        align: "right",
      });

      doc.y = yTotal + rowHeight;
    }

    doc.y += 40;
    doc
      .fontSize(9)
      .fillColor("gray")
      .font("Helvetica-Oblique")
      .text("Dokumen ini dicetak otomatis dari sistem Wijaya Motor.", {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).json({ message: "Gagal generate PDF" });
  }
});

router.post("/excel", async (req, res) => {
  const { startDate, endDate } = req.body;

  const whereClause = { status: "completed" };
  if (startDate && endDate) {
    whereClause.date = { [Op.between]: [startDate, endDate] };
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  try {
    const bookings = await Booking.findAll({ where: whereClause });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Rekap Pendapatan");

    // Header informasi
    ws.addRow(["WIJAYA MOTOR"]);
    ws.addRow(["Jl. Arya Wangsakara, RT.001/001, Bugel, Kec. Karawaci"]);
    ws.addRow(["Kota Tangerang, Banten 15114 | Telp: +62 877-8823-6277"]);
    ws.addRow([]);
    ws.addRow(["REKAPITULASI PENDAPATAN"]);
    const periodeText =
      startDate && endDate
        ? `Periode: ${formatDate(startDate)} s.d. ${formatDate(endDate)}`
        : "Periode: Semua Tanggal";
    ws.addRow([periodeText]);
    ws.addRow([]);

    // Header tabel
    const headerRow = ws.addRow([
      "No",
      "Nama",
      "Mobil",
      "Layanan",
      "Tanggal",
      "No Servis",
      "Harga Final",
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    let total = 0;
    bookings.forEach((b, i) => {
      const harga = Number(b.finalPrice);
      total += harga;

      const row = ws.addRow([
        i + 1,
        b.name,
        `${b.vehicleType} (${b.vehicleYear})`,
        b.serviceType,
        formatDate(b.date),
        b.serviceNumber,
        `Rp ${harga.toLocaleString("id-ID")}`,
      ]);

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };

        // Harga Final rata kanan, sisanya rata tengah
        if (colNumber === 7) {
          cell.alignment = { horizontal: "right" };
        } else {
          cell.alignment = { horizontal: "center" };
        }
      });
    });

    ws.addRow([]);
    // Baris Total
    const totalRowNumber = ws.lastRow.number;
    ws.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`); // Merge A-F
    const totalRow = ws.getRow(totalRowNumber);
    totalRow.getCell(1).value = "TOTAL";
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(1).alignment = { horizontal: "center" };
    totalRow.getCell(7).value = `Rp ${total.toLocaleString("id-ID")}`;
    totalRow.getCell(7).font = { bold: true };
    totalRow.getCell(7).alignment = { horizontal: "right" };

    // Tambahkan border ke semua sel dalam baris total
    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=rekap_income.xlsx"
    );

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel Export Error:", err);
    res.status(500).json({ message: "Gagal generate Excel" });
  }
});

module.exports = router;
