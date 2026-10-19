// const express = require("express");
// const { getDb } = require("../config/db");

// const router = express.Router();

// router.post("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const { username, name, role, action, timestamp } = req.body;
//     await db.collection("logs").insertOne({
//       username,
//       name,
//       role,
//       action,
//       timestamp: timestamp || new Date().toISOString(),
//     });
//     res.status(201).json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const logs = await db
//       .collection("logs")
//       .find()
//       .sort({ timestamp: -1 })
//       .limit(100)
//       .toArray();
//     res.json(logs);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching logs");
//   }
// });

// module.exports = router;
const express = require("express");
const { getDb } = require("../config/db");

const router = express.Router();

// Used by the frontend for login/logout entries.
// Optional module/type/details are accepted so other pages can post events too.
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { username, name, role, action, timestamp, module, type, details } =
      req.body;

    // work out the type from the action text if the caller didn't send one
    const a = (action || "").toLowerCase();
    let resolvedType = type;
    if (!resolvedType) {
      if (
        a.includes("logout") ||
        a.includes("logged out") ||
        a.includes("log out")
      ) {
        resolvedType = "logout";
      } else if (
        a.includes("login") ||
        a.includes("logged in") ||
        a.includes("log in")
      ) {
        resolvedType = "login";
      } else {
        resolvedType = "other";
      }
    }

    await db.collection("logs").insertOne({
      username,
      name,
      role,
      action,
      module: module || "Authentication",
      type: resolvedType,
      details: details || "",
      timestamp: timestamp || new Date().toISOString(),
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Newest first. Sorted by _id (insertion order) rather than timestamp so
// entries stay in the right order even if older ones store timestamps in a
// different format.
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit) || 500, 2000);
    const logs = await db
      .collection("logs")
      .find()
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching logs");
  }
});

module.exports = router;
