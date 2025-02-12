const express = require("express");
const neo4j = require("neo4j-driver");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Neo4j Database Connection
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Function to test connection
const testDBConnection = async () => {
  const session = driver.session();
  try {
    const result = await session.run("RETURN 'Neo4j is connected' AS message");
    console.log(result.records[0].get("message"));
  } catch (error) {
    console.error("❌ Database connection error:", error);
  } finally {
    await session.close();
  }
};

// Call the function to check database connection
testDBConnection();

// Middleware
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Server is running and Neo4j connection is being checked!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
