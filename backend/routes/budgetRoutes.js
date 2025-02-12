const express = require("express");
const router = express.Router();
const { createBudget, getBudget, addExpense } = require("../models/Budget");

// Set monthly budget
router.post("/set-budget", async (req, res) => {
  try {
    const { month, totalBudget } = req.body;
    const budget = await createBudget(month, totalBudget);
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budget details
router.get("/:month", async (req, res) => {
  try {
    const budget = await getBudget(req.params.month);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add an expense
router.post("/add-expense", async (req, res) => {
  try {
    const { month, description, amount } = req.body;
    const updatedBudget = await addExpense(month, description, amount);
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
