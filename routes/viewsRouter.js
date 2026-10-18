const express = require("express");
const {
  getOverview,
  getTour,
  Login,
  getUser,
  getSignup,
  getMyTours
} = require("../controllers/viewsController.js");
const { isLoggedIn, protectMiddleWare } = require("../controllers/authController.js");
const { createBookingCheckout } = require("../controllers/bookingController.js");

const router = express.Router();

router.get("/", createBookingCheckout, isLoggedIn, getOverview);
router.get("/tour/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, Login);
router.get("/signup", isLoggedIn, getSignup);
router.get("/me", protectMiddleWare, getUser);
router.get("/my-tours", protectMiddleWare, getMyTours);

module.exports = router;

