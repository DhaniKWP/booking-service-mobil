const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./models");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// API Routes
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api", bookingRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);


// ✅ Fallback route (untuk route yang tidak ditemukan)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../frontend", "404.html"));
});

// Sync DB dan jalanin server
db.sequelize.sync().then(() => {
  console.log("✅ Database connected.");
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
