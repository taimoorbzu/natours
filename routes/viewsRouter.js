const express = require("express");
const {
  getOverview,
  getTour,
  Login,
} = require("../controllers/viewsController.js");
const { isLoggedIn } = require("../controllers/authController.js");

const router = express.Router();

router.use(isLoggedIn);

router.get("/login", Login);
router.get("/", getOverview);
router.get("/tour/:slug", getTour);

module.exports = router;
