const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./user')(sequelize, DataTypes);

// Setup associations
// (Tambahkan asosiasi model di sini jika diperlukan)

module.exports = {
  sequelize,
  User
};