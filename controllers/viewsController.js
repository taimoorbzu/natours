const Tour = require('../models/TourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    // if (!tours) {
    //     return next(new AppError(404, 'No tours found'));
    // }
    res.status(200).render('overview', {
        tours,
        title: 'All Tours'
    });
});

const getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if (!tour) {
        return next(new AppError(404, 'There is no tour with that name.'));
    }
    res.status(200).render('tour', {
        tour,
        title: `${tour.name} Tour`
    });
});

module.exports = {
    getOverview,
    getTour
}