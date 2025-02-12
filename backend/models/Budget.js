const driver = require("../config/database");

// ✅ Create a new budget (MERGE ensures uniqueness)
const createBudget = async (month, totalBudget) => {
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (b:Budget {month: $month}) 
      SET b.totalBudget = $totalBudget, 
          b.remainingBudget = $totalBudget
      `,
      { month, totalBudget }
    );
    return { month, totalBudget, remainingBudget: totalBudget };
  } finally {
    await session.close();
  }
};

// ✅ Get budget details
const getBudget = async (month) => {
  const session = driver.session();
  try {
    const result = await session.run(
      "MATCH (b:Budget {month: $month}) RETURN b",
      { month }
    );
    return result.records.length ? result.records[0].get("b").properties : null;
  } finally {
    await session.close();
  }
};

// ✅ Update budget amount
const updateBudget = async (month, totalBudget) => {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (b:Budget {month: $month}) 
      SET b.totalBudget = $totalBudget,
          b.remainingBudget = b.remainingBudget + ($totalBudget - b.totalBudget)
      `,
      { month, totalBudget }
    );
    return getBudget(month);
  } finally {
    await session.close();
  }
};

// ✅ Delete a budget and its expenses
const deleteBudget = async (month) => {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (b:Budget {month: $month})-[r:HAS_EXPENSE]->(e:Expense)
      DETACH DELETE b, e
      `,
      { month }
    );
    return { message: "Budget deleted successfully" };
  } finally {
    await session.close();
  }
};

// ✅ Add an expense and update remaining budget
const addExpense = async (month, description, amount) => {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (b:Budget {month: $month}) 
      CREATE (b)-[:HAS_EXPENSE]->(e:Expense {
        id: randomUUID(),
        description: $description, 
        amount: $amount, 
        date: datetime()
      })
      SET b.remainingBudget = b.remainingBudget - $amount
      `,
      { month, description, amount }
    );
    return getBudget(month);
  } finally {
    await session.close();
  }
};

// ✅ Remove an expense and update remaining budget
const removeExpense = async (month, expenseId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (b:Budget {month: $month})-[:HAS_EXPENSE]->(e:Expense {id: $expenseId}) 
      WITH b, e.amount AS expenseAmount 
      DELETE e 
      SET b.remainingBudget = b.remainingBudget + expenseAmount
      RETURN b
      `,
      { month, expenseId }
    );
    return result.records.length ? result.records[0].get("b").properties : null;
  } finally {
    await session.close();
  }
};

module.exports = {
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
  addExpense,
  removeExpense,
};
