require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;
const app = express();

app.use(
  cors({
    origin: true, // Allow ALL origins during development
  }),
);

app.use(express.json());

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

// Initialize DB connection
connectDB();

// ✅ Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    if (db) {
      await db.command({ ping: 1 });
      res.json({ status: "healthy", db: "connected" });
    } else {
      res.status(503).json({ status: "unhealthy", db: "connecting" });
    }
  } catch (error) {
    res.status(500).json({ status: "unhealthy" });
  }
});

// ==========================
// HEARTBEAT SYSTEM
// ==========================
// const heartbeats = {};

// app.post("/api/heartbeat", (req, res) => {
//   const { username } = req.body;
//   heartbeats[username] = Date.now();
//   res.json({ success: true });
// });

// app.get("/api/active-users", (req, res) => {
//   const now = Date.now();
//   const activeUsers = Object.entries(heartbeats)
//     .filter(([_, lastSeen]) => now - lastSeen < 60000) // 1 minute
//     .map(([username]) => username);
//   res.json(activeUsers);
// });
const heartbeats = {};
const userInfo = {}; // ← store user info for logging

app.post("/api/heartbeat", (req, res) => {
  const { username, name, role } = req.body;
  heartbeats[username] = Date.now();
  // ← store user info
  if (name) userInfo[username] = { name, role };
  res.json({ success: true });
});

app.get("/api/active-users", (req, res) => {
  const now = Date.now();
  const activeUsers = Object.entries(heartbeats)
    .filter(([_, lastSeen]) => now - lastSeen < 60000)
    .map(([username]) => username);
  res.json(activeUsers);
});

// ← Add this - checks every 30 seconds for expired heartbeats
setInterval(async () => {
  const now = Date.now();
  for (const [username, lastSeen] of Object.entries(heartbeats)) {
    if (now - lastSeen >= 60000) {
      // user has been inactive for 60 seconds - log them out
      try {
        await db.collection("logs").insertOne({
          username,
          name: userInfo[username]?.name || username,
          role: userInfo[username]?.role || "unknown",
          action: "logged out",
          timestamp: new Date().toISOString(),
        });
        console.log(`Auto logged out: ${username}`);
      } catch (err) {
        console.error("Auto logout log error:", err);
      }
      // remove from heartbeats
      delete heartbeats[username];
      delete userInfo[username];
    }
  }
}, 30000);

app.post("/api/logout", (req, res) => {
  const { username } = req.body;
  delete heartbeats[username];
  res.json({ success: true });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.collection("users").findOne({ email });
    if (!user)
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });

    // ← check if user is already logged in
    if (
      heartbeats[user.username] &&
      Date.now() - heartbeats[user.username] < 60000
    ) {
      return res.json({
        success: false,
        message: "This account is already logged in on another device.",
      });
    }

    heartbeats[user.username] = Date.now();
    res.json({
      success: true,
      username: user.username,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ==========================
// LOGS
// ==========================
app.post("/api/logs", async (req, res) => {
  try {
    const { username, name, role, action, timestamp } = req.body;
    await db.collection("logs").insertOne({
      username,
      name,
      role,
      action,
      timestamp: timestamp || new Date().toISOString(),
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/logs", async (req, res) => {
  try {
    const logs = await db
      .collection("logs")
      .find()
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching logs");
  }
});

// ==========================
// REGISTER
// ==========================
app.post("/api/register", async (req, res) => {
  const { username, name, email, password, role } = req.body;
  try {
    const existing = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await db.collection("users").insertOne({
      username,
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// ACCOUNTS CRUD
// ==========================
app.get("/api/accounts", async (req, res) => {
  try {
    const accounts = await db.collection("users").find().toArray();
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/accounts/:id", async (req, res) => {
  const { username, name, email, role, password } = req.body;
  try {
    const updateData = { username, name, email, role };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    res.json({ success: true, message: "Account updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

app.delete("/api/accounts/:id", async (req, res) => {
  try {
    await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// ✅ Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing DB connection");
  await client.close();
  process.exit(0);
});

// ✅ FIXED PORT - Works on Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
