const mongoose = require('mongoose');
const Tour = require('./TourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "A Tour Must have a Rating"]
    },
    rating: {
        type: Number,
        required: [true, "A Tour Must have a Rating"],
        min: [1, "A rating must be above 1.0"],
        max: [5, "A rating must be below 5.0"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "Review must belong to a tour"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to a user"]
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
});

// Populating the Review model with the user and tour data
reviewSchema.pre(/^find/, function () {
    this.populate({
        path: "user",
        select: "name photo"
    }).populate({
        path: "tour",
        select: "name"
    });
});

// Calculating Average Ratings
reviewSchema.statics.calcAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: "$tour",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ]);

    await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].avgRating,
        ratingsQuantity: stats[0].nRating
    });
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review