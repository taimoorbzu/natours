const express = require("express");
const {
  getOverview,
  getTour,
  Login,
} = require("../controllers/viewsController.js");

const router = express.Router();

router.get("/login", Login);
router.get("/", getOverview);
router.get("/tour/:slug", getTour);

module.exports = router;
