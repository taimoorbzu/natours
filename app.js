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

dotenv.config();

const app = express();
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(`${__dirname}/public`));

// Custom timestamp middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

// Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// Interactive Route & Middleware Visualizer Dashboard
if (process.env.NODE_ENV === "development") {
  app.get("/routes", (req, res) => {
    const html = renderVisualizerHtml(app, {
      "/api/v1/tours": tourRouter,
      "/api/v1/users": userRouter,
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
