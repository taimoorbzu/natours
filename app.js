const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const tourRouter = require("./routes/tourRouter.js");
const userRouter = require("./routes/userRouter.js");
const { renderVisualizerHtml } = require("./utils/routeVisualizer.js");
const AppError = require("./utils/AppError.js");
const GlobalErrorhandler = require("./utils/global-error-handler.js");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const reviewRouter = require("./routes/reviewRouter.js");
const { setupSwagger } = require("./swagger/swagger.js");
const path = require("path");
const pug = require('pug');
const { title } = require("process");

dotenv.config();

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. Security HTTP headers & CORS
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// 2. Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 3. Rate limiting for API requests
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour duration
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after an hour",
});
app.use("/api", limiter);

// 4. Body & Cookie parsers (reading data into req.body and req.cookies)
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize()); // To save from nosql injection attacks
app.use(xss()); // To save from cross-site scripting attacks
app.use(hpp({
  whitelist: ["duration", "ratingsAverage", "ratingsQuantity", "price", "difficulty", "maxGroupSize", "summary", "tours", "name", "guides"]
})); // To prevent parameter pollution
// Serve static files from the 'public' directory
app.use(express.static(`${__dirname}/public`));

// Swagger API Documentation (available at /api-docs and /docs)
setupSwagger(app);

// Custom timestamp middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

// Routes for API requests
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

//Routes for User Interface
app.get('/', (req, res) => {
  res.status(200).render('base', {
    title: "Home Page"
  });
})

app.get('/overview', (req, res) => {
  res.status(200).render('overview', {
    title: "Overview"
  });
});

app.get('/tour', (req, res) => {
  res.status(200).render('tour', {
    title: "The Forest Hiker"
  });
});

// Interactive Route & Middleware Visualizer Dashboard
if (process.env.NODE_ENV === "development") {
  app.get("/routes", (req, res) => {
    const html = renderVisualizerHtml(app, {
      "/api/v1/tours": tourRouter,
      "/api/v1/users": userRouter,
      "/api/v1/reviews": reviewRouter,
    });
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  });
}

//Middleware function for the route that doesnot exist
app.use((req, res, next) => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
});

//Global error handling middleware
app.use(GlobalErrorhandler);
module.exports = app;
