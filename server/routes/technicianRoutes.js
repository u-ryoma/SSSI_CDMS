const express = require("express");
const { getDb } = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    // Adjust this filter if technicians should be identified differently
    // (e.g. a dedicated `isTechnician` boolean instead of role alone).
    const technicians = await db
      .collection("users")
      .find({ role: "technician" })
      .project({ password: 0 })
      .sort({ name: 1 })
      .toArray();
    res.json(technicians);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
