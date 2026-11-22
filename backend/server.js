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
import wishlistRouter from "./routes/wishlistRoute.js";
import contentRouter from "./routes/contentRoute.js";
import customizerRouter from "./routes/customizerRoute.js";
import chatRouter from "./routes/chatRoute.js";


// ── Required settings ─────────────────────────────────────────────

for (const name of ["JWT_SECRET", "DATABASE_URL"]) {
  if (!process.env[name]) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

// Customer login tokens expire after 7 days unless you set JWT_EXPIRES_IN
process.env.JWT_EXPIRES_IN ||= "7d";


const app = express();

app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;


// ── Security ──────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);


// ── Rate Limit ────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  skip: (req) => req.path.startsWith("/uploads"),
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
});


const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "You're sending messages too fast. Please wait a bit and try again.",
  },
});



// ── CORS ──────────────────────────────────────────────────────────

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",

  // Netlify frontend
  "https://marqato.netlify.app",

  // Vercel frontend
  "https://e-commerce-web-app-nine-puce.vercel.app",

  process.env.CLIENT_URL,
].filter(Boolean);


app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(null, false);
    },

    credentials: true,
  })
);



// ── Body Parser ───────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);



// ── Static Files ──────────────────────────────────────────────────

app.use(
  "/uploads",
  express.static("uploads")
);



// ── Routes ────────────────────────────────────────────────────────

// Strict limit only on login / register / admin login / contact form
app.use(
  [
    "/api/user/login",
    "/api/user/register",
    "/api/user/admin",
    "/api/user/contact",
  ],
  authLimiter
);

app.use(
  "/api/user",
  limiter,
  userRouter
);


app.use(
  "/api/product",
  limiter,
  productRouter
);


app.use(
  "/api/cart",
  limiter,
  cartRouter
);


app.use(
  "/api/order",
  limiter,
  orderRouter
);


app.use(
  "/api/wishlist",
  limiter,
  wishlistRouter
);


app.use(
  "/api/content",
  limiter,
  contentRouter
);


app.use(
  "/api/customizer",
  limiter,
  customizerRouter
);


app.use(
  "/api/chat",
  chatLimiter,
  chatRouter
);



// ── Test API ──────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Marqato API running",
  });
});



// ── Not found (API) ───────────────────────────────────────────────

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Not found",
  });
});



// ── Error Handler ────────────────────────────────────────────────

app.use((err, req, res, next) => {

  // Upload problems (file too large, wrong type) are the customer's to fix
  const status =
    err.status ||
    (err.name === "MulterError" ? 400 : 500);

  if (status >= 500) {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message:
      status < 500
        ? err.message
        : "Internal server error",
  });

});



// ── Start Server ─────────────────────────────────────────────────

app.listen(
  PORT,
  "0.0.0.0",
  async () => {

    console.log(
      `🚀 Marqato server running on port ${PORT}`
    );


    try {

      await prisma.$connect();

      console.log(
        "✅ PostgreSQL connected — database ready"
      );

    } catch (err) {

      console.error(
        "❌ Database connection failed:",
        err.message
      );

    }

  }
);