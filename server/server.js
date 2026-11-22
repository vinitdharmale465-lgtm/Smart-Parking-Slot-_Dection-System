
import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dns from "node:dns";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";
import { connectMQTT, getParkingData } from "./mqtt.js";

// DNS Configuration
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Directory Configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Express Application
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Dashboard Authentication
app.get("/api/dashboard", requireAuth, (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Dashboard access successful"
  });
});

// Smart Parking API
app.get("/api/parking/status", (_req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");

  res.status(200).json({
    success: true,
    data: getParkingData()
  });
});

// Production Frontend
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../client/dist");

  app.use(express.static(dist));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

// Start Application
async function startServer() {
  try {
    // Check Environment Variables
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    if (
      !process.env.MQTT_HOST ||
      !process.env.MQTT_USERNAME ||
      !process.env.MQTT_PASSWORD
    ) {
      throw new Error("MQTT environment variables are missing");
    }

    // MongoDB Connection
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000
    });

    console.log("MongoDB Connected Successfully");

    // MQTT Connection
    connectMQTT();

    // Start Express Server
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server Startup Error:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
