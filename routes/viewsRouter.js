const express = require("express");
const {
  getOverview,
  getTour,
  Login,
  getUser
} = require("../controllers/viewsController.js");
const { isLoggedIn, protectMiddleWare } = require("../controllers/authController.js");

const router = express.Router();

router.use(isLoggedIn);

router.get("/login", Login);
router.get("/me", protectMiddleWare, getUser);
router.get("/", getOverview);
router.get("/tour/:slug", getTour);

module.exports = router;
