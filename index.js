import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import adminRoute from "./routes/adminRoute.js";
import familyRoute from "./routes/familyRoute.js";
import route from "./routes/guestRoute.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// CORS configuration for production and development
const allowedOrigins = [
  // Always allow localhost for development
  "http://localhost:3000",
  "http://localhost:3001",
  // Production URLs
  process.env.FRONTEND_URL,
  "https://anthony-and-perla.sparklink.cards/",
  "https://anthony-and-perla.netlify.app/", // Replace with your actual frontend URL
  "https://your-app-name.vercel.app", // If using Vercel
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🔍 CORS Request from origin:", origin);
    console.log("📋 Allowed origins:", allowedOrigins);

    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) {
      console.log("✅ No origin - allowing request");
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log("✅ Origin allowed:", origin);
      callback(null, true);
    } else {
      console.log("❌ Origin blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

console.log("🔧 CORS Allowed Origins:", allowedOrigins);
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🎯 FRONTEND_URL:", process.env.FRONTEND_URL);
app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL;

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Wedding RSVP API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", route);
app.use("/api/family", familyRoute);
app.use("/api/admin", adminRoute);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, "../client/build")));

  // Catch all handler for React Router - using app.use instead of app.get
  app.use((req, res) => {
    // Only serve index.html for GET requests that aren't API routes
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "../client/build", "index.html"));
    } else {
      res.status(404).json({ message: "Route not found" });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

// Note: 404 handler is now integrated into the catch-all handler above

// Database connection and server start
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("✅ Database connected successfully");
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
    console.log(
      "⚠️ Starting server without database connection for testing...",
    );

    // Start server even without database for testing admin routes
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT} (WITHOUT DATABASE)`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(
        `⚠️ Database operations will fail until connection is restored`,
      );
    });
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("✅ Database connection closed");
    process.exit(0);
  });
});

// Updated for admin testing
