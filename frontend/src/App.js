import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [month, setMonth] = useState("January");
  const [totalBudget, setTotalBudget] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  useEffect(() => {
    fetchBudget();
  }, [month]);

  const fetchBudget = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/budget/${month}`);
      setTotalBudget(res.data.totalBudget);
      setRemainingBudget(res.data.remainingBudget);
      setExpenses(res.data.expenses);
    } catch (error) {
      console.error("Error fetching budget", error);
    }
  };

  const handleSetBudget = async () => {
    try {
      await axios.post("http://localhost:5000/api/budget", { month, totalBudget });
      fetchBudget();
    } catch (error) {
      console.error("Error setting budget", error);
    }
  };

  const handleAddExpense = async () => {
    try {
      await axios.post(`http://localhost:5000/api/budget/${month}/add-expense`, { description, amount });
      setDescription("");
      setAmount("");
      fetchBudget();
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  const handleEditExpense = (expense) => {
    setEditMode(true);
    setEditExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount);
  };

  const handleUpdateExpense = async () => {
    try {
      await axios.put(`http://localhost:5000/api/budget/${month}/update-expense`, {
        oldDescription: editExpense.description,
        newDescription: description,
        newAmount: amount,
      });
      setEditMode(false);
      setEditExpense(null);
      setDescription("");
      setAmount("");
      fetchBudget();
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  const handleDeleteExpense = async (desc) => {
    try {
      await axios.delete(`http://localhost:5000/api/budget/${month}/delete-expense`, {
        data: { description: desc },
      });
      fetchBudget();
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };

  return (
    <div className="budget-container">
      <h1>Budget Manager</h1>

      <div className="month-selector">
        <label>Month: </label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
            (m) => (
              <option key={m} value={m}>
                {m}
              </option>
            )
          )}
        </select>
      </div>

      <div className="budget-input">
        <label>Set Budget: </label>
        <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} />
        <button onClick={handleSetBudget} className="btn primary">Set</button>
      </div>

      <div className="budget-summary">
        <h3>Total Budget: <span>${totalBudget}</span></h3>
        <h3>Remaining Budget: <span className={remainingBudget < 0 ? "over-budget" : ""}>${remainingBudget}</span></h3>
      </div>

      <div className="expense-form">
        <h3>{editMode ? "Edit Expense" : "Add Expense"}</h3>
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {editMode ? (
          <button onClick={handleUpdateExpense} className="btn edit">Update</button>
        ) : (
          <button onClick={handleAddExpense} className="btn add">Add</button>
        )}
      </div>

      <h3>Expenses</h3>
      <ul className="expense-list">
        {expenses.map((expense, index) => (
          <li key={index} className="expense-item">
            <span className="description">{expense.description}</span>
            <span className="amount">${expense.amount}</span>
            <div className="expense-actions">
              <button onClick={() => handleEditExpense(expense)} className="btn edit">Edit</button>
              <button onClick={() => handleDeleteExpense(expense.description)} className="btn delete">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
