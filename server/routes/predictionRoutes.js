// routes/predictionRoutes.js  (mounted at /api/predictions)
const express = require("express");
const svc = require("../services/predictionService");

const router = express.Router();

// All jobs currently in the pipeline with predicted completion, most at-risk first
router.get("/active", async (req, res) => {
  try {
    res.json({ success: true, ...(await svc.predictActive()) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// One job. Job numbers contain slashes, so pass it as a query string:
//   GET /api/predictions/job?jobNumber=SSS/0001/26
router.get("/job", async (req, res) => {
  try {
    const { jobNumber } = req.query;
    if (!jobNumber)
      return res
        .status(400)
        .json({ success: false, message: "jobNumber is required" });
    const result = await svc.predictOne(jobNumber);
    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Job is not in the pipeline" });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Which stages take longest / have the longest queue (bottlenecks)
router.get("/stages", async (req, res) => {
  try {
    res.json({ success: true, stages: await svc.stageStats() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Model info + accuracy: baseline MAE vs machine learning MAE (working minutes)
router.get("/model", async (req, res) => {
  try {
    const { doc } = await svc.getModel();
    res.json({ success: true, ...svc.describe(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Retrain now. Body: { "includeSimulated": true | false }
router.post("/train", async (req, res) => {
  try {
    const includeSimulated = req.body?.includeSimulated !== false;
    const doc = await svc.trainAndSave({ includeSimulated });
    res.json({ success: true, ...svc.describe(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
