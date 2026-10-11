const Tour = require('../models/TourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getOverview = catchAsync(async (req, res, next) => {
    res.status(200).render('overview', {
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