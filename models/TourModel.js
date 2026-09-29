const mongoose = require('mongoose');
// const validator = require('validator')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'Tour name must be less than 40 characters'],
        minlength: [10, 'Tour name must be more than 10 characters']
    },
    duration: {
        type: Number,
        required: [true, 'Tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour must have a maximum group size'],
        // default: 10
    },
    difficulty: {
        type: String,
        required: [true, 'Tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: "Discount price ({VALUE}) should be below the regular price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Tour must have an image cover']
    },
    images: {
        type: [String]
    },
    startDates: {
        type: [Date]
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startLocation: {
        //GroJSON
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ]
});


//Defining the middlewares provided by Mongoose
tourSchema.pre('aggregate', function () {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
})

tourSchema.pre(/^find/, function () {
    this.find({ secretTour: { $ne: true } })
})

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;