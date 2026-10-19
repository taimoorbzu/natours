const express = require('express');
const { protectMiddleWare, CheckUserrRole } = require('../controllers/authController');
const {
    getCheckoutSession,
    getAllBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking
} = require('../controllers/bookingController');

const router = express.Router();

// Protect all routes after this middleware
router.use(protectMiddleWare);

// Route for getting Stripe checkout session
router.get('/checkout-session/:tourId', getCheckoutSession);

// Restrict all remaining CRUD routes to admin and lead-guide
router.use(CheckUserrRole('admin', 'lead-guide'));

router
    .route('/')
    .get(getAllBookings)
    .post(createBooking);

router
    .route('/:id')
    .get(getBooking)
    .patch(updateBooking)
    .delete(deleteBooking);

module.exports = router;