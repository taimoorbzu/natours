const express = require("express");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    // e.g. image/jpeg -> jpg/jpeg, image/png -> png
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

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
userRouter.patch("/updateProfile", protectMiddleWare, upload.single('photo'), updateUserProfile);
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
