const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOTP);

module.exports = router;
