const express = require("express");
const { getDb } = require("../config/db");
const { syncReadings } = require("../services/driftExtract");
const {
  trainModel,
  serialize,
  deserialize,
} = require("../services/driftModel");
const { buildAll } = require("../services/driftEngine");

const router = express.Router();
const MODEL_MAX_AGE_MS = 7 * 24 * 3600 * 1000; // auto-retrain weekly
let cache = null; // { forest, meta }

async function readingsByKey(db) {
  await syncReadings(db); // pull any newly finished jobs
  const all = await db.collection("calibrationreadings").find().toArray();
  const groups = {};
  all.forEach((r) => (groups[r.instrumentKey] ||= []).push(r));
  return groups;
}

async function trainAndSave(db, groups) {
  const result = trainModel(groups);
  if (!result.ok) {
    cache = null;
    await db.collection("driftmodels").deleteOne({ _id: "current" });
    return result;
  }
  await db
    .collection("driftmodels")
    .replaceOne(
      { _id: "current" },
      { _id: "current", ...serialize(result) },
      { upsert: true },
    );
  cache = result;
  return result;
}

async function getModel(db, groups) {
  if (!cache) {
    const doc = await db.collection("driftmodels").findOne({ _id: "current" });
    if (doc) cache = deserialize(doc);
  }
  const stale =
    cache &&
    Date.now() - new Date(cache.meta.trainedAt).getTime() > MODEL_MAX_AGE_MS;
  if (!cache || stale) {
    const r = await trainAndSave(db, groups); // lazy first train / weekly refresh
    return r.ok ? r : cache;
  }
  return cache;
}

// GET /api/drift/instruments -> every instrument with status, regression + AI forecast, anomaly flag
router.get("/instruments", async (req, res) => {
  try {
    const db = getDb();
    const groups = await readingsByKey(db);
    const model = await getModel(db, groups);
    const items = buildAll(groups, model);
    const counts = { Stable: 0, Watch: 0, Drifting: 0, "Insufficient data": 0 };
    items.forEach((i) => counts[i.status]++);
    res.json({
      model: model ? model.meta : null,
      counts,
      anomalies: items.filter((i) => i.anomaly.flag).length,
      items,
    });
  } catch (e) {
    console.error("drift/instruments", e);
    res.status(500).json({ error: "Failed to compute drift analytics" });
  }
});

// GET /api/drift/model
router.get("/model", async (req, res) => {
  const doc = await getDb()
    .collection("driftmodels")
    .findOne({ _id: "current" }, { projection: { meta: 1 } });
  res.json(doc ? doc.meta : null);
});

// POST /api/drift/train -> force a retrain now
router.post("/train", async (req, res) => {
  try {
    const db = getDb();
    const r = await trainAndSave(db, await readingsByKey(db));
    res.json(
      r.ok ? { ok: true, meta: r.meta } : { ok: false, reason: r.reason },
    );
  } catch (e) {
    console.error("drift/train", e);
    res.status(500).json({ error: "Training failed" });
  }
});

module.exports = router;
