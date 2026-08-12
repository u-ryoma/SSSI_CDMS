const express = require("express");
const router = express.Router();
const { getDb } = require("../config/db"); // adjust if your db export differs

const COLLECTION = "sitecalibrations";
const COUNTER_KEY = "siteCalibrationId";

// Helper: current 2-digit year, e.g. 2026 -> "26"
const currentYearSuffix = () => String(new Date().getFullYear()).slice(-2);

// Helper: build "SC/0006/26" from a raw counter number
const formatScId = (seq) => {
  const padded = String(seq).padStart(4, "0");
  return `SC/${padded}/${currentYearSuffix()}`;
};

// ==========================
// GET /api/sitecalibrations
// List all site calibration records
// ==========================
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const records = await db
      .collection(COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(records);
  } catch (err) {
    console.error("Failed to fetch site calibrations:", err);
    res.status(500).json({ message: "Failed to fetch site calibrations" });
  }
});

// ==========================
// GET /api/sitecalibrations/next-id
// Peek at what the next SC ID would be (does NOT increment)
// NOTE: must be registered BEFORE /:id or Express will treat "next-id"
// as an :id param.
// ==========================
router.get("/next-id", async (req, res) => {
  try {
    const db = getDb();
    const counterDoc = await db
      .collection("counters")
      .findOne({ _id: COUNTER_KEY });
    const nextSeq = (counterDoc?.seq || 0) + 1;
    res.json({ nextScId: formatScId(nextSeq) });
  } catch (err) {
    console.error("Failed to compute next Site Calibration ID:", err);
    res.status(500).json({ message: "Failed to compute next ID" });
  }
});

// ==========================
// GET /api/sitecalibrations/:id
// Fetch a single record by scId
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const record = await db
      .collection(COLLECTION)
      .findOne({ scId: req.params.id });
    if (!record) {
      return res.status(404).json({ message: "Site Calibration not found" });
    }
    res.json(record);
  } catch (err) {
    console.error("Failed to fetch site calibration:", err);
    res.status(500).json({ message: "Failed to fetch site calibration" });
  }
});

// ==========================
// POST /api/sitecalibrations
// Create a new record — atomically reserves the next scId via $inc
// ==========================
router.post("/", async (req, res) => {
  try {
    const db = getDb();

    // Atomic increment guarantees no duplicate scId under concurrent saves
    const counterResult = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: COUNTER_KEY },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
    const seq = counterResult?.seq ?? counterResult?.value?.seq;
    const scId = formatScId(seq);

    const now = new Date();
    const doc = {
      ...req.body,
      scId, // server-generated, ignore any scId sent from client
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(COLLECTION).insertOne(doc);
    res.status(201).json({ success: true, scId, ...doc });
  } catch (err) {
    console.error("Failed to create site calibration:", err);
    res.status(500).json({ message: "Failed to create site calibration" });
  }
});

// ==========================
// PUT /api/sitecalibrations/:id
// Update an existing record by scId
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { scId, _id, ...updateFields } = req.body; // never allow scId/_id to be overwritten via body

    const result = await db
      .collection(COLLECTION)
      .findOneAndUpdate(
        { scId: req.params.id },
        { $set: { ...updateFields, updatedAt: new Date() } },
        { returnDocument: "after" },
      );

    const updated = result?.value ?? result;
    if (!updated) {
      return res.status(404).json({ message: "Site Calibration not found" });
    }

    res.json({ success: true, scId: req.params.id, ...updated });
  } catch (err) {
    console.error("Failed to update site calibration:", err);
    res.status(500).json({ message: "Failed to update site calibration" });
  }
});

module.exports = router;
