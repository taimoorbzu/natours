const express = require('express');
const { protectMiddleWare, CheckUserrRole } = require('../controllers/authController');
const { getCheckoutSession } = require('../controllers/bookingController');


//Protected Routes
const router = express.Router();
router.get('/checkout-session/:tourId', protectMiddleWare, getCheckoutSession);


module.exports = router;