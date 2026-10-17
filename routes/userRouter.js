const express = require("express");
const upload = require('../utils/MulterUtil');

const userRouter = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  resizeUserPhoto
} = require("../controllers/userController");
const {
  signUp,
  login,
  logout,
  protectMiddleWare,
  forgetPassword,
  resetPassword,
  updatePassword,
  updateUserProfile,
  deleteUserProfile,
  CheckUserrRole,
} = require("../controllers/authController");

//Routes Related to Authentication & Authorization
userRouter.post("/sign-up", signUp);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.patch("/reset-password/:token", resetPassword);
userRouter.patch("/update-password", protectMiddleWare, updatePassword);
userRouter.patch("/updateProfile", protectMiddleWare, upload.single('photo'), resizeUserPhoto, updateUserProfile);
userRouter.delete("/deleteProfile", protectMiddleWare, deleteUserProfile);
userRouter.post("/forget-password", forgetPassword);

//General User Routes for admin
userRouter
  .route("/")
  .get(protectMiddleWare, CheckUserrRole("admin"), getAllUsers)
  .post(protectMiddleWare, CheckUserrRole("admin"), createUser);
userRouter
  .route("/:id")
  .get(protectMiddleWare, CheckUserrRole("admin"), getUserById)
  .patch(protectMiddleWare, CheckUserrRole("admin"), updateUser)
  .delete(protectMiddleWare, CheckUserrRole("admin"), deleteUser);

module.exports = userRouter;
