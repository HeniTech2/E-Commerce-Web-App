import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  contactUs,
} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/profile/get", authUser, getProfile);
userRouter.post("/profile", authUser, updateProfile);
userRouter.post("/password", authUser, changePassword);
userRouter.get("/list", adminAuth, listUsers);
userRouter.post("/contact", contactUs);

export default userRouter;