require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const driver = neo4j.driver(
  process.env.NEO4J_URI, 
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const session = driver.session();

// **1. Get Budget for a Month**
app.get("/api/budget/:month", async (req, res) => {
  const { month } = req.params;
  try {
    const result = await session.run(
      `MATCH (b:Budget {month: $month}) 
       OPTIONAL MATCH (b)-[:HAS_EXPENSE]->(e:Expense)
       RETURN b, COLLECT(e) AS expenses`,
      { month }
    );

    if (result.records.length === 0) return res.status(404).json({ message: "Budget not found" });

    const budgetNode = result.records[0].get("b").properties;
    const expenses = result.records[0].get("expenses").map(expense => expense.properties);

    res.json({ ...budgetNode, expenses });
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **2. Set Budget for a Month**
app.post("/api/budget", async (req, res) => {
  const { month, totalBudget } = req.body;
  try {
    await session.run(
      `MERGE (b:Budget {month: $month})
       SET b.totalBudget = toFloat($totalBudget), b.remainingBudget = toFloat($totalBudget)`,
      { month, totalBudget: parseFloat(totalBudget) }
    );

    res.json({ message: "Budget set successfully" });
  } catch (error) {
    console.error("Error setting budget:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **3. Add Expense to a Month**
app.post("/api/budget/:month/add-expense", async (req, res) => {
  const { month } = req.params;
  const { description, amount } = req.body;

  try {
    const result = await session.run(
      `MATCH (b:Budget {month: $month})
       CREATE (e:Expense {description: $description, amount: toFloat($amount)})
       CREATE (b)-[:HAS_EXPENSE]->(e)
       SET b.remainingBudget = toFloat(b.remainingBudget) - toFloat($amount)
       RETURN b, e`,
      { month, description, amount: parseFloat(amount) }
    );

    if (result.records.length === 0) return res.status(404).json({ message: "Budget not found" });

    res.json({ message: "Expense added successfully" });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **4. Update an Expense** (without using expense ID)
app.put("/api/budget/:month/update-expense", async (req, res) => {
  const { month } = req.params;
  const { oldDescription, newDescription, newAmount } = req.body;

  try {
    const result = await session.run(
      `MATCH (b:Budget {month: $month})-[:HAS_EXPENSE]->(e:Expense {description: $oldDescription})
       SET b.remainingBudget = toFloat(b.remainingBudget) + toFloat(e.amount) - toFloat($newAmount),
           e.description = $newDescription,
           e.amount = toFloat($newAmount)
       RETURN b, e`,
      { month, oldDescription, newDescription, newAmount: parseFloat(newAmount) }
    );

    if (result.records.length === 0) return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense updated successfully" });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **5. Delete an Expense** (without using expense ID)
app.delete("/api/budget/:month/delete-expense", async (req, res) => {
  const { month } = req.params;
  const { description } = req.body;

  try {
    const result = await session.run(
      `MATCH (b:Budget {month: $month})-[:HAS_EXPENSE]->(e:Expense {description: $description})
       SET b.remainingBudget = toFloat(b.remainingBudget) + toFloat(e.amount)
       DETACH DELETE e
       RETURN b`,
      { month, description }
    );

    if (result.records.length === 0) return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **Start the Server**
app.listen(5000, () => console.log("Server running on port 5000"));
