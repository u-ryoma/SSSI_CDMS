const { MongoClient } = require("mongodb");

// ✅ FIXED MongoDB URI
const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("ryodb");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

// Routes call this lazily (at request time, not at require time) so they
// always see the connection once connectDB() has resolved.
function getDb() {
  if (!db) {
    throw new Error("Database not initialized yet");
  }
  return db;
}

module.exports = { connectDB, getDb, client };
