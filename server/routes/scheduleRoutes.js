// const express = require("express");
// const { ObjectId } = require("mongodb");
// const { getDb } = require("../config/db");

// const router = express.Router();

// // Helper: attach a nested `technician: { _id, name }` object to each
// // assignment so the frontend doesn't have to know about the raw
// // technicianId/technicianName fields stored on the document.
// function withTechnician(assignment) {
//   return {
//     ...assignment,
//     technician: {
//       _id: assignment.technicianId,
//       name: assignment.technicianName,
//     },
//   };
// }

// // GET assignments within a date range (both inclusive, "YYYY-MM-DD" strings)
// router.get("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const { start, end } = req.query;
//     if (!start || !end) {
//       return res.status(400).json({ success: false, message: "start and end are required" });
//     }

//     const assignments = await db
//       .collection("scheduleassignments")
//       .find({ date: { $gte: start, $lte: end } })
//       .sort({ date: 1 })
//       .toArray();

//     res.json(assignments.map(withTechnician));
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // POST create an assignment. technicianName is looked up and stored
// // on the document itself (denormalized, same pattern as checkedBy/
// // preparedBy on quotations) so the frontend doesn't need a populate/join.
// router.post("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const { date, technicianId, jobNumber, notes, location, createdBy } = req.body;

//     if (!date || !technicianId) {
//       return res.status(400).json({ success: false, message: "date and technicianId are required" });
//     }

//     // location is where the technician needs to report/calibrate on
//     // site — required so every assignment on the calendar has a place
//     // attached to it, not just a name.
//     if (!location || !location.trim()) {
//       return res.status(400).json({ success: false, message: "location is required" });
//     }

//     if (!ObjectId.isValid(technicianId)) {
//       return res.status(400).json({ success: false, message: "Invalid technicianId" });
//     }

//     const technician = await db.collection("users").findOne({ _id: new ObjectId(technicianId) });

//     if (!technician) {
//       return res.status(404).json({ success: false, message: "Technician not found" });
//     }

//     // Prevent double-assigning the same technician on the same day
//     const existing = await db.collection("scheduleassignments").findOne({ date, technicianId });
//     if (existing) {
//       return res.status(409).json({ success: false, message: "Technician is already assigned on this date" });
//     }

//     const newAssignment = {
//       date, // "YYYY-MM-DD"
//       technicianId,
//       technicianName: technician.name,
//       location: location.trim(),
//       jobNumber: jobNumber || null,
//       notes: notes || "",
//       createdBy: createdBy || "",
//       createdAt: new Date().toISOString(),
//     };

//     const result = await db.collection("scheduleassignments").insertOne(newAssignment);

//     res.status(201).json(withTechnician({ ...newAssignment, _id: result.insertedId }));
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// router.delete("/:id", async (req, res) => {
//   try {
//     const db = getDb();
//     if (!ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ success: false, message: "Invalid assignment id" });
//     }

//     const result = await db.collection("scheduleassignments").deleteOne({ _id: new ObjectId(req.params.id) });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ success: false, message: "Assignment not found" });
//     }
//     res.json({ success: true, message: "Assignment removed" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const {
  buildSuggestion,
  confirmAssignments,
} = require("../services/scheduleService");

const router = express.Router();

// Helper: attach a nested `technician: { _id, name }` object to each
// assignment so the frontend doesn't have to know about the raw
// technicianId/technicianName fields stored on the document.
function withTechnician(assignment) {
  return {
    ...assignment,
    technician: {
      _id: assignment.technicianId,
      name: assignment.technicianName,
    },
  };
}

// GET assignments within a date range (both inclusive, "YYYY-MM-DD" strings)
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ success: false, message: "start and end are required" });
    }

    const assignments = await db
      .collection("scheduleassignments")
      .find({ date: { $gte: start, $lte: end } })
      .sort({ date: 1 })
      .toArray();

    res.json(assignments.map(withTechnician));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST auto-schedule PREVIEW: proposes technician/date assignments for site
// calibration jobs that are not scheduled yet. Saves nothing.
// (Registered before the "/" and "/:id" routes so it is matched first.)
router.post("/suggest", async (req, res) => {
  try {
    const horizonDays = Number(req.body?.horizonDays) || 30;
    res.json({ success: true, ...(await buildSuggestion({ horizonDays })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST auto-schedule CONFIRM: saves the assignments staff approved.
// Body: { assignments: [{ scIds, date, technicianId, location }], createdBy }
router.post("/confirm", async (req, res) => {
  try {
    const { assignments, createdBy } = req.body || {};
    const { created, skipped } = await confirmAssignments(
      assignments,
      createdBy || "",
    );
    res.json({ success: true, createdCount: created.length, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create an assignment. technicianName is looked up and stored
// on the document itself (denormalized, same pattern as checkedBy/
// preparedBy on quotations) so the frontend doesn't need a populate/join.
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { date, technicianId, jobNumber, notes, location, createdBy } =
      req.body;

    if (!date || !technicianId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "date and technicianId are required",
        });
    }

    // location is where the technician needs to report/calibrate on
    // site — required so every assignment on the calendar has a place
    // attached to it, not just a name.
    if (!location || !location.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "location is required" });
    }

    if (!ObjectId.isValid(technicianId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid technicianId" });
    }

    const technician = await db
      .collection("users")
      .findOne({ _id: new ObjectId(technicianId) });

    if (!technician) {
      return res
        .status(404)
        .json({ success: false, message: "Technician not found" });
    }

    // Prevent double-assigning the same technician on the same day
    const existing = await db
      .collection("scheduleassignments")
      .findOne({ date, technicianId });
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Technician is already assigned on this date",
        });
    }

    const newAssignment = {
      date, // "YYYY-MM-DD"
      technicianId,
      technicianName: technician.name,
      location: location.trim(),
      jobNumber: jobNumber || null,
      notes: notes || "",
      createdBy: createdBy || "",
      createdAt: new Date().toISOString(),
    };

    const result = await db
      .collection("scheduleassignments")
      .insertOne(newAssignment);

    res
      .status(201)
      .json(withTechnician({ ...newAssignment, _id: result.insertedId }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    if (!ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid assignment id" });
    }

    const result = await db
      .collection("scheduleassignments")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }
    res.json({ success: true, message: "Assignment removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
