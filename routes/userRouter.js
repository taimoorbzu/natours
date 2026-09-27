const express = require("express");
const userRouter = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
} = require("../controllers/userController");
const {
  signUp,
  login,
  forgetPassword,
  resetPassword,
  updatePassword,
  updateUserProfile,
  deleteUserProfile,
  CheckUserrRole
} = require("../controllers/authController");
const { protectMiddleWare } = require("../controllers/authController");

//Routes Related to Authentication & Authorization
userRouter.post("/sign-up", signUp);
userRouter.post("/login", login);
userRouter.patch("/reset-password/:token", resetPassword);
userRouter.patch("/update-password", protectMiddleWare, updatePassword);
userRouter.patch("/updateProfile", protectMiddleWare, updateUserProfile);
userRouter.delete("/deleteProfile", protectMiddleWare, deleteUserProfile);
userRouter.post("/forget-password", forgetPassword);

//General User Routes for admin
userRouter
  .route("/")
  .get(getAllUsers)
  .post(protectMiddleWare, CheckUserrRole("admin"), createUser);
userRouter
  .route("/:id")
  .get(getUserById)
  .patch(protectMiddleWare, CheckUserrRole("admin"), updateUser)
  .delete(protectMiddleWare, CheckUserrRole("admin"), deleteUser);

module.exports = userRouter;
