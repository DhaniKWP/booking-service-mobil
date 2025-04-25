const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Route untuk reset bookings
router.post("/reset-bookings", adminController.resetBookings);

module.exports = router;
