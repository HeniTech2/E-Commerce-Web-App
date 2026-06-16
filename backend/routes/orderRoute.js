import express from "express";
import {
    placeOrder,
    placeOrderChapa,
    verifyChapaPayment,
    allOrders,
    userOrders,
    updateStatus,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

// User orders
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/chapa", authUser, placeOrderChapa);
orderRouter.post("/userorders", authUser, userOrders);

// Chapa callback (called by Chapa server — no auth)
orderRouter.get("/chapa/verify", verifyChapaPayment);
orderRouter.post("/chapa/verify", verifyChapaPayment);

export default orderRouter;
