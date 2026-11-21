
import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dns from "node:dns";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

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
      throw new Error("MONGO_URI is missing from the .env file");
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

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB / Server Startup Error:");
    console.error(error.message);

    process.exit(1);
  }
}

// ---------- Start Application ----------
startServer();
