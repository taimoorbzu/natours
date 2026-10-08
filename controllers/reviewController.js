const catchAsync = require('../utils/catchAsync');
const Review = require('../models/ReviewModel');
const AppError = require('../utils/AppError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {}; // {tour: req.params.tourID}
    if (req.params.tourID) filter = { tour: req.params.tourID };

    //Executing Query 
    const reviews = await Review.find(filter);
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
});

// Creating the Review
exports.createReview = catchAsync(async (req, res, next) => {
    // Allowing users to review a specific tour
    if (!req.body.tour) req.body.tour = req.params.tourID;
    if (!req.body.user) req.body.user = req.user._id;

    const review = await Review.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    })
});

// Updating the Review
exports.updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
});

// Deleting the Review
exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
});