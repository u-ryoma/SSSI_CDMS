const express = require("express");
const { getDb } = require("../config/db");
const { pad4 } = require("../utils/counters");

const router = express.Router();

// GET next Standard ID preview (mirrors /api/jobreceipts/next-id)
router.get("/next-id", async (req, res) => {
  try {
    const db = getDb();
    const counter = await db.collection("counters").findOne({ _id: "standardID" });
    const nextSeq = (counter?.seq || 0) + 1;
    const nextStandardId = `STD-${pad4(nextSeq)}`;
    res.json({ nextStandardId });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const standards = await db.collection("standards").find().sort({ createdAt: -1 }).toArray();
    res.json(standards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET all standards -> "Standard For Calibration" page
router.get("/for-calibration", async (req, res) => {
  try {
    const db = getDb();
    const standards = await db.collection("standards").find().sort({ createdAt: -1 }).toArray();
    res.json(standards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET all standards -> "Standard For Certification" page
router.get("/for-certification", async (req, res) => {
  try {
    const db = getDb();
    const standards = await db.collection("standards").find().sort({ createdAt: -1 }).toArray();
    res.json(standards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET all standards -> "Standard For Update" page
router.get("/for-update", async (req, res) => {
  try {
    const db = getDb();
    const standards = await db.collection("standards").find().sort({ createdAt: -1 }).toArray();
    res.json(standards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET full history for a standard — powers both "Show Asset History" and
// "Modification History" buttons in AddAssetModal.
// NOTE: registered before the generic "/:standardId" route below so
// Express doesn't try to match "history" as part of a standardId.
router.get("/:standardId/history", async (req, res) => {
  try {
    const db = getDb();
    const history = await db
      .collection("standardhistory")
      .find({ standardId: decodeURIComponent(req.params.standardId) })
      .sort({ modifiedAt: -1 })
      .toArray();
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:standardId", async (req, res) => {
  try {
    const db = getDb();
    const standard = await db
      .collection("standards")
      .findOne({ standardId: decodeURIComponent(req.params.standardId) });

    if (!standard) {
      return res.status(404).json({ success: false, message: "Standard not found" });
    }
    res.json(standard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { standardId, _id, ...rest } = req.body;

    if (!standardId || !standardId.trim()) {
      return res.status(400).json({ success: false, message: "Standard ID is required." });
    }

    const existing = await db.collection("standards").findOne({ standardId: standardId.trim() });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Standard ID "${standardId}" already exists.`,
      });
    }

    const newStandard = {
      ...rest,
      standardId: standardId.trim(),
      calibStatus: rest.calibStatus || "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("standards").insertOne(newStandard);

    await db.collection("standardhistory").insertOne({
      standardId: newStandard.standardId,
      action: "Created",
      changes: newStandard,
      modifiedBy: req.headers["x-user-name"] || "",
      modifiedAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, standardId: newStandard.standardId, standard: newStandard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:standardId", async (req, res) => {
  try {
    const db = getDb();
    const standardId = decodeURIComponent(req.params.standardId);
    const existing = await db.collection("standards").findOne({ standardId });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Standard not found" });
    }

    const { standardId: _ignore, _id, ...updateData } = req.body;
    updateData.updatedAt = new Date().toISOString();

    const changedFields = {};
    for (const key of Object.keys(updateData)) {
      if (JSON.stringify(existing[key]) !== JSON.stringify(updateData[key])) {
        changedFields[key] = { from: existing[key] ?? null, to: updateData[key] };
      }
    }

    await db.collection("standards").updateOne({ standardId }, { $set: updateData });

    if (Object.keys(changedFields).length > 0) {
      await db.collection("standardhistory").insertOne({
        standardId,
        action: "Updated",
        changes: changedFields,
        modifiedBy: req.headers["x-user-name"] || "",
        modifiedAt: new Date().toISOString(),
      });
    }

    res.json({ success: true, standardId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT quick-action: flag a standard as due for calibration
router.put("/:standardId/for-calibration", async (req, res) => {
  try {
    const db = getDb();
    const standardId = decodeURIComponent(req.params.standardId);
    const result = await db.collection("standards").updateOne(
      { standardId },
      { $set: { calibStatus: "For Calibration", updatedAt: new Date().toISOString() } },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Standard not found" });
    }

    await db.collection("standardhistory").insertOne({
      standardId,
      action: "Flagged For Calibration",
      changes: { calibStatus: { to: "For Calibration" } },
      modifiedBy: req.headers["x-user-name"] || "",
      modifiedAt: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:standardId", async (req, res) => {
  try {
    const db = getDb();
    await db.collection("standards").deleteOne({ standardId: decodeURIComponent(req.params.standardId) });
    res.json({ success: true, message: "Standard deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

module.exports = router;
