const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");
const { Task } = require("../models/Task");

// DASHBOARD
router.get("/dashboard", requireAuth, async (req, res) => {
    const user = req.session.user;

    const totalTasks = await Task.count({ where: { userId: user.id } });
    const completedTasks = await Task.count({ where: { userId: user.id, status: "completed" } });

    res.render("dashboard", {
        user,
        totalTasks,
        completedTasks
    });
});

// LIST TASKS
router.get("/tasks", requireAuth, async (req, res) => {
    const tasks = await Task.findAll({
        where: { userId: req.session.user.id },
        order: [["id", "ASC"]]
    });

    res.render("tasks", { tasks });
});

// ADD TASK FORM
router.get("/tasks/add", requireAuth, (req, res) => {
    res.render("add-task", { error: null });
});

// ADD TASK
router.post("/tasks/add", requireAuth, async (req, res) => {
    const { title, description, dueDate } = req.body;

    if (!title) {
        return res.render("add-task", { error: "Title is required" });
    }

    await Task.create({
        title,
        description,
        dueDate,
        status: "pending",
        userId: req.session.user.id
    });

    res.redirect("/tasks");
});

// EDIT TASK FORM
router.get("/tasks/edit/:id", requireAuth, async (req, res) => {
    const task = await Task.findByPk(req.params.id);
    res.render("edit-task", { task, error: null });
});

// UPDATE TASK
router.post("/tasks/edit/:id", requireAuth, async (req, res) => {
    const { title, description, dueDate } = req.body;

    if (!title) {
        const task = await Task.findByPk(req.params.id);
        return res.render("edit-task", { task, error: "Title is required" });
    }

    await Task.update(
        { title, description, dueDate },
        { where: { id: req.params.id } }
    );

    res.redirect("/tasks");
});

// DELETE TASK
router.post("/tasks/delete/:id", requireAuth, async (req, res) => {
    await Task.destroy({ where: { id: req.params.id } });
    res.redirect("/tasks");
});

// UPDATE STATUS
router.post("/tasks/status/:id", requireAuth, async (req, res) => {
    const { status } = req.body;

    await Task.update(
        { status },
        { where: { id: req.params.id } }
    );

    res.redirect("/tasks");
});

module.exports = router;
