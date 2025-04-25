const express = require("express");
const router = express.Router();
const booking = require("../controllers/bookingController.js");

router.post("/bookings", booking.create);

module.exports = router;
