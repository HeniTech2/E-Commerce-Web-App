import express from "express";
import {
    placeOrder,
    placeOrderCBE,
    verifyCBEPayment,
    placeOrderChapa,
    verifyChapaPayment,
    allOrders,
    userOrders,
    singleOrder,
    updateStatus,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import { proofUpload } from "../middleware/multer.js";

const orderRouter = express.Router();

// Admin
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/cbe/verify", adminAuth, verifyCBEPayment);

// User orders
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/chapa", authUser, placeOrderChapa);
// Auth runs FIRST so strangers cannot upload files. The controller reads the
// user from req.userId (multer replaces req.body, so req.body.userId is not used here).
orderRouter.post("/cbe", authUser, proofUpload.single("txProof"), placeOrderCBE);
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/single", authUser, singleOrder);

// Chapa callback (called by Chapa's server — no auth, but we verify with Chapa's API)
orderRouter.get("/chapa/verify", verifyChapaPayment);
orderRouter.post("/chapa/verify", verifyChapaPayment);

export default orderRouter;