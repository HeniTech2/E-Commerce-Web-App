import express from "express";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import prisma from "./prismaClient.js";

// Routes
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import wishlistRouter from "./routes/wishlistRoute.js";
import contentRouter from "./routes/contentRoute.js";
import customizerRouter from "./routes/customizerRoute.js";

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

/* ───────────────── SECURITY ───────────────── */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ───────────────── RATE LIMIT ───────────────── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: "Too many requests, try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts." },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: "Too many admin requests." },
});

/* ───────────────── CORS (FIXED PRODUCTION) ───────────────── */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://marqato.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ───────────────── MIDDLEWARE ───────────────── */
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ───────────────── ROUTES ───────────────── */
app.use("/api/user", authLimiter, userRouter);
app.use("/api/product", adminLimiter, productRouter);
app.use("/api/cart", limiter, cartRouter);
app.use("/api/order", limiter, orderRouter);
app.use("/api/wishlist", limiter, wishlistRouter);
app.use("/api/content", limiter, contentRouter);
app.use("/api/customizer", limiter, customizerRouter);

/* ───────────────── HEALTH CHECK ───────────────── */
app.get("/", (req, res) =>
  res.json({ success: true, message: "Marqato API running" })
);

/* ───────────────── ERROR HANDLER ───────────────── */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* ───────────────── START SERVER ───────────────── */
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
});