import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import BudgetTracker from "./components/BudgetTracker";
import "./App.css";

const App = () => {
  const [month, setMonth] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  const fetchBudget = useCallback(async () => {
    if (!month) return;
    try {
      setError("");
      const res = await axios.get(`http://localhost:5000/api/budget/${month}`);
      setTotalBudget(res.data.totalBudget || "");
      setRemainingBudget(res.data.remainingBudget || 0);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      setError("Failed to fetch budget. Please try again.");
      console.error("Error fetching budget:", err);
    }
  }, [month]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const res = await axios.post("http://localhost:5000/api/budget/set-budget", {
        month,
        totalBudget: Number(totalBudget),
      });
      setRemainingBudget(res.data.remainingBudget);
      setExpenses(res.data.expenses);
    } catch (err) {
      setError("Error setting budget. Please try again.");
      console.error("Error setting budget:", err);
    }
  };

  return (
    <div className="container">
      <h1>Budget Tracker</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSetBudget} className="form">
        <input
          type="text"
          placeholder="Enter Month (e.g., January)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Total Budget"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
          required
        />
        <button type="submit">Set Budget</button>
      </form>
      <h2>Total Budget: ${totalBudget}</h2>
      <h2>Remaining Budget: ${remainingBudget}</h2>
      <BudgetTracker
        month={month}
        expenses={expenses}
        setExpenses={setExpenses}
        setRemainingBudget={setRemainingBudget}
      />
    </div>
  );
};

export default App;
