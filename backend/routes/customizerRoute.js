import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  listNav, createNav, updateNav, deleteNav, reorderNav,
  listFooter, createFooterSection, updateFooterSection, deleteFooterSection,
  createFooterLink, updateFooterLink, deleteFooterLink,
  listSections, createSection, updateSection, deleteSection, reorderSections,
  getBrand, updateBrand,
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
customizerRouter.post("/sections/create",          adminAuth, upload.fields([{ name: "image", maxCount: 1 }, { name: "image2", maxCount: 1 }, { name: "image3", maxCount: 1 }, { name: "image4", maxCount: 1 }, { name: "bgImage", maxCount: 1 }]), createSection);
customizerRouter.post("/sections/update",          adminAuth, upload.fields([{ name: "image", maxCount: 1 }, { name: "image2", maxCount: 1 }, { name: "image3", maxCount: 1 }, { name: "image4", maxCount: 1 }, { name: "bgImage", maxCount: 1 }]), updateSection);
customizerRouter.post("/sections/delete",          adminAuth, deleteSection);
customizerRouter.post("/sections/reorder",         adminAuth, reorderSections);

// ── Brand / Logo (public read, admin write) ────────────────────────────────────
customizerRouter.get("/brand",                     getBrand);
customizerRouter.post("/brand/update",             adminAuth, upload.single("logo"), updateBrand);

export default customizerRouter;