const express = require("express");
const router = express.Router();
const {
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
  addExpense,
  removeExpense,
} = require("../models/Budget");

// ✅ Set Monthly Budget (Create)
router.post("/set-budget", async (req, res) => {
  try {
    const { month, totalBudget } = req.body;
    const budget = await createBudget(month, totalBudget);
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get Budget Details (Read)
router.get("/:month", async (req, res) => {
  try {
    const budget = await getBudget(req.params.month);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Budget (Update)
router.put("/update-budget/:month", async (req, res) => {
  try {
    const { totalBudget } = req.body;
    const updatedBudget = await updateBudget(req.params.month, totalBudget);
    if (!updatedBudget)
      return res.status(404).json({ message: "Budget not found" });
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete Budget (Delete)
router.delete("/delete-budget/:month", async (req, res) => {
  try {
    const deletedBudget = await deleteBudget(req.params.month);
    if (!deletedBudget)
      return res.status(404).json({ message: "Budget not found" });
    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add an Expense
router.post("/add-expense", async (req, res) => {
  try {
    const { month, description, amount } = req.body;
    const updatedBudget = await addExpense(month, description, amount);
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Remove an Expense
router.delete("/remove-expense/:month/:expenseId", async (req, res) => {
  try {
    const { month, expenseId } = req.params;
    const updatedBudget = await removeExpense(month, expenseId);
    if (!updatedBudget)
      return res.status(404).json({ message: "Expense or Budget not found" });
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
