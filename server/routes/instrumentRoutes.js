const express = require("express");
const { getDb } = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const newInstrument = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    await db.collection("instruments").insertOne(newInstrument);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const instruments = await db.collection("instruments").find().sort({ createdAt: -1 }).toArray();
    res.json(instruments); // must be a plain array, not { data: [...] }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
