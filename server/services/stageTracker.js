// // services/stageTracker.js
// //
// // Records every stage a job passes through in the "stageevents" collection:
// //   { jobNumber, stage, enteredAt, exitedAt, durationMin, movedBy,
// //     queueLength, calibrationProcedure, instrumentType, priority,
// //     onSite, isSiteJob, hadConcern }
// // This history is the training data for the turnaround-time prediction.
// //
// // Called from:
// //   - routes/jobNumberRoutes.js       (POST /, PUT /tag, PUT /update-details)
// //   - routes/deliveryReceiptRoutes.js (POST /, closes the trail)

// const { getDb } = require("../config/db");

// // Flag that becomes true when a job ARRIVES at that stage.
// // (IncomingCalibration / IncomingConcern are handled separately in
// // logStageMoves because they come from the /tag route's tagged and
// // concernTagged fields.)
// const STAGE_FLAGS = {
//   ongoingTagged: "OngoingCalibration",
//   forTypingTagged: "ForTyping",
//   forCheckingOICTagged: "CheckingOIC",
//   forCheckingSigTagged: "CheckingSIG",
//   forPrintFinalTagged: "PrintFinalCertificate",
//   forDeliveryTagged: "Delivery",
// };

// // Who finished the PREVIOUS stage and moved the job on, read from the
// // fields your pages already save. The first moves (into Incoming
// // Calibration and Ongoing Calibration) have no such field yet, so
// // movedBy stays null for them.
// const MOVED_BY_FIELD = {
//   forCheckingOICTagged: "typedBy",
//   forCheckingSigTagged: "oicCheckedBy",
//   forPrintFinalTagged: "sigCheckedBy",
//   forDeliveryTagged: "finalCertPrintedBy",
// };

// // Job details captured when a job enters a stage. These become the
// // features of the prediction model.
// function buildFeatures(job) {
//   return {
//     calibrationProcedure: job.calibrationProcedure || null,
//     instrumentType: job.type || null,
//     priority: job.priority || "Normal",
//     onSite: !!job.onSite,
//     isSiteJob: !!job.scId,
//     hadConcern: !!job.concern && job.concern !== "NA",
//   };
// }

// // The index is created lazily the first time the tracker runs, because
// // server.js calls connectDB() without awaiting it.
// let indexReady = false;
// async function ensureIndex(events) {
//   if (indexReady) return;
//   await events.createIndex({ jobNumber: 1, exitedAt: 1 });
//   await events.createIndex({ stage: 1, exitedAt: 1 });
//   indexReady = true;
// }

// // Closes the job's currently open stage, then opens toStage.
// // toStage = null only closes (used when the job is released).
// async function moveStage({
//   jobNumber,
//   toStage,
//   movedBy = null,
//   features = {},
// }) {
//   const events = getDb().collection("stageevents");
//   await ensureIndex(events);
//   const now = new Date();

//   const open = await events.findOne({ jobNumber, exitedAt: null });

//   // Already in that stage (e.g. the same save sent twice): do nothing.
//   if (open && toStage && open.stage === toStage) return;

//   if (open) {
//     await events.updateOne(
//       { _id: open._id },
//       {
//         $set: {
//           exitedAt: now,
//           durationMin: Math.round((now - open.enteredAt) / 60000),
//         },
//       },
//     );
//   }

//   if (toStage) {
//     const queueLength = await events.countDocuments({
//       stage: toStage,
//       exitedAt: null,
//     });
//     await events.insertOne({
//       jobNumber,
//       stage: toStage,
//       enteredAt: now,
//       exitedAt: null,
//       durationMin: null,
//       movedBy,
//       queueLength,
//       ...features,
//     });
//   }
// }

// // Compares the job as it was BEFORE an update with the fields being
// // saved, and logs a stage move for each flag that just turned on.
// // Never throws: a logging problem must not break a real save.
// async function logStageMoves(before, data) {
//   try {
//     if (!before) return;
//     const merged = { ...before, ...data };
//     const moves = [];

//     if (data.concernTagged === true) {
//       if (!before.concernTagged) moves.push(["IncomingConcern", null]);
//     } else if (data.tagged === true && !before.tagged) {
//       moves.push(["IncomingCalibration", null]);
//     }

//     for (const [flag, stage] of Object.entries(STAGE_FLAGS)) {
//       if (data[flag] === true && !before[flag]) {
//         const movedBy = data[MOVED_BY_FIELD[flag]] || null;
//         moves.push([stage, movedBy]);
//       }
//     }

//     for (const [stage, movedBy] of moves) {
//       await moveStage({
//         jobNumber: before.jobNumber,
//         toStage: stage,
//         movedBy,
//         features: buildFeatures(merged),
//       });
//     }
//   } catch (err) {
//     console.error("Stage logging failed:", err.message);
//   }
// }

// module.exports = { moveStage, logStageMoves, buildFeatures };
// services/stageTracker.js
//
// Records every stage a job passes through in the "stageevents" collection:
//   { jobNumber, stage, enteredAt, exitedAt, durationMin, movedBy,
//     queueLength, calibrationProcedure, instrumentType, priority,
//     onSite, isSiteJob, hadConcern }
// This history is the training data for the turnaround-time prediction.
//
// Called from:
//   - routes/jobNumberRoutes.js       (POST /, PUT /tag, PUT /update-details)
//   - routes/deliveryReceiptRoutes.js (POST /, closes the trail)

const { getDb } = require("../config/db");

// Flag that becomes true when a job ARRIVES at that stage.
// (IncomingCalibration / IncomingConcern are handled separately in
// logStageMoves because they come from the /tag route's tagged and
// concernTagged fields.)
const STAGE_FLAGS = {
  ongoingTagged: "OngoingCalibration",
  forTypingTagged: "ForTyping",
  forCheckingOICTagged: "CheckingOIC",
  forCheckingSigTagged: "CheckingSIG",
  forPrintFinalTagged: "PrintFinalCertificate",
  forDeliveryTagged: "Delivery",
};

// Who finished the PREVIOUS stage and moved the job on, read from the
// fields your pages already save. The first moves (into Incoming
// Calibration and Ongoing Calibration) have no such field yet, so
// movedBy stays null for them.
const MOVED_BY_FIELD = {
  forCheckingOICTagged: "typedBy",
  forCheckingSigTagged: "oicCheckedBy",
  forPrintFinalTagged: "sigCheckedBy",
  forDeliveryTagged: "finalCertPrintedBy",
};

// The furthest stage a job document says it has reached. Used when a job
// is CREATED already past the first stages, e.g. jobs that come from Site
// Calibration, which go straight to For Typing instead of Instrument
// Tagging -> Incoming -> Ongoing Calibration.
const FLAG_PRIORITY = [
  "forDeliveryTagged",
  "forPrintFinalTagged",
  "forCheckingSigTagged",
  "forCheckingOICTagged",
  "forTypingTagged",
  "ongoingTagged",
];
function stageFromFlags(job) {
  for (const flag of FLAG_PRIORITY) {
    if (job[flag] === true) return STAGE_FLAGS[flag];
  }
  if (job.concernTagged === true) return "IncomingConcern";
  if (job.tagged === true) return "IncomingCalibration";
  return "InstrumentTagging";
}

// Job details captured when a job enters a stage. These become the
// features of the prediction model.
function buildFeatures(job) {
  return {
    calibrationProcedure: job.calibrationProcedure || null,
    instrumentType: job.type || null,
    priority: job.priority || "Normal",
    onSite: !!job.onSite,
    isSiteJob: !!job.scId,
    hadConcern: !!job.concern && job.concern !== "NA",
  };
}

// The index is created lazily the first time the tracker runs, because
// server.js calls connectDB() without awaiting it.
let indexReady = false;
async function ensureIndex(events) {
  if (indexReady) return;
  await events.createIndex({ jobNumber: 1, exitedAt: 1 });
  await events.createIndex({ stage: 1, exitedAt: 1 });
  indexReady = true;
}

// Closes the job's currently open stage, then opens toStage.
// toStage = null only closes (used when the job is released).
async function moveStage({
  jobNumber,
  toStage,
  movedBy = null,
  features = {},
}) {
  const events = getDb().collection("stageevents");
  await ensureIndex(events);
  const now = new Date();

  const open = await events.findOne({ jobNumber, exitedAt: null });

  // Already in that stage (e.g. the same save sent twice): do nothing.
  if (open && toStage && open.stage === toStage) return;

  if (open) {
    await events.updateOne(
      { _id: open._id },
      {
        $set: {
          exitedAt: now,
          durationMin: Math.round((now - open.enteredAt) / 60000),
        },
      },
    );
  }

  if (toStage) {
    const queueLength = await events.countDocuments({
      stage: toStage,
      exitedAt: null,
    });
    await events.insertOne({
      jobNumber,
      stage: toStage,
      enteredAt: now,
      exitedAt: null,
      durationMin: null,
      movedBy,
      queueLength,
      ...features,
    });
  }
}

// Compares the job as it was BEFORE an update with the fields being
// saved, and logs a stage move for each flag that just turned on.
// Never throws: a logging problem must not break a real save.
async function logStageMoves(before, data) {
  try {
    if (!before) return;
    const merged = { ...before, ...data };
    const moves = [];

    if (data.concernTagged === true) {
      if (!before.concernTagged) moves.push(["IncomingConcern", null]);
    } else if (data.tagged === true && !before.tagged) {
      moves.push(["IncomingCalibration", null]);
    }

    for (const [flag, stage] of Object.entries(STAGE_FLAGS)) {
      if (data[flag] === true && !before[flag]) {
        const movedBy = data[MOVED_BY_FIELD[flag]] || null;
        moves.push([stage, movedBy]);
      }
    }

    for (const [stage, movedBy] of moves) {
      await moveStage({
        jobNumber: before.jobNumber,
        toStage: stage,
        movedBy,
        features: buildFeatures(merged),
      });
    }
  } catch (err) {
    console.error("Stage logging failed:", err.message);
  }
}

module.exports = { moveStage, logStageMoves, buildFeatures, stageFromFlags };
