const express = require('express');
const router = express.Router();
const { getUserDashboard, getTour,postCreateTour,getUserBookings } = require("../controller/user");
const Razorpay = require("razorpay");

// Load User model
const User = require('../models/User');
router.get('/dashboard',getUserDashboard);
router.get('/book-ticket/:id', getTour);
router.post("/book-ticket/:id", postCreateTour);

router.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;
        const razorpay = new Razorpay({
            key_id: "rzp_test_JXBfaYRlMaxncG",
            key_secret: "jV9mcviniyBuMrGkgYeEMxRi",
        });

        const options = {
            amount: amount * 100, // Convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to create order" });
    }
});

router.get('/bookings',getUserBookings);
// Logout
router.get('/logout', (req, res) => {
      req.logout();
      req.flash('success_msg', 'You are logged out');
      res.redirect('/login');
});




module.exports = router;