
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        message: "Too many attempts. Try again later."
    }
});

// Cookie settings
const cookieOpts = () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

// Generate JWT
const sign = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Public user information
const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email
});

// REGISTER
router.post("/register", limiter, async (req, res) => {
    try {
        const {
            name = "",
            email = "",
            password = ""
        } = req.body;

        if (name.trim().length < 2) {
            return res.status(400).json({
                message: "Enter your name."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Enter a valid email."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        res.cookie("token", sign(user._id), cookieOpts());

        return res.status(201).json({
            user: publicUser(user)
        });

    } catch (error) {
        console.error("Registration Error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

// LOGIN
router.post("/login", limiter, async (req, res) => {
    try {
        const {
            email = "",
            password = ""
        } = req.body;

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        const isValid = user &&
            await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({
                message: "Wrong email or password."
            });
        }

        res.cookie("token", sign(user._id), cookieOpts());

        return res.json({
            user: publicUser(user)
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

// LOGOUT
router.post("/logout", (req, res) => {
    res.clearCookie("token", cookieOpts());

    return res.json({
        ok: true,
        message: "Logged out successfully"
    });
});

// CURRENT USER
router.get("/me", requireAuth, (req, res) => {
    return res.json({
        user: publicUser(req.user)
    });
});

export default router;
