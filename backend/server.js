import express from "express";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import prisma from "./prismaClient.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security ──────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// General limiter — high enough for normal browsing + bulk admin uploads
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: "Too many requests, please try again later." },
    skip: (req) => {
        // Never rate-limit static file requests
        return req.path.startsWith("/uploads");
    },
});

// Auth limiter — keep strict to prevent brute-force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many login attempts, please try again later." },
});

// Admin action limiter — generous for bulk product uploads
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: "Too many admin requests, please try again later." },
});

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

app.use(express.json());

// ── Static files (must be before routes) ─────────────────────────
app.use("/uploads", express.static("uploads"));

// ── Routes ────────────────────────────────────────────────────────
app.use("/api/user", authLimiter, userRouter);          // strict: login/register
app.use("/api/product", adminLimiter, productRouter);   // generous: bulk uploads
app.use("/api/cart", limiter, cartRouter);              // normal
app.use("/api/order", limiter, orderRouter);            // normal

app.get("/", (req, res) => res.json({ success: true, message: "Marqato API running" }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start with DB check ───────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`🚀 Marqato server running on port ${PORT}`);
    try {
        await prisma.$connect();
        console.log(`✅ PostgreSQL connected — database ready`);
    } catch (err) {
        console.error(`❌ Database connection failed:`, err.message);
    }
});