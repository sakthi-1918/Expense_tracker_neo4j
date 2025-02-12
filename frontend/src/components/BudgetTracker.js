import React, { useState } from "react";
import axios from "axios";

const BudgetTracker = ({ month, expenses, setExpenses, setRemainingBudget }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [editExpenseId, setEditExpenseId] = useState(null);

  // Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/budget/add-expense", { 
        month, 
        description, 
        amount: parseFloat(amount) 
      });
      setRemainingBudget(res.data.remainingBudget);
      setExpenses(res.data.expenses);
      setDescription("");
      setAmount("");
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  // Edit Expense
  const handleEditExpense = async (e) => {
    e.preventDefault();
    if (!editExpenseId) return;
    
    try {
      const res = await axios.put(`http://localhost:5000/api/budget/edit-expense/${month}/${editExpenseId}`, {
        description,
        amount: parseFloat(amount),
      });
      setRemainingBudget(res.data.remainingBudget);
      setExpenses(res.data.expenses);
      setEditExpenseId(null);
      setDescription("");
      setAmount("");
    } catch (err) {
      console.error("Error updating expense:", err);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/budget/delete-expense/${month}/${expenseId}`);
      setRemainingBudget(res.data.remainingBudget);
      setExpenses(res.data.expenses);
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  // Prepare Edit
  const handleEditClick = (expenseId, description, amount) => {
    setEditExpenseId(expenseId);
    setDescription(description);
    setAmount(amount);
  };

  return (
    <div>
      <form onSubmit={editExpenseId ? handleEditExpense : handleAddExpense} className="expense-form">
        <input
          type="text"
          placeholder="Expense Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">{editExpenseId ? "Update Expense" : "Add Expense"}</button>
      </form>

      <h2>Expenses</h2>
      <ul>
        {expenses.map((exp) => (
          <li key={exp._id}>
            {exp.description} - ${exp.amount} - {new Date(exp.date).toLocaleDateString()}
            <button onClick={() => handleEditClick(exp._id, exp.description, exp.amount)}>Edit</button>
            <button onClick={() => handleDeleteExpense(exp._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BudgetTracker;
