const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A User must have a name"],
    minlength: [3, "Name must be more than 2 characters"],
    maxlength: [30, "Name must be less than 30 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "A user must enter a password"],
    minlength: 8,
    select: false,
  },
  passwordconfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message:
        "Passwords do not match. Please enter the same password in both fields",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//document middleware that runs before the "save" command
//for removing the passwordConfrim before saving user to MongoDB & to hash the original and updated password
userSchema.pre("save", async function () {
  //this points to current user
  if (!this.isModified("password")) return;
  // hash the actual password
  this.password = await bcrypt.hash(this.password, 10);
  //removing the confirm pass before saving user to DB
  this.passwordconfirm = undefined;
});

userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

//To check the hashed password during user login i am going to make an instance method
userSchema.methods.isCorrectPassword = async function (userPass, hashpass) {
  return await bcrypt.compare(userPass, hashpass);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    // Returns true if password was changed AFTER the token was issued
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed (or field doesn't exist)
  return false;
};

userSchema.pre(/^find/, function () {
  // 'this' points to the current query
  this.find({ active: { $ne: false } });
});

const User = mongoose.model("User", userSchema);
module.exports = User;
