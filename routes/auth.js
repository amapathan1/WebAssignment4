const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET REGISTER PAGE
router.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// POST REGISTER USER
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.render("register", { error: "All fields are required" });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.render("register", { error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        return res.redirect("/login");
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        return res.render("register", { error: "Registration failed" });
    }
});

// GET LOGIN PAGE
router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// POST LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", { error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { error: "Invalid email or password" });
        }

        req.session.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email
        };

        return res.redirect("/dashboard");
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.render("login", { error: "Login failed" });
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;
