const express = require("express");
const {
  getOverview,
  getTour,
  Login,
  getUser,
  getSignup
} = require("../controllers/viewsController.js");
const { isLoggedIn, protectMiddleWare } = require("../controllers/authController.js");

const router = express.Router();

router.get("/", isLoggedIn, getOverview);
router.get("/tour/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, Login);
router.get("/me", protectMiddleWare, getUser);
router.get('/signup', isLoggedIn, getSignup);


module.exports = router;
