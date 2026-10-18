const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Tour = require("../models/TourModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Get CheckOut Session
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
        return next(new AppError(404, "There is no tour with that ID."));
    }

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId, // Send current tour id so that we can create the booking in our database
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    unit_amount: tour.price * 100, // Stripe expects amounts in cents
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                },
                quantity: 1,
            },
        ],
    });

    // 3) Send session to client
    res.status(200).json({
        status: "success",
        session,
    });
});

const Booking = require("../models/BookingModel");

// Middleware to create booking when user redirects back from Stripe checkout
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is temporary because it's unsecure: anyone can make bookings without paying if they know this URL pattern
    // (In production, webhooks are used instead)
    const { tour, user, price } = req.query;

    if (!tour || !user || !price) return next();

    await Booking.create({ tour, user, price });

    // Redirect to root URL without query string so users cannot bookmark or re-trigger booking creation
    res.redirect(req.originalUrl.split('?')[0]);
});


