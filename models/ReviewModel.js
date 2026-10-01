const mongoose = require('mongoose');

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
})

// Populating the Review model with the user and tour data
reviewSchema.pre(/^find/, function () {
    this.populate({
        path: "user",
        select: "-__v -passwordChangedAt"
    });
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review