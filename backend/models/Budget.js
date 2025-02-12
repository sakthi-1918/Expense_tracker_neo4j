const driver = require("../config/database");

const createBudget = async (month, totalBudget) => {
  const session = driver.session();
  try {
    await session.run(
      "MERGE (b:Budget {month: $month}) SET b.totalBudget = $totalBudget, b.remainingBudget = $totalBudget",
      { month, totalBudget }
    );
    return { month, totalBudget, remainingBudget: totalBudget };
  } finally {
    await session.close();
  }
};

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

const addExpense = async (month, description, amount) => {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (b:Budget {month: $month})
      CREATE (b)-[:HAS_EXPENSE]->(e:Expense {description: $description, amount: $amount, date: datetime()})
      SET b.remainingBudget = b.remainingBudget - $amount
      `,
      { month, description, amount }
    );
    return getBudget(month);
  } finally {
    await session.close();
  }
};

module.exports = { createBudget, getBudget, addExpense };
