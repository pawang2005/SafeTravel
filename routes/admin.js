const express = require("express");
const router = express.Router();
// Load User model
const User = require("../models/User");
const { getAdmninDashboard, postCreateTour, getTour } = require("../controller/admin");
router.get("/dashboard",getAdmninDashboard);
router.post("/create-tour",postCreateTour); 
router.get("/tours/:id",getTour);
// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/login");
});

module.exports = router;
