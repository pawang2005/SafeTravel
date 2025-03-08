const mongoose = require("mongoose");

const TourSchema = new mongoose.Schema({
    name: String,
    location: String,
    pricePerTicket: Number,
    availableSeats: Number,
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
});

module.exports = mongoose.model("Tour", TourSchema);
