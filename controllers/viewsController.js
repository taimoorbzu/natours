const Tour = require("../models/TourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");

const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  if (!tours) {
    return next(new AppError(404, "No tours found Please try again!"));
  }
  res.status(200).render("overview", {
    tours,
    title: "All Tours",
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  if (!tour) {
    return next(
      new AppError(404, `There is no tour with name : ${req.params.slug}`),
    );
  }
  res.status(200).render("tour", {
    tour,
    title: `${tour.name} Tour`,
  });
});

const Login = catchAsync(async (req, res, next) => {
  res.status(200).render("Login", {
    title: "Login to Account",
  });
});

const getUser = catchAsync(async (req, res, next) => {
  res.status(200).render("account", {
    title: "My account",
    user: req.user,
  });
});

const getSignup = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account',
  });
};

const getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find user and populate virtual bookings
  const user = await User.findById(req.user.id).populate('bookings');

  // 2) Extract the tour objects from each booking
  const tours = user.bookings ? user.bookings.map(el => el.tour) : [];

  // 3) Render overview page with booked tours
  res.status(200).render('overview', {
    title: 'My Booked Tours',
    tours,
  });
});

module.exports = {
  getOverview,
  getTour,
  Login,
  getUser,
  getSignup,
  getMyTours
};
