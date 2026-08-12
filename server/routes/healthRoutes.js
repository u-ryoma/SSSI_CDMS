const express = require("express");
const { getDb } = require("../config/db");

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    let db;
    try {
      db = getDb();
    } catch {
      // DB hasn't finished connecting yet
      return res.status(503).json({ status: "unhealthy", db: "connecting" });
    }
    await db.command({ ping: 1 });
    res.json({ status: "healthy", db: "connected" });
  } catch (error) {
    res.status(500).json({ status: "unhealthy" });
  }
});

module.exports = router;
