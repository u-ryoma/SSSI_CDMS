const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const { userInfo } = require("../services/presenceService");

const router = express.Router();

const ALLOWED_SEVERITIES = ["critical", "warning", "info"];

function toClientShape(doc) {
  return {
    id: doc._id.toString(),
    message: doc.message,
    severity: doc.severity,
    active: doc.active,
    createdAt: doc.createdAt,
    createdBy: doc.createdBy || null,
  };
}

/**
 * Confirms the requester is an admin using the server's own record of who
 * they are (set at heartbeat/login time in presenceService), rather than
 * trusting a role the client could send directly. Not bulletproof — there's
 * no signed session token in this app yet, so a determined attacker who
 * knows a valid admin username could still spoof it — but it closes the
 * easy case of a non-admin flipping a hidden button back on via devtools.
 * If you add real auth tokens (JWT, session ids) later, swap this for a
 * proper middleware check against the token instead of the username.
 */
function requireAdmin(req, res, next) {
  const { username } = req.body;
  if (!username) {
    return res
      .status(401)
      .json({ success: false, message: "Missing username" });
  }
  const info = userInfo[username];
  if (!info || info.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }
  next();
}

// GET /api/system-alerts?active=true — open to any signed-in account, no role check
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const filter = {};
    if (req.query.active === "true") filter.active = true;
    if (req.query.active === "false") filter.active = false;

    const alerts = await db
      .collection("systemAlerts")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(alerts.map(toClientShape));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching alerts" });
  }
});

// POST /api/system-alerts — admin only
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { message, severity, username } = req.body;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }
    if (!ALLOWED_SEVERITIES.includes(severity)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid severity" });
    }

    const db = getDb();
    const doc = {
      message: message.trim().slice(0, 160),
      severity,
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: username,
    };

    const result = await db.collection("systemAlerts").insertOne(doc);
    res.status(201).json(toClientShape({ ...doc, _id: result.insertedId }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating alert" });
  }
});

// PATCH /api/system-alerts/:id — admin only
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid alert id" });
    }

    const update = {};
    if (typeof req.body.active === "boolean") update.active = req.body.active;

    const db = getDb();
    const result = await db
      .collection("systemAlerts")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" },
      );

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });
    }

    res.json(toClientShape(result));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating alert" });
  }
});

module.exports = router;
