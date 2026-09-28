// // services/predictionService.js
// //
// // Database side of the prediction feature: loads stage history, trains and
// // stores the model (collection "predictionmodels"), and produces ETAs for
// // jobs that are currently in the pipeline.

// const { getDb } = require("../config/db");
// const P = require("./predictor");

// const MODEL_ID = "latest";
// const MAX_MODEL_AGE_MS = 24 * 60 * 60 * 1000; // retrain lazily once a day

// let cache = null; // { doc, model }

// // Finished stage rows. Simulated rows (from scripts/seedSimulatedEvents.js)
// // are flagged simulated:true and can be excluded.
// async function loadRows(includeSimulated) {
//   const query = { exitedAt: { $ne: null } };
//   if (!includeSimulated) query.simulated = { $ne: true };
//   const events = await getDb().collection("stageevents").find(query).toArray();
//   return P.toRows(events);
// }

// function hydrate(doc) {
//   return {
//     baseline: doc.baseline,
//     encoder: doc.encoder,
//     // The forest is stored as a JSON string: avoids Mongo key/nesting quirks.
//     forest: doc.forestJson
//       ? P.RandomForestRegression.load(JSON.parse(doc.forestJson))
//       : null,
//   };
// }

// async function trainAndSave({ includeSimulated = true } = {}) {
//   const rows = await loadRows(includeSimulated);
//   const result = P.trainAll(rows);
//   const doc = {
//     _id: MODEL_ID,
//     trainedAt: new Date(),
//     includeSimulated,
//     metrics: result.metrics,
//     baseline: result.baseline,
//     encoder: result.encoder,
//     forestJson: result.forest ? JSON.stringify(result.forest.toJSON()) : null,
//   };
//   await getDb()
//     .collection("predictionmodels")
//     .replaceOne({ _id: MODEL_ID }, doc, { upsert: true });
//   cache = {
//     doc,
//     model: {
//       baseline: result.baseline,
//       encoder: result.encoder,
//       forest: result.forest,
//     },
//   };
//   return doc;
// }

// async function getModel() {
//   const fresh = (doc) =>
//     doc && Date.now() - new Date(doc.trainedAt).getTime() < MAX_MODEL_AGE_MS;
//   if (cache && fresh(cache.doc)) return cache;

//   const stored = await getDb()
//     .collection("predictionmodels")
//     .findOne({ _id: MODEL_ID });
//   if (fresh(stored)) {
//     cache = { doc: stored, model: hydrate(stored) };
//     return cache;
//   }
//   // Missing or stale: retrain with the same data choice as last time
//   await trainAndSave({
//     includeSimulated: stored ? stored.includeSimulated : true,
//   });
//   return cache;
// }

// // Public model info (no forest, no baseline tables)
// function describe(doc) {
//   return {
//     trainedAt: doc.trainedAt,
//     includeSimulated: doc.includeSimulated,
//     usingMachineLearning: !!doc.forestJson,
//     metrics: doc.metrics,
//   };
// }

// async function openEvents() {
//   return getDb()
//     .collection("stageevents")
//     .find({ exitedAt: null, simulated: { $ne: true } })
//     .toArray();
// }

// const queueCounts = (events) =>
//   events.reduce(
//     (acc, e) => ((acc[e.stage] = (acc[e.stage] || 0) + 1), acc),
//     {},
//   );

// function shape(event, job, prediction) {
//   const deadline = P.deadlineFromEta(job?.eta);
//   const predicted = prediction.predictedCompletion;
//   return {
//     jobNumber: event.jobNumber,
//     currentStage: event.stage,
//     enteredStageAt: event.enteredAt,
//     companyName: job?.companyName || "",
//     description: job?.description || "",
//     priority: job?.priority || event.priority || "Normal",
//     manualEta: job?.eta || null,
//     predictedCompletion: predicted,
//     remainingWorkingMin: prediction.remainingWorkingMin,
//     atRisk: deadline ? predicted > deadline : false,
//     daysLateVsManualEta:
//       deadline && predicted > deadline
//         ? Math.ceil((predicted - deadline) / 86400000)
//         : 0,
//     steps: prediction.steps,
//   };
// }

// // ETAs for every job currently in the pipeline, most at-risk first
// async function predictActive() {
//   const { model, doc } = await getModel();
//   const events = await openEvents();
//   const queueByStage = queueCounts(events);
//   const jobs = await getDb()
//     .collection("jobnumbers")
//     .find({ jobNumber: { $in: events.map((e) => e.jobNumber) } })
//     .toArray();
//   const byNumber = Object.fromEntries(jobs.map((j) => [j.jobNumber, j]));

//   const items = events.map((e) =>
//     shape(
//       e,
//       byNumber[e.jobNumber],
//       P.predictRemaining({
//         model,
//         currentEvent: e,
//         job: byNumber[e.jobNumber],
//         queueByStage,
//       }),
//     ),
//   );
//   items.sort(
//     (a, b) =>
//       b.daysLateVsManualEta - a.daysLateVsManualEta ||
//       a.predictedCompletion - b.predictedCompletion,
//   );
//   return { model: describe(doc), jobs: items };
// }

// async function predictOne(jobNumber) {
//   const { model, doc } = await getModel();
//   const events = await openEvents();
//   const event = events.find((e) => e.jobNumber === jobNumber);
//   if (!event) return null; // not in the pipeline (finished, or never logged)
//   const job = await getDb().collection("jobnumbers").findOne({ jobNumber });
//   const prediction = P.predictRemaining({
//     model,
//     currentEvent: event,
//     job,
//     queueByStage: queueCounts(events),
//   });
//   return { model: describe(doc), ...shape(event, job, prediction) };
// }

// // Where does time go? Average working minutes per stage plus current queue.
// async function stageStats() {
//   const { doc } = await getModel();
//   const rows = await loadRows(doc.includeSimulated);
//   const queue = queueCounts(await openEvents());
//   const by = {};
//   rows.forEach((r) => (by[r.stage] ||= []).push(r.minutes));
//   return P.ALL_STAGES.filter((s) => by[s] || queue[s])
//     .map((stage) => {
//       const v = by[stage] || [];
//       return {
//         stage,
//         finishedCount: v.length,
//         avgWorkingMin: v.length
//           ? Math.round(v.reduce((a, b) => a + b, 0) / v.length)
//           : null,
//         medianWorkingMin: v.length
//           ? Math.round(P.buildBaseline(rows).byStage[stage].median)
//           : null,
//         jobsWaitingNow: queue[stage] || 0,
//       };
//     })
//     .sort((a, b) => (b.avgWorkingMin || 0) - (a.avgWorkingMin || 0));
// }

// module.exports = {
//   trainAndSave,
//   getModel,
//   describe,
//   predictActive,
//   predictOne,
//   stageStats,
// };
// services/predictionService.js
//
// Database side of the prediction feature: loads stage history, trains and
// stores the model (collection "predictionmodels"), and produces ETAs for
// jobs that are currently in the pipeline.

const { getDb } = require("../config/db");
const P = require("./predictor");

const MODEL_ID = "latest";
const MAX_MODEL_AGE_MS = 24 * 60 * 60 * 1000; // retrain lazily once a day

let cache = null; // { doc, model }

// Finished stage rows. Simulated rows (from scripts/seedSimulatedEvents.js)
// are flagged simulated:true and can be excluded.
async function loadRows(includeSimulated) {
  const query = { exitedAt: { $ne: null } };
  if (!includeSimulated) query.simulated = { $ne: true };
  const events = await getDb().collection("stageevents").find(query).toArray();
  return P.toRows(events);
}

function hydrate(doc) {
  return {
    baseline: doc.baseline,
    encoder: doc.encoder,
    // The forest is stored as a JSON string: avoids Mongo key/nesting quirks.
    forest: doc.forestJson
      ? P.RandomForestRegression.load(JSON.parse(doc.forestJson))
      : null,
  };
}

async function trainAndSave({ includeSimulated = true } = {}) {
  const rows = await loadRows(includeSimulated);
  const result = P.trainAll(rows);
  const doc = {
    _id: MODEL_ID,
    trainedAt: new Date(),
    includeSimulated,
    metrics: result.metrics,
    baseline: result.baseline,
    encoder: result.encoder,
    forestJson: result.forest ? JSON.stringify(result.forest.toJSON()) : null,
  };
  await getDb()
    .collection("predictionmodels")
    .replaceOne({ _id: MODEL_ID }, doc, { upsert: true });
  cache = {
    doc,
    model: {
      baseline: result.baseline,
      encoder: result.encoder,
      forest: result.forest,
    },
  };
  return doc;
}

async function getModel() {
  const fresh = (doc) =>
    doc && Date.now() - new Date(doc.trainedAt).getTime() < MAX_MODEL_AGE_MS;
  if (cache && fresh(cache.doc)) return cache;

  const stored = await getDb()
    .collection("predictionmodels")
    .findOne({ _id: MODEL_ID });
  if (fresh(stored)) {
    cache = { doc: stored, model: hydrate(stored) };
    return cache;
  }
  // Missing or stale: retrain with the same data choice as last time
  await trainAndSave({
    includeSimulated: stored ? stored.includeSimulated : true,
  });
  return cache;
}

// Public model info (no forest, no baseline tables)
function describe(doc) {
  return {
    trainedAt: doc.trainedAt,
    includeSimulated: doc.includeSimulated,
    usingMachineLearning: !!doc.forestJson,
    metrics: doc.metrics,
  };
}

async function openEvents() {
  return getDb()
    .collection("stageevents")
    .find({ exitedAt: null, simulated: { $ne: true } })
    .toArray();
}

// Job documents for the given stage events. companyName usually lives on the
// job RECEIPT (linked by jobReceiptID = receipt.jrId), not on the job itself,
// so it is looked up there, the same way the For Typing page does it.
async function loadJobs(events) {
  const db = getDb();
  const jobs = await db
    .collection("jobnumbers")
    .find({ jobNumber: { $in: events.map((e) => e.jobNumber) } })
    .toArray();
  const jrIds = [...new Set(jobs.map((j) => j.jobReceiptID).filter(Boolean))];
  const receipts = jrIds.length
    ? await db
        .collection("jobreceipts")
        .find({ jrId: { $in: jrIds } })
        .toArray()
    : [];
  const receiptById = Object.fromEntries(receipts.map((r) => [r.jrId, r]));
  return Object.fromEntries(
    jobs.map((j) => {
      const receipt = receiptById[j.jobReceiptID] || {};
      return [
        j.jobNumber,
        { ...j, companyName: receipt.companyName || j.companyName || "" },
      ];
    }),
  );
}

const queueCounts = (events) =>
  events.reduce(
    (acc, e) => ((acc[e.stage] = (acc[e.stage] || 0) + 1), acc),
    {},
  );

function shape(event, job, prediction) {
  const deadline = P.deadlineFromEta(job?.eta);
  const predicted = prediction.predictedCompletion;
  return {
    jobNumber: event.jobNumber,
    currentStage: event.stage,
    enteredStageAt: event.enteredAt,
    companyName: job?.companyName || "",
    description: job?.description || "",
    priority: job?.priority || event.priority || "Normal",
    manualEta: job?.eta || null,
    predictedCompletion: predicted,
    remainingWorkingMin: prediction.remainingWorkingMin,
    atRisk: deadline ? predicted > deadline : false,
    daysLateVsManualEta:
      deadline && predicted > deadline
        ? Math.ceil((predicted - deadline) / 86400000)
        : 0,
    steps: prediction.steps,
  };
}

// ETAs for every job currently in the pipeline, most at-risk first
async function predictActive() {
  const { model, doc } = await getModel();
  const events = await openEvents();
  const queueByStage = queueCounts(events);
  const byNumber = await loadJobs(events);

  const items = events.map((e) =>
    shape(
      e,
      byNumber[e.jobNumber],
      P.predictRemaining({
        model,
        currentEvent: e,
        job: byNumber[e.jobNumber],
        queueByStage,
      }),
    ),
  );
  items.sort(
    (a, b) =>
      b.daysLateVsManualEta - a.daysLateVsManualEta ||
      a.predictedCompletion - b.predictedCompletion,
  );
  return { model: describe(doc), jobs: items };
}

async function predictOne(jobNumber) {
  const { model, doc } = await getModel();
  const events = await openEvents();
  const event = events.find((e) => e.jobNumber === jobNumber);
  if (!event) return null; // not in the pipeline (finished, or never logged)
  const job = (await loadJobs([event]))[jobNumber];
  const prediction = P.predictRemaining({
    model,
    currentEvent: event,
    job,
    queueByStage: queueCounts(events),
  });
  return { model: describe(doc), ...shape(event, job, prediction) };
}

// Where does time go? Average working minutes per stage plus current queue.
async function stageStats() {
  const { doc } = await getModel();
  const rows = await loadRows(doc.includeSimulated);
  const queue = queueCounts(await openEvents());
  const by = {};
  rows.forEach((r) => (by[r.stage] ||= []).push(r.minutes));
  return P.ALL_STAGES.filter((s) => by[s] || queue[s])
    .map((stage) => {
      const v = by[stage] || [];
      return {
        stage,
        finishedCount: v.length,
        avgWorkingMin: v.length
          ? Math.round(v.reduce((a, b) => a + b, 0) / v.length)
          : null,
        medianWorkingMin: v.length
          ? Math.round(P.buildBaseline(rows).byStage[stage].median)
          : null,
        jobsWaitingNow: queue[stage] || 0,
      };
    })
    .sort((a, b) => (b.avgWorkingMin || 0) - (a.avgWorkingMin || 0));
}

module.exports = {
  trainAndSave,
  getModel,
  describe,
  predictActive,
  predictOne,
  stageStats,
};
