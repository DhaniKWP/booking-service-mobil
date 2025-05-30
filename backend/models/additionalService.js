const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../config/database.js");
const Booking = require("./booking.js");

const AdditionalService = db.define("AdditionalService", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Relasi ke Booking
Booking.hasMany(AdditionalService, { foreignKey: "bookingId" });
AdditionalService.belongsTo(Booking, { foreignKey: "bookingId" });

module.exports = AdditionalService;
