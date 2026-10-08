const Tour = require("../models/TourModel.js");
const APIFeatures = require("../utils/ApiFeatures.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/AppError.js");

//Middleware to get the top 5 cheapest tours
const getCheapestRoutes = (req, res, next) => {
  req.query.sort = "price,-ratingsAverage";
  req.query.limit = "5";
  req.query.fields = "name,price,ratingsAverage,summary,duration";
  next();
};

//API tours Route
const getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  //Only if user passes the page query paramater, then count total documents and check if page exist
  if (req.query.page) {
    const numTours = await Tour.countDocuments();

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    if (skip >= numTours) {
      return next(new AppError(404, "Page Not Found"));
    }
  }
  const tours = await features.query;
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

const createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

const getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: 'reviews',
    select: 'rating review user '
  });

  if (!tour) {
    return next(new AppError(404, "Tour not found"));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError(404, "Tour Not Found"));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(404, "Tour not found"));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        price: { $gte: 700 },
      },
    },
    {
      $group: {
        _id: { $toLower: "$difficulty" },
        numTours: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        avgRating: { $avg: "$ratingsAverage" },
        numRatings: { $sum: "$ratingsQuantity" },
        avgDuration: { $avg: "$duration" },
        minDuration: { $min: "$duration" },
        maxDuration: { $max: "$duration" },
      },
    },
    {
      $sort: { numTours: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats: stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const MonthlyPlan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $project: {
        month: "$_id",
        numTourStarts: 1,
        tours: 1,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      MonthlyPlan: MonthlyPlan,
    },
  });
});

module.exports = {
  getAllTours,
  createTour,
  getTourById,
  updateTour,
  deleteTour,
  getCheapestRoutes,
  getTourStats,
  getMonthlyPlan,
};
