import express from "express";
import { listContent, upsertContent, removeContent } from "../controllers/contentController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const contentRouter = express.Router();

// public: storefront reads active content (hero text, banners, promo bar, etc.)
contentRouter.get("/list", listContent);

// admin: create/update a content block (with optional image upload)
contentRouter.post("/save", adminAuth, upload.single("image"), upsertContent);

// admin: delete a content block
contentRouter.post("/remove", adminAuth, removeContent);

export default contentRouter;
