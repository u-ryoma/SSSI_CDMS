// Learned layer: one random forest trained on every instrument's history.
// Final prediction = hybrid of the forest and the instrument's own regression trend (see hybrid()).
// Predicts how much the drift % will CHANGE by the instrument's NEXT calibration, given its history,
// its instrument type and how much time will have passed (predicted drift = last drift + change). Compared against per-instrument regression with
// grouped 5-fold cross-validation (all calibrations of an instrument stay in the same fold).
const { RandomForestRegression } = require("ml-random-forest");
const { DAY, WARN, ols, clamp, driftSeries } = require("./driftService");

const INTERVAL_CHOICES = [90, 180, 270, 365, 545, 730];
const MIN_SAMPLES = 20,
  MIN_GROUPS = 8,
  VOCAB_SIZE = 10,
  FOLDS = 5;
const FOREST_OPTIONS = {
  nEstimators: 60,
  seed: 7,
  maxFeatures: 0.8,
  replacement: true,
};

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toGroups(readingsByKey) {
  return Object.entries(readingsByKey)
    .map(([key, rs]) => {
      const latest = [...rs].sort(
        (a, b) => new Date(b.calibratedAt) - new Date(a.calibratedAt),
      )[0];
      return {
        key,
        description: norm(latest.description),
        series: driftSeries(rs),
      };
    })
    .filter((g) => g.series.length >= 1);
}

function buildVocab(groups) {
  const counts = {};
  groups.forEach(
    (g) => (counts[g.description] = (counts[g.description] || 0) + 1),
  );
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, VOCAB_SIZE)
    .map((e) => e[0]);
}

// history = earlier calibrations (oldest -> newest); intervalDays = time until the one we predict.
function featuresFor(history, intervalDays, description, vocab) {
  const n = history.length;
  const last = history[n - 1];
  let slope = 0;
  if (n >= 2) {
    const t0 = history[0].t;
    slope = ols(
      history.map((p) => (p.t - t0) / DAY),
      history.map((p) => p.d),
    ).slope;
  }
  const ds = history.map((p) => p.d);
  const onehot = vocab.map((v) => (v === description ? 1 : 0));
  onehot.push(vocab.includes(description) ? 0 : 1);
  return [
    last.d,
    slope,
    slope * intervalDays,
    mean(ds),
    Math.max(...ds),
    n,
    (last.t - history[0].t) / DAY,
    intervalDays,
    ...onehot,
  ];
}

function baselinePredict(history, tTarget) {
  const last = history[history.length - 1];
  if (history.length < 2) return last.d;
  const t0 = history[0].t;
  const f = ols(
    history.map((p) => (p.t - t0) / DAY),
    history.map((p) => p.d),
  );
  return clamp(f.intercept + f.slope * ((tTarget - t0) / DAY));
}

// Hybrid: with 2+ earlier calibrations the instrument's own trend is informative, so average it with the forest;
// with a single earlier calibration there is no trend yet, so rely on the forest alone.
function hybrid(history, forestValue, tTarget) {
  return history.length >= 2
    ? (forestValue + baselinePredict(history, tTarget)) / 2
    : forestValue;
}

function buildSamples(groups, vocab) {
  const out = [];
  for (const g of groups) {
    const s = g.series;
    for (let i = 1; i < s.length; i++) {
      const interval = (s[i].t - s[i - 1].t) / DAY;
      if (interval <= 0) continue;
      const history = s.slice(0, i);
      out.push({
        groupKey: g.key,
        nPrior: i,
        prev: s[i - 1].d,
        history,
        tTarget: s[i].t,
        x: featuresFor(history, interval, g.description, vocab),
        y: s[i].d - s[i - 1].d, // change in drift since the previous calibration
        actual: s[i].d,
        baseline: baselinePredict(history, s[i].t),
      });
    }
  }
  return out;
}

function crossValidate(samples) {
  const keys = [...new Set(samples.map((s) => s.groupKey))];
  const rand = mulberry32(42);
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  const foldOf = Object.fromEntries(keys.map((k, i) => [k, i % FOLDS]));
  const acc = { all: [0, 0, 0, 0], one: [0, 0, 0, 0], multi: [0, 0, 0, 0] }; // [count, baselineErr, forestErr, hybridErr]
  for (let f = 0; f < FOLDS; f++) {
    const train = samples.filter((s) => foldOf[s.groupKey] !== f);
    const test = samples.filter((s) => foldOf[s.groupKey] === f);
    if (train.length < 5 || !test.length) continue;
    const rf = new RandomForestRegression(FOREST_OPTIONS);
    rf.train(
      train.map((s) => s.x),
      train.map((s) => s.y),
    );
    const pred = rf.predict(test.map((s) => s.x));
    test.forEach((s, i) => {
      const be = Math.abs(s.baseline - s.actual);
      const forestValue = clamp(s.prev + pred[i]);
      const fe = Math.abs(forestValue - s.actual);
      const he = Math.abs(hybrid(s.history, forestValue, s.tTarget) - s.actual);
      for (const k of ["all", s.nPrior === 1 ? "one" : "multi"]) {
        acc[k][0]++;
        acc[k][1] += be;
        acc[k][2] += fe;
        acc[k][3] += he;
      }
    });
  }
  const fmt = (a) =>
    a[0]
      ? {
          testSamples: a[0],
          baselineMAE: +(a[1] / a[0]).toFixed(2),
          forestMAE: +(a[2] / a[0]).toFixed(2),
          hybridMAE: +(a[3] / a[0]).toFixed(2),
        }
      : null;
  return acc.all[0]
    ? {
        ...fmt(acc.all),
        onePriorCalibration: fmt(acc.one),
        twoOrMorePrior: fmt(acc.multi),
      }
    : null;
}

function trainModel(readingsByKey) {
  const groups = toGroups(readingsByKey);
  const vocab = buildVocab(groups);
  const samples = buildSamples(groups, vocab);
  if (samples.length < MIN_SAMPLES || groups.length < MIN_GROUPS) {
    return {
      ok: false,
      reason: `Need at least ${MIN_SAMPLES} calibration pairs from ${MIN_GROUPS} instruments (have ${samples.length} from ${groups.length}).`,
    };
  }
  const cv = crossValidate(samples);
  const forest = new RandomForestRegression(FOREST_OPTIONS);
  forest.train(
    samples.map((s) => s.x),
    samples.map((s) => s.y),
  );
  return {
    ok: true,
    forest,
    meta: {
      trainedAt: new Date(),
      samples: samples.length,
      instruments: groups.length,
      vocab,
      cv,
      algorithm: "RandomForestRegression",
      trees: FOREST_OPTIONS.nEstimators,
    },
  };
}

const serialize = (m) => ({
  meta: m.meta,
  forestJson: JSON.stringify(m.forest.toJSON()),
});
const deserialize = (d) => ({
  forest: RandomForestRegression.load(JSON.parse(d.forestJson)),
  meta: d.meta,
});

function predictDrift(model, series, description, intervalDays) {
  const x = featuresFor(
    series,
    intervalDays,
    norm(description),
    model.meta.vocab,
  );
  const last = series[series.length - 1];
  const forestValue = clamp(last.d + model.forest.predict([x])[0]);
  return clamp(hybrid(series, forestValue, last.t + intervalDays * DAY));
}

// Predicted drift at several possible calibration intervals (kept non-decreasing).
function sweepIntervals(model, series, description) {
  let run = 0;
  return INTERVAL_CHOICES.map((days) => {
    run = Math.max(run, predictDrift(model, series, description, days));
    return { days, drift: Math.round(run * 10) / 10 };
  });
}

// Longest interval whose predicted drift stays under the warning level.
function recommendInterval(sweep) {
  let best = null;
  for (const p of sweep) if (p.drift <= WARN) best = p.days;
  return best === null
    ? { days: sweep[0].days, exhausted: true }
    : { days: best, exhausted: false };
}

module.exports = {
  trainModel,
  serialize,
  deserialize,
  predictDrift,
  sweepIntervals,
  recommendInterval,
  INTERVAL_CHOICES,
};
