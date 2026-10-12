// Statistical layer: drift series, linear regression forecast (baseline), anomaly detection.
const DAY = 86400000;
const WARN = 80; // % of uncertainty: warning level
const LIMIT = 100; // % of uncertainty: limit
const CAP = 300; // cap so one wild reading can't dominate
const RANK = { "Insufficient data": 0, Stable: 1, Watch: 2, Drifting: 3 };

const round1 = (v) => Math.round(v * 10) / 10;
const clamp = (v) => Math.min(CAP, Math.max(0, v));

function ols(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0,
    sxy = 0,
    syy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
    syy += (ys[i] - my) ** 2;
  }
  const slope = sxx ? sxy / sxx : 0;
  const intercept = my - slope * mx;
  const r2 = sxx && syy ? (sxy * sxy) / (sxx * syy) : 0;
  return { slope, intercept, r2 };
}

// One drift% per calibration = worst test point, as % of its uncertainty/tolerance.
function driftSeries(readings) {
  return readings
    .map((r) => {
      const d = Math.max(
        ...r.points.map((p) => (Math.abs(p.asFoundError) / p.tolerance) * 100),
      );
      return { t: new Date(r.calibratedAt).getTime(), d: Math.min(d, CAP) };
    })
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.d))
    .sort((a, b) => a.t - b.t);
}

const statusFromDrift = (d) =>
  d >= LIMIT ? "Drifting" : d >= WARN ? "Watch" : "Stable";
const worstStatus = (a, b) => (RANK[a] >= RANK[b] ? a : b);

// Baseline model: per-instrument linear regression, projected forward.
function regressionAnalysis(series, frequencyDays = 365) {
  const n = series.length;
  const last = series[n - 1];
  const base = {
    n,
    lastCalibratedAt: last ? new Date(last.t) : null,
    dueByFreq: last ? new Date(last.t + frequencyDays * DAY) : null,
    latestDriftPct: last ? round1(last.d) : null,
  };
  if (n < 2) return { ...base, status: "Insufficient data", confidence: "low" };

  const t0 = series[0].t;
  const { slope, intercept, r2 } = ols(
    series.map((p) => (p.t - t0) / DAY),
    series.map((p) => p.d),
  );
  const dueByFreq = last.t + frequencyDays * DAY;
  const cross = (lvl) =>
    slope > 0 ? t0 + ((lvl - intercept) / slope) * DAY : null;
  const warnAt = cross(WARN),
    limitAt = cross(LIMIT);

  let status = "Stable";
  if (last.d >= LIMIT || (limitAt && limitAt < dueByFreq)) status = "Drifting";
  else if (last.d >= WARN || (warnAt && warnAt < dueByFreq)) status = "Watch";

  const future = [dueByFreq];
  if (warnAt && warnAt > last.t) future.push(warnAt);

  return {
    ...base,
    status,
    slopePctPerMonth: round1(slope * 30),
    r2: +r2.toFixed(2),
    confidence: n >= 4 && r2 >= 0.6 ? "high" : n >= 3 ? "medium" : "low",
    projectedWarnDate: warnAt ? new Date(warnAt) : null,
    projectedLimitDate: limitAt ? new Date(limitAt) : null,
    regressionDue: new Date(Math.min(...future)),
    fit: { slope, intercept, t0 },
  };
}

// Is the latest result unusual compared with the trend of the earlier ones?
function detectAnomaly(series) {
  if (series.length < 4) return { checked: false, flag: false };
  const prior = series.slice(0, -1);
  const last = series[series.length - 1];
  const t0 = prior[0].t;
  const xs = prior.map((p) => (p.t - t0) / DAY);
  const f = ols(
    xs,
    prior.map((p) => p.d),
  );
  const res = prior.map((p, i) => p.d - (f.intercept + f.slope * xs[i]));
  const sd = Math.max(
    5,
    Math.sqrt(
      res.reduce((a, r) => a + r * r, 0) / Math.max(1, prior.length - 2),
    ),
  );
  const expected = f.intercept + f.slope * ((last.t - t0) / DAY);
  const z = (last.d - expected) / sd;
  return {
    checked: true,
    flag: Math.abs(z) > 2.5,
    z: +z.toFixed(1),
    expected: round1(expected),
  };
}

module.exports = {
  DAY,
  WARN,
  LIMIT,
  CAP,
  RANK,
  round1,
  clamp,
  ols,
  driftSeries,
  statusFromDrift,
  worstStatus,
  regressionAnalysis,
  detectAnomaly,
};
