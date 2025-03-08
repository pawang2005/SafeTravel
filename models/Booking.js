const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" },
    tickets: Number,
    totalPrice: Number,
    isPaid: { type: Boolean, default: false },
    bookingId: String,
    paymentId: String,
    paymentStatus: String,
    paymentDate: Date,
    passengers: [
      {
        name: String,
        age: Number,
        gender: String,
        seatNumber: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
