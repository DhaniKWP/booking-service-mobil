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
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  notes: {
    type: DataTypes.STRING,
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicleYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  licensePlate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estimatedPrice: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0,
  },
  workshopName: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
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
  },
);

User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

module.exports = Booking;
