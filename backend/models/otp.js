const { DataTypes } = require('sequelize');
const db = require('../config/database.js');

const OTP = db.define('OTP', {
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

module.exports = OTP;
