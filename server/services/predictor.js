// services/predictor.js
//
// Pure prediction logic (no database access), so it can be unit tested.
// Durations are measured in WORKING minutes (see WORK_* constants), so a
// job that sits overnight or over a Sunday is not treated as "slow".

const { RandomForestRegression } = require("ml-random-forest");

// ---------------------------------------------------------------------------
// Configuration: adjust to SSSI's real working hours
// ---------------------------------------------------------------------------
const TZ_OFFSET_HOURS = 8; // Philippines (UTC+8, no daylight saving)
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 17;
const WORK_DAYS = [1, 2, 3, 4, 5, 6]; // 0 = Sunday ... 6 = Saturday (Mon-Sat)

// Order jobs normally travel through. IncomingConcern is a side branch
// (see remainingStages). Delivery ends when the job is released.
const STAGE_ORDER = [
  "InstrumentTagging",
  "IncomingCalibration",
  "OngoingCalibration",
  "ForTyping",
  "CheckingOIC",
  "CheckingSIG",
  "PrintFinalCertificate",
  "Delivery",
];
const ALL_STAGES = [...STAGE_ORDER, "IncomingConcern"];

// Used only until enough real data exists for a stage.
// !!! PLACEHOLDERS: replace with SSSI staff's own estimates of the typical
// working minutes a job spends in each stage, and describe them in your
// paper as "expert estimates".
const SEED_WORKING_MIN = {
  InstrumentTagging: 30,
  IncomingConcern: 480,
  IncomingCalibration: 240,
  OngoingCalibration: 480,
  ForTyping: 240,
  CheckingOIC: 120,
  CheckingSIG: 120,
  PrintFinalCertificate: 60,
  Delivery: 240,
};

const MIN_ROWS_FOR_GROUP = 3; // rows needed to trust a (stage, procedure) median
const MIN_ROWS_FOR_FOREST = 300; // finished stage rows needed to train the ML model

// ---------------------------------------------------------------------------
// Working-time helpers
// ---------------------------------------------------------------------------
const MS_MIN = 60000;
const MS_DAY = 86400000;
const OFFSET_MS = TZ_OFFSET_HOURS * 3600000;

// Work on a "local clock" where the UTC getters read Philippine time.
const toLocal = (ms) => ms + OFFSET_MS;
const fromLocal = (ms) => ms - OFFSET_MS;
const isWorkDay = (localDayStart) =>
  WORK_DAYS.includes(new Date(localDayStart).getUTCDay());

function workingMinutesBetween(from, to) {
  const a = toLocal(new Date(from).getTime());
  const b = toLocal(new Date(to).getTime());
  if (!(b > a)) return 0;
  let total = 0;
  for (let day = Math.floor(a / MS_DAY) * MS_DAY; day < b; day += MS_DAY) {
    if (!isWorkDay(day)) continue;
    const start = Math.max(a, day + WORK_START_HOUR * 3600000);
    const end = Math.min(b, day + WORK_END_HOUR * 3600000);
    if (end > start) total += (end - start) / MS_MIN;
  }
  return Math.round(total);
}

// Date reached after spending `minutes` of working time starting at `from`.
function addWorkingMinutes(from, minutes) {
  let t = toLocal(new Date(from).getTime());
  let left = Math.max(0, minutes);
  for (let guard = 0; guard < 3650; guard++) {
    const day = Math.floor(t / MS_DAY) * MS_DAY;
    const open = day + WORK_START_HOUR * 3600000;
    const close = day + WORK_END_HOUR * 3600000;
    if (!isWorkDay(day) || t >= close) {
      t = day + MS_DAY + WORK_START_HOUR * 3600000; // next morning
      continue;
    }
    if (t < open) t = open;
    const room = (close - t) / MS_MIN;
    if (left <= room) return new Date(fromLocal(t + left * MS_MIN));
    left -= room;
    t = close;
  }
  return new Date(fromLocal(t));
}

// The manual ETA staff type ("2026-10-01") is treated as end of that working day.
function deadlineFromEta(etaStr) {
  if (!etaStr || !/^\d{4}-\d{2}-\d{2}/.test(etaStr)) return null;
  const hh = String(WORK_END_HOUR).padStart(2, "0");
  const off = `+${String(TZ_OFFSET_HOURS).padStart(2, "0")}:00`;
  const d = new Date(`${etaStr.slice(0, 10)}T${hh}:00:00${off}`);
  return isNaN(d) ? null : d;
}

// ---------------------------------------------------------------------------
// Rows: one per finished stage
// ---------------------------------------------------------------------------
// Converts stageevents documents into training rows with a working-minute target.
function toRows(events) {
  return events
    .filter((e) => e.exitedAt && e.enteredAt)
    .map((e) => ({
      jobNumber: e.jobNumber,
      stage: e.stage,
      procedure: e.calibrationProcedure || "",
      type: e.instrumentType || "",
      priority: e.priority || "Normal",
      onSite: e.onSite ? 1 : 0,
      isSiteJob: e.isSiteJob ? 1 : 0,
      hadConcern: e.hadConcern ? 1 : 0,
      queueLength: e.queueLength || 0,
      dow: new Date(toLocal(new Date(e.enteredAt).getTime())).getUTCDay(),
      hour: new Date(toLocal(new Date(e.enteredAt).getTime())).getUTCHours(),
      minutes: workingMinutesBetween(e.enteredAt, e.exitedAt),
    }));
}

const median = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// ---------------------------------------------------------------------------
// Baseline: median working minutes per stage (and per stage + procedure)
// ---------------------------------------------------------------------------
function buildBaseline(rows) {
  const byStage = {};
  const byStageProc = {};
  for (const r of rows) {
    (byStage[r.stage] ||= []).push(r.minutes);
    if (r.procedure)
      (byStageProc[`${r.stage}|${r.procedure}`] ||= []).push(r.minutes);
  }
  const summarize = (obj) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        { n: v.length, median: median(v) },
      ]),
    );
  return { byStage: summarize(byStage), byStageProc: summarize(byStageProc) };
}

function baselinePredict(baseline, stage, procedure) {
  const sp = baseline.byStageProc[`${stage}|${procedure}`];
  if (sp && sp.n >= MIN_ROWS_FOR_GROUP)
    return { minutes: sp.median, source: "baseline:stage+procedure" };
  const s = baseline.byStage[stage];
  if (s && s.n >= MIN_ROWS_FOR_GROUP)
    return { minutes: s.median, source: "baseline:stage" };
  return { minutes: SEED_WORKING_MIN[stage] ?? 240, source: "seed" };
}

// ---------------------------------------------------------------------------
// Random forest
// ---------------------------------------------------------------------------
function buildEncoder(rows) {
  const uniq = (key) =>
    [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort();
  return {
    procedures: uniq("procedure"),
    types: uniq("type"),
    priorities: uniq("priority"),
  };
}

const oneHot = (list, value) => list.map((v) => (v === value ? 1 : 0));

function encodeRow(enc, r) {
  return [
    ...oneHot(ALL_STAGES, r.stage),
    ...oneHot(enc.procedures, r.procedure),
    ...oneHot(enc.types, r.type),
    ...oneHot(enc.priorities, r.priority),
    r.onSite,
    r.isSiteJob,
    r.hadConcern,
    r.queueLength,
    r.dow,
    r.hour,
  ];
}

// Reference duration for a stage: the stage-wide median (or the seed).
// The forest learns a MULTIPLIER on top of it instead of raw minutes, which
// is far easier for trees than learning both the size of each stage and the
// effect of every feature at once.
const refMinutes = (baseline, stage) =>
  baseline.byStage[stage]?.n >= MIN_ROWS_FOR_GROUP
    ? baseline.byStage[stage].median
    : (SEED_WORKING_MIN[stage] ?? 240);

const logRatio = (minutes, ref) => Math.log1p(minutes) - Math.log1p(ref);

function trainForest(rows, enc, baseline, seed = 42) {
  const X = rows.map((r) => encodeRow(enc, r));
  const y = rows.map((r) => logRatio(r.minutes, refMinutes(baseline, r.stage)));
  const forest = new RandomForestRegression({
    nEstimators: 40,
    seed,
    replacement: true,
    maxFeatures: 0.7,
    treeOptions: { maxDepth: 8, minNumSamples: 3 },
  });
  forest.train(X, y);
  return forest;
}

const forestPredict = (forest, enc, baseline, r) => {
  const ref = refMinutes(baseline, r.stage);
  const ratio = forest.predict([encodeRow(enc, r)])[0];
  return Math.max(1, Math.round(Math.expm1(Math.log1p(ref) + ratio)));
};

// ---------------------------------------------------------------------------
// Training + honest evaluation
// ---------------------------------------------------------------------------
// Split by JOB (not by row) so stages of one job never sit in both train and
// test sets; otherwise the model would be graded on jobs it has already seen.
function splitByJob(rows, testShare = 0.2) {
  const hash = (s) =>
    [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const train = [],
    test = [];
  for (const r of rows)
    (hash(r.jobNumber) % 100 < testShare * 100 ? test : train).push(r);
  return { train, test };
}

const mae = (pairs) =>
  pairs.length
    ? pairs.reduce((s, [p, a]) => s + Math.abs(p - a), 0) / pairs.length
    : null;

function trainAll(rows) {
  const info = {
    rowCount: rows.length,
    jobCount: new Set(rows.map((r) => r.jobNumber)).size,
  };
  const baseline = buildBaseline(rows);
  const result = {
    baseline,
    forest: null,
    encoder: null,
    metrics: { ...info, forestTrained: false },
  };

  if (rows.length < MIN_ROWS_FOR_FOREST) {
    result.metrics.note = `Baseline only: ${rows.length} finished stage rows, ML model needs ${MIN_ROWS_FOR_FOREST}.`;
    return result;
  }

  const { train, test } = splitByJob(rows);
  if (test.length >= 20) {
    const evalBase = buildBaseline(train);
    const evalEnc = buildEncoder(train);
    const evalForest = trainForest(train, evalEnc, evalBase);
    const basePairs = test.map((r) => [
      baselinePredict(evalBase, r.stage, r.procedure).minutes,
      r.minutes,
    ]);
    const forestPairs = test.map((r) => [
      forestPredict(evalForest, evalEnc, evalBase, r),
      r.minutes,
    ]);
    result.metrics.testRows = test.length;
    result.metrics.baselineMAE = Math.round(mae(basePairs));
    result.metrics.forestMAE = Math.round(mae(forestPairs));
    result.metrics.improvementPct = Math.round(
      ((result.metrics.baselineMAE - result.metrics.forestMAE) /
        result.metrics.baselineMAE) *
        100,
    );
  }

  // Final model uses every row
  result.encoder = buildEncoder(rows);
  result.forest = trainForest(rows, result.encoder, baseline);
  result.metrics.forestTrained = true;
  return result;
}

// ---------------------------------------------------------------------------
// Predicting a live job
// ---------------------------------------------------------------------------
// IncomingConcern is a side branch: after it the job is assumed to continue
// from IncomingCalibration. Adjust if SSSI's flow differs.
function remainingStages(currentStage) {
  if (currentStage === "IncomingConcern")
    return ["IncomingConcern", ...STAGE_ORDER.slice(1)];
  const i = STAGE_ORDER.indexOf(currentStage);
  return i === -1 ? [] : STAGE_ORDER.slice(i);
}

// model = { baseline, forest, encoder }, queueByStage = { stage: openJobsCount }
function predictRemaining({
  model,
  currentEvent,
  job,
  queueByStage = {},
  now = new Date(),
}) {
  const stages = remainingStages(currentEvent.stage);
  const procedure =
    currentEvent.calibrationProcedure || job?.calibrationProcedure || "";
  const base = {
    procedure,
    type: currentEvent.instrumentType || job?.type || "",
    priority: currentEvent.priority || job?.priority || "Normal",
    onSite: currentEvent.onSite ? 1 : 0,
    isSiteJob: currentEvent.isSiteJob ? 1 : 0,
    hadConcern: currentEvent.hadConcern ? 1 : 0,
  };

  const steps = [];
  let total = 0;
  stages.forEach((stage, idx) => {
    const isCurrent = idx === 0;
    const at = isCurrent ? new Date(currentEvent.enteredAt) : now;
    const local = new Date(toLocal(at.getTime()));
    const row = {
      ...base,
      stage,
      queueLength: isCurrent
        ? currentEvent.queueLength || 0
        : queueByStage[stage] || 0,
      dow: local.getUTCDay(),
      hour: local.getUTCHours(),
    };

    let minutes, source;
    if (model.forest) {
      minutes = forestPredict(model.forest, model.encoder, model.baseline, row);
      source = "forest";
    } else {
      ({ minutes, source } = baselinePredict(model.baseline, stage, procedure));
    }

    if (isCurrent) {
      // Time already spent here counts against the estimate, but never
      // let the remaining time fall to zero (it is not finished yet).
      const elapsed = workingMinutesBetween(currentEvent.enteredAt, now);
      const remaining = Math.max(Math.round(minutes * 0.1), minutes - elapsed);
      steps.push({
        stage,
        predictedMin: minutes,
        remainingMin: remaining,
        source,
      });
      total += remaining;
    } else {
      steps.push({
        stage,
        predictedMin: minutes,
        remainingMin: minutes,
        source,
      });
      total += minutes;
    }
  });

  return {
    steps,
    remainingWorkingMin: total,
    predictedCompletion: addWorkingMinutes(now, total),
  };
}

module.exports = {
  STAGE_ORDER,
  ALL_STAGES,
  SEED_WORKING_MIN,
  MIN_ROWS_FOR_FOREST,
  workingMinutesBetween,
  addWorkingMinutes,
  deadlineFromEta,
  toRows,
  buildBaseline,
  baselinePredict,
  buildEncoder,
  trainForest,
  forestPredict,
  trainAll,
  predictRemaining,
  remainingStages,
  RandomForestRegression,
};
