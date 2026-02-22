import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
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

// CORS configuration for production
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          process.env.FRONTEND_URL,
          "https://fourthdraftfourth.netlify.app/", // Replace with your actual frontend URL
          "https://your-app-name.vercel.app",
          "http://localhost:3000",// If using Vercel
        ]
      : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  optionsSuccessStatus: 200,
};
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

// Debug endpoint to check database connection
app.get("/debug", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Try to count documents
    const Family = mongoose.model('Family');
    const familyCount = await Family.countDocuments();
    const allFamilies = await Family.find().limit(5);
    
    res.status(200).json({
      database: {
        state: dbStates[dbState],
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        familyCount,
        sampleFamilies: allFamilies
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      database: {
        state: mongoose.connection.readyState
      }
    });
  }
});

// API Routes
app.use("/api", route);
app.use("/api/family", familyRoute);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, "../client/build")));

  // Catch all handler for React Router - using app.use instead of app.get
  app.use((req, res) => {
    // Only serve index.html for GET requests that aren't API routes
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, "../client/build", "index.html"));
    } else {
      res.status(404).json({ message: "Route not found" });
    }
  // Catch all handler for React Router - using app.use instead of app.get
  app.use((req, res) => {
    // Only serve index.html for GET requests that aren't API routes
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
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
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("✅ Database connection closed");
    process.exit(0);
  });
});
