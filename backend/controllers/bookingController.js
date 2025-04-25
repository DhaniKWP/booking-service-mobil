const db = require("../models");
const Booking = db.bookings;

exports.create = async (req, res) => {
  try {
    const { name, email, service, serviceDate, specialRequest } = req.body;
    const booking = await Booking.create({ name, email, service, serviceDate, specialRequest });
    res.status(201).send(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
