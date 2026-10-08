const express = require("express");
const {
  getAllTours,
  createTour,
  getTourById,
  updateTour,
  deleteTour,
  getCheapestRoutes,
  getTourStats,
  getMonthlyPlan,
} = require("../controllers/tourController");
const {
  protectMiddleWare,
  CheckUserrRole,
} = require("../controllers/authController");
const reviewRouter = require('./reviewRouter')
const tourRouter = express.Router();

//Route to calculate the statictics about our Tours data
tourRouter.route("/tour-stats").get(getTourStats);
tourRouter.route("/getmonthlyplan/:year").get(getMonthlyPlan);

//Normal Routes + the Alias Routes (routes with middlewares)
tourRouter.route("/cheapest-tours").get(getCheapestRoutes, getAllTours);
tourRouter.route("/").get(protectMiddleWare, getAllTours).post(createTour);
tourRouter
  .route("/:id")
  .get(getTourById)
  .patch(updateTour)
  .delete(protectMiddleWare, CheckUserrRole("admin", "lead-guide"), deleteTour);

//Nested Routes
tourRouter.use('/:tourID/reviews', reviewRouter);

module.exports = tourRouter;
