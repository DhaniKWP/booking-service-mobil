const { DataTypes } = require('sequelize');
const db = require('../config/database.js'); // ganti sesuai nama file db lo

const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
  type: DataTypes.ENUM('admin', 'user'),
  defaultValue: 'user'
},
  resetToken: {
  type: DataTypes.STRING(100),
  allowNull: true
},
resetTokenExpires: {
  type: DataTypes.DATE,
  allowNull: true
}

});

module.exports = User;
