const express = require("express");
const bcrypt = require("bcrypt");
const { getDb } = require("../config/db");
const { heartbeats } = require("../services/presenceService");
const { SALT_ROUNDS } = require("../utils/constants");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = getDb();
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

    // check if user is already logged in
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
// ADMIN PASSWORD VERIFICATION (for locked field unlocking)
// ==========================
router.post("/auth/verify-admin-password", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.json({ success: false, message: "Password is required." });
  }

  try {
    const db = getDb();
    const admins = await db
      .collection("users")
      .find({ role: { $in: ["admin", "owner"] } })
      .toArray();

    for (const admin of admins) {
      const match = await bcrypt.compare(password, admin.password);
      if (match) {
        return res.json({ success: true });
      }
    }

    return res.json({ success: false, message: "Incorrect admin password." });
  } catch (err) {
    console.error("Admin password verification failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// REGISTER
// ==========================
router.post("/register", async (req, res) => {
  const { username, name, email, password, role } = req.body;
  try {
    const db = getDb();
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
// LIST USERS (for pickers/dropdowns, e.g. quotation approver select)
// ==========================
router.get("/users", async (req, res) => {
  try {
    const db = getDb();
    const { role } = req.query;

    const filter = role ? { role } : {};

    const users = await db
      .collection("users")
      .find(filter)
      // Never send password hashes to the client, even excluded fields
      // like this are cheap insurance against an accidental future leak.
      .project({ password: 0 })
      .toArray();

    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;
