const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const { getAllBookings, updateBookingStatus } = require('../controllers/adminController');

router.get('/bookings', authenticate, isAdmin, getAllBookings);
router.put('/bookings/:id', authenticate, isAdmin, updateBookingStatus);

module.exports = router;
