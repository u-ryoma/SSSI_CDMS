const express = require("express");
const { getDb } = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const db = getDb();
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

router.get("/", async (req, res) => {
  try {
    const db = getDb();
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

module.exports = router;
