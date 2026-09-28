// const express = require("express");
// const { ObjectId } = require("mongodb");
// const { getDb } = require("../config/db");
// const { getNextSequence, pad4, currentYearSuffix } = require("../utils/counters");

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const jobs = await db.collection("jobnumbers").find().sort({ createdAt: -1 }).toArray();
//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // POST reserve a job number (increments counter, does NOT insert a job doc)
// router.post("/reserve", async (req, res) => {
//   try {
//     const db = getDb();
//     const type = req.body.type === "electrical" ? "electrical" : "mechanical";
//     const prefix = type === "electrical" ? "SSE" : "SSS";
//     const counterId = type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";

//     const seq = await getNextSequence(db, counterId);
//     const jobNumber = `${prefix}/${pad4(seq)}/${currentYearSuffix()}`;

//     res.json({ success: true, jobNumber });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // POST save job number (uses the already-reserved number if provided)
// router.post("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const { jobNumber, ...rest } = req.body;
//     let finalJobNumber = jobNumber;

//     // Fallback only — normally jobNumber is already reserved by this point
//     if (!finalJobNumber) {
//       const type = req.body.type === "electrical" ? "electrical" : "mechanical";
//       const prefix = type === "electrical" ? "SSE" : "SSS";
//       const counterId = type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";
//       const seq = await getNextSequence(db, counterId);
//       finalJobNumber = `${prefix}/${pad4(seq)}/${currentYearSuffix()}`;
//     }

//     const newJob = {
//       ...rest,
//       jobNumber: finalJobNumber,
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("jobnumbers").insertOne(newJob);
//     res.status(201).json({ success: true, jobNumber: finalJobNumber });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // PUT - mark job number as tagged (moves it to Incoming Calib or Incoming Concern)
// //
// // concernSource distinguishes WHY concernTagged got set to true, since
// // that happens from two different places in the frontend:
// //   - "instrumentTag"  -> InstrumentTag.jsx's "Concern / PIC Taken"
// //                         checkbox. The job never went through Incoming
// //                         Calibration Details, so it has no OIC/SIG yet.
// //   - "calibration"    -> IncomingCalibDetailsModal.jsx's "Job Number
// //                         With Concern" button. The job already has a
// //                         real OIC (and possibly SIG) on it.
// // Only written when actually provided (not just `undefined`), so this
// // route's other callers that don't send it can't accidentally blank out
// // an existing value.
// router.put("/tag", async (req, res) => {
//   try {
//     const db = getDb();
//     const { jobNumber, tagged, concernTagged, taggedAt, concernSource, oicBy, sig } = req.body;

//     if (!jobNumber) {
//       return res.status(400).json({ success: false, message: "jobNumber is required" });
//     }

//     const setFields = {
//       tagged: tagged ?? true,
//       concernTagged: concernTagged ?? false,
//       taggedAt: taggedAt || new Date().toISOString(),
//     };
//     if (concernSource !== undefined) {
//       setFields.concernSource = concernSource;
//     }
//     // "Job Number With Concern" in IncomingCalibDetailsModal.jsx flags a
//     // job as a concern from a form that already has OIC/SIG filled in —
//     // without this, those values were typed on screen but never
//     // actually written to the job document, so the Incoming Concern
//     // table showed them blank. Only set when provided, so other callers
//     // of this route (e.g. InstrumentTag.jsx, which has no OIC/SIG yet)
//     // can't accidentally blank out real values.
//     if (oicBy !== undefined) {
//       setFields.oicBy = oicBy;
//     }
//     if (sig !== undefined) {
//       setFields.sig = sig;
//     }

//     const result = await db.collection("jobnumbers").updateOne({ jobNumber }, { $set: setFields });

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ success: false, message: "Job number not found" });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // UPDATE job number details from incoming calibration
// router.put("/update-details", async (req, res) => {
//   try {
//     const db = getDb();
//     const { jobNumber, ...updateData } = req.body;
//     console.log("updateData.photoUrl:", updateData.photoUrl); // temp check
//     const result = await db.collection("jobnumbers").updateOne({ jobNumber }, { $set: updateData });
//     if (result.matchedCount === 0) {
//       return res.status(404).json({ success: false, message: "Job number not found" });
//     }
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// });

// // PUT update an existing job number by its Mongo _id — used by
// // JobReceipt.jsx's handleSave for jobs that already exist in the DB
// // (including flipping the onSite flag on an existing job).
// // Registered AFTER /reserve, /tag, and /update-details above, since those
// // are static paths that must be matched before this :id catch-all.
// router.put("/:id", async (req, res) => {
//   try {
//     const db = getDb();
//     const { _id, ...updateData } = req.body;

//     const result = await db
//       .collection("jobnumbers")
//       .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ success: false, message: "Job number not found" });
//     }
//     res.json({ success: true, jobNumber: updateData.jobNumber });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;
// const express = require("express");
// const { ObjectId } = require("mongodb");
// const { getDb } = require("../config/db");
// const {
//   getNextSequence,
//   pad4,
//   currentYearSuffix,
// } = require("../utils/counters");
// // Stage history logging (creates rows in the "stageevents" collection,
// // used later for AI-based turnaround-time prediction)
// const {
//   moveStage,
//   logStageMoves,
//   buildFeatures,
// } = require("../services/stageTracker");

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const jobs = await db
//       .collection("jobnumbers")
//       .find()
//       .sort({ createdAt: -1 })
//       .toArray();
//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // POST reserve a job number (increments counter, does NOT insert a job doc)
// router.post("/reserve", async (req, res) => {
//   try {
//     const db = getDb();
//     const type = req.body.type === "electrical" ? "electrical" : "mechanical";
//     const prefix = type === "electrical" ? "SSE" : "SSS";
//     const counterId =
//       type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";

//     const seq = await getNextSequence(db, counterId);
//     const jobNumber = `${prefix}/${pad4(seq)}/${currentYearSuffix()}`;

//     res.json({ success: true, jobNumber });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // POST save job number (uses the already-reserved number if provided)
// router.post("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const { jobNumber, ...rest } = req.body;
//     let finalJobNumber = jobNumber;

//     // Fallback only — normally jobNumber is already reserved by this point
//     if (!finalJobNumber) {
//       const type = req.body.type === "electrical" ? "electrical" : "mechanical";
//       const prefix = type === "electrical" ? "SSE" : "SSS";
//       const counterId =
//         type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";
//       const seq = await getNextSequence(db, counterId);
//       finalJobNumber = `${prefix}/${pad4(seq)}/${currentYearSuffix()}`;
//     }

//     const newJob = {
//       ...rest,
//       jobNumber: finalJobNumber,
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("jobnumbers").insertOne(newJob);

//     // Stage log: job has just been created and is waiting at Instrument Tagging.
//     // Not awaited and errors are swallowed so logging can never break the save.
//     moveStage({
//       jobNumber: finalJobNumber,
//       toStage: "InstrumentTagging",
//       features: buildFeatures(newJob),
//     }).catch((e) => console.error("Stage logging failed:", e.message));

//     res.status(201).json({ success: true, jobNumber: finalJobNumber });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // PUT - mark job number as tagged (moves it to Incoming Calib or Incoming Concern)
// //
// // concernSource distinguishes WHY concernTagged got set to true, since
// // that happens from two different places in the frontend:
// //   - "instrumentTag"  -> InstrumentTag.jsx's "Concern / PIC Taken"
// //                         checkbox. The job never went through Incoming
// //                         Calibration Details, so it has no OIC/SIG yet.
// //   - "calibration"    -> IncomingCalibDetailsModal.jsx's "Job Number
// //                         With Concern" button. The job already has a
// //                         real OIC (and possibly SIG) on it.
// // Only written when actually provided (not just `undefined`), so this
// // route's other callers that don't send it can't accidentally blank out
// // an existing value.
// router.put("/tag", async (req, res) => {
//   try {
//     const db = getDb();
//     const {
//       jobNumber,
//       tagged,
//       concernTagged,
//       taggedAt,
//       concernSource,
//       oicBy,
//       sig,
//     } = req.body;

//     if (!jobNumber) {
//       return res
//         .status(400)
//         .json({ success: false, message: "jobNumber is required" });
//     }

//     const setFields = {
//       tagged: tagged ?? true,
//       concernTagged: concernTagged ?? false,
//       taggedAt: taggedAt || new Date().toISOString(),
//     };
//     if (concernSource !== undefined) {
//       setFields.concernSource = concernSource;
//     }
//     // "Job Number With Concern" in IncomingCalibDetailsModal.jsx flags a
//     // job as a concern from a form that already has OIC/SIG filled in —
//     // without this, those values were typed on screen but never
//     // actually written to the job document, so the Incoming Concern
//     // table showed them blank. Only set when provided, so other callers
//     // of this route (e.g. InstrumentTag.jsx, which has no OIC/SIG yet)
//     // can't accidentally blank out real values.
//     if (oicBy !== undefined) {
//       setFields.oicBy = oicBy;
//     }
//     if (sig !== undefined) {
//       setFields.sig = sig;
//     }

//     // Snapshot BEFORE the update so we can tell which flags actually changed
//     const before = await db.collection("jobnumbers").findOne({ jobNumber });

//     const result = await db
//       .collection("jobnumbers")
//       .updateOne({ jobNumber }, { $set: setFields });

//     if (result.matchedCount === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Job number not found" });
//     }

//     // Stage log (not awaited; never blocks or breaks the response)
//     logStageMoves(before, setFields);

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // UPDATE job number details from incoming calibration
// router.put("/update-details", async (req, res) => {
//   try {
//     const db = getDb();
//     const { jobNumber, ...updateData } = req.body;
//     console.log("updateData.photoUrl:", updateData.photoUrl); // temp check

//     // Snapshot BEFORE the update so we can tell which flags actually changed
//     const before = await db.collection("jobnumbers").findOne({ jobNumber });

//     const result = await db
//       .collection("jobnumbers")
//       .updateOne({ jobNumber }, { $set: updateData });
//     if (result.matchedCount === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Job number not found" });
//     }

//     // Stage log (not awaited; never blocks or breaks the response)
//     logStageMoves(before, updateData);

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// });

// // PUT update an existing job number by its Mongo _id — used by
// // JobReceipt.jsx's handleSave for jobs that already exist in the DB
// // (including flipping the onSite flag on an existing job).
// // Registered AFTER /reserve, /tag, and /update-details above, since those
// // are static paths that must be matched before this :id catch-all.
// router.put("/:id", async (req, res) => {
//   try {
//     const db = getDb();
//     const { _id, ...updateData } = req.body;

//     const result = await db
//       .collection("jobnumbers")
//       .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

//     if (result.matchedCount === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Job number not found" });
//     }
//     res.json({ success: true, jobNumber: updateData.jobNumber });
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
  getNextSequence,
  pad4,
  currentYearSuffix,
} = require("../utils/counters");
// Stage history logging (creates rows in the "stageevents" collection,
// used later for AI-based turnaround-time prediction)
const {
  moveStage,
  logStageMoves,
  buildFeatures,
  stageFromFlags,
} = require("../services/stageTracker");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const jobs = await db
      .collection("jobnumbers")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST reserve a job number (increments counter, does NOT insert a job doc)
router.post("/reserve", async (req, res) => {
  try {
    const db = getDb();
    const type = req.body.type === "electrical" ? "electrical" : "mechanical";
    const prefix = type === "electrical" ? "SSE" : "SSS";
    const counterId =
      type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";

    const seq = await getNextSequence(db, counterId);
    const jobNumber = `${prefix}/${pad4(seq)}/${currentYearSuffix()}`;

    res.json({ success: true, jobNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST save job number (uses the already-reserved number if provided)
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { jobNumber, ...rest } = req.body;
    let finalJobNumber = jobNumber;

    // Fallback only — normally jobNumber is already reserved by this point
    if (!finalJobNumber) {
      const type = req.body.type === "electrical" ? "electrical" : "mechanical";
      const prefix = type === "electrical" ? "SSE" : "SSS";
      const counterId =
        type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";
      const seq = await getNextSequence(db, counterId);
      finalJobNumber = `${prefix}/${pad4(seq)}/${currentYearSuffix()}`;
    }

    const newJob = {
      ...rest,
      jobNumber: finalJobNumber,
      createdAt: new Date().toISOString(),
    };

    await db.collection("jobnumbers").insertOne(newJob);

    // Stage log: the job starts at whatever stage its flags say. Normal jobs
    // start at Instrument Tagging; jobs created from Site Calibration arrive
    // already flagged for typing, so they start at For Typing.
    // Errors are swallowed so logging can never break the save.
    try {
      await moveStage({
        jobNumber: finalJobNumber,
        toStage: stageFromFlags(newJob),
        features: buildFeatures(newJob),
      });
    } catch (e) {
      console.error("Stage logging failed:", e.message);
    }

    res.status(201).json({ success: true, jobNumber: finalJobNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT - mark job number as tagged (moves it to Incoming Calib or Incoming Concern)
//
// concernSource distinguishes WHY concernTagged got set to true, since
// that happens from two different places in the frontend:
//   - "instrumentTag"  -> InstrumentTag.jsx's "Concern / PIC Taken"
//                         checkbox. The job never went through Incoming
//                         Calibration Details, so it has no OIC/SIG yet.
//   - "calibration"    -> IncomingCalibDetailsModal.jsx's "Job Number
//                         With Concern" button. The job already has a
//                         real OIC (and possibly SIG) on it.
// Only written when actually provided (not just `undefined`), so this
// route's other callers that don't send it can't accidentally blank out
// an existing value.
router.put("/tag", async (req, res) => {
  try {
    const db = getDb();
    const {
      jobNumber,
      tagged,
      concernTagged,
      taggedAt,
      concernSource,
      oicBy,
      sig,
    } = req.body;

    if (!jobNumber) {
      return res
        .status(400)
        .json({ success: false, message: "jobNumber is required" });
    }

    const setFields = {
      tagged: tagged ?? true,
      concernTagged: concernTagged ?? false,
      taggedAt: taggedAt || new Date().toISOString(),
    };
    if (concernSource !== undefined) {
      setFields.concernSource = concernSource;
    }
    // "Job Number With Concern" in IncomingCalibDetailsModal.jsx flags a
    // job as a concern from a form that already has OIC/SIG filled in —
    // without this, those values were typed on screen but never
    // actually written to the job document, so the Incoming Concern
    // table showed them blank. Only set when provided, so other callers
    // of this route (e.g. InstrumentTag.jsx, which has no OIC/SIG yet)
    // can't accidentally blank out real values.
    if (oicBy !== undefined) {
      setFields.oicBy = oicBy;
    }
    if (sig !== undefined) {
      setFields.sig = sig;
    }

    // Snapshot BEFORE the update so we can tell which flags actually changed
    const before = await db.collection("jobnumbers").findOne({ jobNumber });

    const result = await db
      .collection("jobnumbers")
      .updateOne({ jobNumber }, { $set: setFields });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Job number not found" });
    }

    // Stage log (not awaited; never blocks or breaks the response)
    logStageMoves(before, setFields);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE job number details from incoming calibration
router.put("/update-details", async (req, res) => {
  try {
    const db = getDb();
    const { jobNumber, ...updateData } = req.body;
    console.log("updateData.photoUrl:", updateData.photoUrl); // temp check

    // Snapshot BEFORE the update so we can tell which flags actually changed
    const before = await db.collection("jobnumbers").findOne({ jobNumber });

    const result = await db
      .collection("jobnumbers")
      .updateOne({ jobNumber }, { $set: updateData });
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Job number not found" });
    }

    // Stage log (not awaited; never blocks or breaks the response)
    logStageMoves(before, updateData);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// PUT update an existing job number by its Mongo _id — used by
// JobReceipt.jsx's handleSave for jobs that already exist in the DB
// (including flipping the onSite flag on an existing job).
// Registered AFTER /reserve, /tag, and /update-details above, since those
// are static paths that must be matched before this :id catch-all.
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { _id, ...updateData } = req.body;

    const result = await db
      .collection("jobnumbers")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Job number not found" });
    }
    res.json({ success: true, jobNumber: updateData.jobNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
