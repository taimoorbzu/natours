const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belong to a User!']
    },
    price: {
        type: Number,
        required: [true, 'A booking must have a price.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

// Auto-populate user and tour
bookingSchema.pre(/^find/, function () {
    this.populate([
        {
            path: 'user',
            select: 'name email'
        },
        'tour'
    ]);
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
