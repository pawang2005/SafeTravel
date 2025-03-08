const Tour = require("../models/Tour");
const Booking = require("../models/Booking");
const Razorpay = require("razorpay");

const getUserDashboard = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("tour");
  const tours = await Tour.find();
  return res.render("users/dashboard", {
    user: req.user,
    tours: tours,
  });
};

const getTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  return res.render("users/tour", {
    user: req.user,
    tour: tour,
  });
};

const postCreateTour = async (req, res) => {
  try {
      console.log(req.body);
      const { numSeats, razorpay_payment_id, response,passengers } = req.body;
      const tourId = req.params.id;

      // Validate payment
      if (!razorpay_payment_id) {
          return res.status(400).json({ success: false, message: "Payment not verified!" });
      }

      // Find the selected tour
      const tour = await Tour.findById(tourId);
      if (!tour) {
          return res.status(404).json({ success: false, message: "Tour not found!" });
      }

      // Check seat availability
      if (tour.availableSeats < numSeats) {
          return res.status(400).json({ success: false, message: "Not enough seats available!" });
      }
      

      // Create new booking
      const newBooking = new Booking({
          user: req.user._id,
          tour: tourId,
          tickets: numSeats,
          totalPrice: numSeats * tour.pricePerTicket,
          passengers,
          paymentId: razorpay_payment_id, // Store payment ID
          isPaid: true,
          paymentStatus: response.status,
          paymentDate: new Date(),
          bookingId: `B${Date.now()}${Math.floor(Math.random() * 1000)}`,
      });

      await newBooking.save();

      // Reduce available seats
      tour.availableSeats -= numSeats;
      await tour.save();

      res.status(201).json({
          success: true,
          message: "Booking successful!",
          redirectUrl: "/users/dashboard",
      });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};

const getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("tour");
  return res.render("users/bookings", {
    user: req.user,
    bookings: bookings,
  });
}

module.exports = { getUserDashboard, getTour, postCreateTour, getUserBookings };
