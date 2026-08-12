const express = require("express");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const { SALT_ROUNDS } = require("../utils/constants");

const router = express.Router();

// ==========================
// ACCOUNTS CRUD
// ==========================
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const accounts = await db.collection("users").find().toArray();
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { username, name, email, role, password } = req.body;
  try {
    const db = getDb();
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

router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

module.exports = router;
