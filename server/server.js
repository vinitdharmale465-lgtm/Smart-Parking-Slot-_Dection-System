
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

// ---------- DNS Configuration ----------
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ---------- Directory ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- Express App ----------
const app = express();

// ---------- Middleware ----------
app.use(express.json());
app.use(cookieParser());

// ---------- Authentication Routes ----------
app.use("/api/auth", authRoutes);

app.get("/api/dashboard", requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dashboard access successful"
  });
});

// ---------- Smart Parking API ----------
app.get("/api/parking/status", (req, res) => {
  res.status(200).json({
    success: true,
    data: getParkingData()
  });
});

// ---------- Production Frontend ----------
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../client/dist");

  app.use(express.static(dist));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

// ---------- MongoDB Connection ----------
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }

    if (
      !process.env.MQTT_HOST ||
      !process.env.MQTT_USERNAME ||
      !process.env.MQTT_PASSWORD
    ) {
      throw new Error("MQTT environment variables are missing");
    }

    const mongoUrl = new URL(process.env.MONGO_URI);

    console.log("--------------------------------");
    console.log("MongoDB Host:", mongoUrl.hostname);
    console.log("Database:", mongoUrl.pathname);
    console.log("DNS Servers:", dns.getServers());
    console.log("--------------------------------");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000
    });

    console.log("MongoDB Connected Successfully");

    // ---------- Connect MQTT ----------
    connectMQTT();

    // ---------- Start Server ----------
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

// ---------- Start Application ----------
startServer();
