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

const getTour = catchAsync(async (req, res) => {
    res.status(200).render('tour', {
        title: 'Tour'
    });
});

module.exports = {
    getOverview,
    getTour
}