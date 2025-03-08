const Tour = require("../models/Tour");
const Booking = require("../models/Booking");
const getAdmninDashboard = async(req, res) => {
    const tours = await Tour.find();
  return res.render("admin/home", {
    user: req.user,
    tours: tours,
  });
};

const postCreateTour = async (req, res) => {
  const tour = new Tour(req.body);
  try {
    await tour.save();
    res.status(201).redirect("/admin/dashboard");
  } catch (error) {
    res.status(400, error);
  }
};

const getTour = async (req, res) => {
  const tourId = await Tour.findById(req.params.id);
  const booking = await Booking.find({ tour: tourId });
  const tourDetail = await Booking
    .find({ tour: tourId })
    .populate("user")
    .populate("tour");  
  return res.render("admin/tour", {
    user: req.user,
    tours: tourDetail,
  });
}


module.exports = { getAdmninDashboard , postCreateTour, getTour};
