import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  listNav, createNav, updateNav, deleteNav, reorderNav,
  listFooter, createFooterSection, updateFooterSection, deleteFooterSection,
  createFooterLink, updateFooterLink, deleteFooterLink,
  listSections, createSection, updateSection, deleteSection, reorderSections,
} from "../controllers/customizerController.js";

const customizerRouter = express.Router();

// ── Nav (public read, admin write) ─────────────────────────────────────────────
customizerRouter.get("/nav",               listNav);
customizerRouter.post("/nav/create",       adminAuth, createNav);
customizerRouter.post("/nav/update",       adminAuth, updateNav);
customizerRouter.post("/nav/delete",       adminAuth, deleteNav);
customizerRouter.post("/nav/reorder",      adminAuth, reorderNav);

// ── Footer (public read, admin write) ─────────────────────────────────────────
customizerRouter.get("/footer",                    listFooter);
customizerRouter.post("/footer/section/create",    adminAuth, createFooterSection);
customizerRouter.post("/footer/section/update",    adminAuth, updateFooterSection);
customizerRouter.post("/footer/section/delete",    adminAuth, deleteFooterSection);
customizerRouter.post("/footer/link/create",       adminAuth, createFooterLink);
customizerRouter.post("/footer/link/update",       adminAuth, updateFooterLink);
customizerRouter.post("/footer/link/delete",       adminAuth, deleteFooterLink);

// ── Page sections (public read, admin write) ───────────────────────────────────
customizerRouter.get("/sections",                  listSections);
customizerRouter.post("/sections/create",          adminAuth, upload.single("image"), createSection);
customizerRouter.post("/sections/update",          adminAuth, upload.single("image"), updateSection);
customizerRouter.post("/sections/delete",          adminAuth, deleteSection);
customizerRouter.post("/sections/reorder",         adminAuth, reorderSections);

export default customizerRouter;