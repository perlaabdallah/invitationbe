import express from "express";
import { importFamilies } from "../controller/adminController.js";

const adminRoute = express.Router();

// Rate limiting middleware (basic implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per window

const rateLimiter = (req, res, next) => {
  const clientId = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean old entries
  for (const [id, data] of requestCounts.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      requestCounts.delete(id);
    }
  }
  
  // Check current client
  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, {
      count: 1,
      firstRequest: now
    });
  } else {
    const clientData = requestCounts.get(clientId);
    if (now - clientData.firstRequest > RATE_LIMIT_WINDOW) {
      // Reset window
      clientData.count = 1;
      clientData.firstRequest = now;
    } else {
      clientData.count++;
      if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later."
        });
      }
    }
  }
  
  next();
};

// Apply rate limiting to all admin routes
adminRoute.use(rateLimiter);

// POST - Import families from Excel data
adminRoute.post("/import-families", importFamilies);

export default adminRoute;