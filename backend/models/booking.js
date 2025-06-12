const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../config/database.js");
const User = require("./user.js");

const Booking = db.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  serviceType: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  notes: {
    type: DataTypes.STRING(150),
  },
  vehicleType: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  vehicleYear: {
    type: DataTypes.STRING(4),
    allowNull: false,
  },
  licensePlate: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  estimatedPrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  workshopName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: "Wijaya Motor",
  },
  serviceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
    defaultValue: Sequelize.UUIDV4,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: "pending",
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    },
  finalPrice: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
    },
  },
);

User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

module.exports = Booking;
