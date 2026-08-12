const express = require("express");
const { getDb } = require("../config/db");
const { getNextSequence, pad4, currentYearSuffix } = require("../utils/counters");

const router = express.Router();

// GET next JR ID preview
// NOTE: must stay registered before "/:jrId" below, or Express will try to
// match "next-id" as a jrId value.
router.get("/next-id", async (req, res) => {
  try {
    const db = getDb();
    const counter = await db.collection("counters").findOne({ _id: "jobReceiptID" });
    const nextSeq = (counter?.seq || 0) + 1;
    const nextJrId = `JR/${pad4(nextSeq)}/${currentYearSuffix()}`;
    res.json({ nextJrId });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const receipts = await db.collection("jobreceipts").find().sort({ createdAt: -1 }).toArray();
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const seq = await getNextSequence(db, "jobReceiptID");
    const jrId = `JR/${pad4(seq)}/${currentYearSuffix()}`;

    const newReceipt = {
      ...req.body,
      jrId,
      createdAt: new Date().toISOString(),
    };

    await db.collection("jobreceipts").insertOne(newReceipt);
    res.status(201).json({ success: true, jrId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET a single job receipt by jrId — used by JobReceipt.jsx's row-click
// handler to refresh a receipt with the latest saved data.
router.get("/:jrId", async (req, res) => {
  try {
    const db = getDb();
    const receipt = await db
      .collection("jobreceipts")
      .findOne({ jrId: decodeURIComponent(req.params.jrId) });

    if (!receipt) {
      return res.status(404).json({ success: false, message: "Job receipt not found" });
    }
    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT update an existing job receipt by jrId — used by JobReceipt.jsx's
// handleSave when isEditMode is true.
router.put("/:jrId", async (req, res) => {
  try {
    const db = getDb();
    // jrId is the lookup key (never rewritten); jobNumbers is always sent as
    // [] from the frontend since job numbers are saved separately.
    const { jrId, jobNumbers, ...updateData } = req.body;
    const targetJrId = decodeURIComponent(req.params.jrId);

    const result = await db
      .collection("jobreceipts")
      .updateOne({ jrId: targetJrId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Job receipt not found" });
    }
    res.json({ success: true, jrId: targetJrId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
