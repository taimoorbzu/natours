const catchAsync = require("../utils/catchAsync.js");
const User = require("../models/userModel.js");
const AppError = require("../utils/AppError.js");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const sendEmail = require("../utils/Email.js");
const fs = require("fs");
const path = require("path");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  //Set the cookie option
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: "strict",
  };

  // Only send over HTTPS in production
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);

  //Setting the password to undefined so it doesn't show in the response
  user.password = undefined;
  user.passwordconfirm = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};

//Filtering out the fields that are not allowed to be updated
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordconfirm: req.body.passwordconfirm,
  });
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  //Need to check the password and email provided  by our user
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError(400, "Please provide email and password"));
  }
  //then we need to check whether the email and password are correct or not
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(
      new AppError(401, "Incorrect email or password.Please try again !"),
    );
  }

  //Before sending make sure to remove the password from the user Object
  // user.password = undefined;

  //If Every thing is well generate the JSON WEB TOKEN AND SEND IT TO THE CLIENT
  createSendToken(user, 200, res);
});

const logout = catchAsync(async function (req, res, next) {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    message: "You have been logged out successfully",
  });
});

const forgetPassword = catchAsync(async function (req, res, next) {
  const email = req.body.email;
  // 1. Get user based on POSTed email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(404, "There is no user with that email address."));
  }
  // 2. Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  // 3. Hash the token and save it to the user document
  // (Ensure your Mongoose schema has these fields defined)
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  await user.save({ validateBeforeSave: false });

  // 4. Construct the reset URL and remember to send the normal token to client not the hashed one
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;

  // 5. Load template and replace placeholders
  const templatePath = path.join(__dirname, "../templates/passwordReset.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");
  htmlTemplate = htmlTemplate
    .replace("{{NAME}}", user.name)
    .replace("{{RESET_URL}}", resetURL);
  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}\nIf you didn't forget your password, please ignore this email.`;

  // 5. Send the email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message: message,
      html: htmlTemplate,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    // If email fails to send, clear the token fields so the user can try again
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        500,
        "There was an error sending the email. Try again later!",
      ),
    );
  }
});

const protectMiddleWare = catchAsync(async (req, res, next) => {
  let token;

  //Verify whether the user provided the JWT Token or not
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token === "loggedout") {
    return next(
      new AppError(
        400,
        "You are not Signed In . Please Login First to access the resource",
      ),
    );
  }

  //Verify the JWT TOKEN whether it is legit or not
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Check whether the user exists in database for the particular JWT
  //HINT: USe the JWT Payload to check this
  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(
      new AppError(401, "The user belonging to this token no longer exists."),
    );
  }

  if (freshUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError(401, "User recently changed password. Please login again."),
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE (Attach user to req)
  req.user = freshUser;
  next();
});

const CheckUserrRole = function (...roles) {
  return (req, res, next) => {
    // roles [ 'admin'] and  user role ['lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          `You Must have an ${roles.join("/")} account to access this Resource`,
        ),
      );
    }
    next();
  };
};

const resetPassword = catchAsync(async function (req, res, next) {
  // first check whether user provided the password and passwordconfirm in request
  if (!(req.body.password && req.body.passwordconfirm)) {
    return next(
      new AppError(400, "Please Enter Both Password and confirmation"),
    );
  }

  // 1. Get token from URL and hash it
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. Find user with that token and check if it's not expired
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 3. If no user or token expired → error
  if (!user) {
    return next(new AppError(400, "Token is invalid or has expired"));
  }

  // 4. User found → set new password
  user.password = req.body.password;
  user.passwordconfirm = req.body.passwordconfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 5. Log user in automatically
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  //Add a guard that checks whether user gave all three fields in request
  if (
    !(req.body.password && req.body.passwordconfirm && req.body.oldPassword)
  ) {
    return next(new AppError(400, "Please provide all three fields"));
  }
  //find the user from the id in the req.user._id & add the passowrd field in it
  const user = await User.findById(req.user._id).select("+password");

  //check whether the old passowrd match or not
  if (!(await user.isCorrectPassword(req.body.oldPassword, user.password))) {
    return next(new AppError(401, "Your are not Authorised."));
  }

  // Update the password and password confirm
  user.password = req.body.password;
  user.passwordconfirm = req.body.passwordconfirm;
  await user.save();

  //send back the response with the JWT token also hides the passwords fields
  createSendToken(user, 200, res);
});

const updateUserProfile = catchAsync(async (req, res, next) => {
  //check if req.body contains password or confirm password
  if (req.body.password || req.body.passwordconfirm) {
    return next(
      new AppError(
        400,
        "TO Update passowrd you must use /update-password instead",
      ),
    );
  }

  //Create new object with the updated fields
  const filteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  //update document and send the response
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteUserProfile = catchAsync(async (req, res, next) => {
  // Update user's active status to false (soft delete)
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // 204 No Content for successful deletion
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Only for rendered pages, no errors!
const isLoggedIn = async (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    try {
      // 1) Verify token
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decode.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decode.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

module.exports = {
  signUp,
  login,
  logout,
  isLoggedIn,
  protectMiddleWare,
  CheckUserrRole,
  forgetPassword,
  resetPassword,
  updatePassword,
  updateUserProfile,
  deleteUserProfile,
};
