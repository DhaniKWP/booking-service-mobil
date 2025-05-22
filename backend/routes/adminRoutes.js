const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const { getAllBookings, updateBookingStatus, markBookingAsCompleted } = require('../controllers/adminController');

router.get('/bookings', authenticate, isAdmin, getAllBookings);
router.put('/bookings/:id', authenticate, isAdmin, updateBookingStatus);
router.put('/bookings/:id/complete', authenticate, isAdmin, markBookingAsCompleted);

module.exports = router;
