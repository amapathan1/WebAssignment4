require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const { sequelize } = require("./models/Task");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

// ----------------- MIDDLEWARE -----------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// ----------------- SESSION -----------------
app.use(session({
    secret: process.env.SESSION_SECRET, // use secret from .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000, // 30 minutes
    }
}));

// ----------------- EJS -----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----------------- DATABASE CONNECTIONS -----------------
async function connectDatabases() {
    // MongoDB
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✔ MongoDB connected");
    } catch (err) {
        console.log("❌ MongoDB error:", err.message);
    }

    // PostgreSQL
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("✔ PostgreSQL connected");
    } catch (err) {
        console.log("❌ PostgreSQL error:", err.message);
    }
}

connectDatabases();

// ----------------- ROUTES -----------------
app.use("/", authRoutes);
app.use("/", taskRoutes);

// ----------------- DEFAULT ROOT -----------------
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Only listen locally (development)
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}

// Export app for Vercel
module.exports = app;
