const AppError = require("./AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(400, message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue
    ? Object.values(err.keyValue)[0]
    : err.message.match(/(["'])(\\?.)*?\1/)?.[0] || "";
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(400, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(400, message);
};

const developmentErrors = function (err, res) {
  return res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    stack: err.stack,
    message: err.message,
    error: err,
  });
};

const handleJWTError = function () {
  return new AppError(401, "Invalid token. Please log in again!");
};

const handleJWTExpiredError = function () {
  return new AppError(401, "Your token has expired! Please log in again.");
};

const productionErrors = function (err, res) {
  // Check whether error is operational and send friendly message, else send generic message
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR: ", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Dealing with DEV vs PROD Errors
  if (process.env.NODE_ENV === "development") {
    developmentErrors(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.statusCode = err.statusCode;
    error.status = err.status;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    productionErrors(error, res);
  } else {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};
