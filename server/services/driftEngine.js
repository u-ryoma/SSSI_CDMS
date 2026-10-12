// Combines the statistical baseline, the learned model, and anomaly detection into one result per instrument.
const {
  DAY,
  RANK,
  round1,
  driftSeries,
  statusFromDrift,
  worstStatus,
  regressionAnalysis,
  detectAnomaly,
} = require("./driftService");
const {
  predictDrift,
  sweepIntervals,
  recommendInterval,
} = require("./driftModel");

function buildSummary(item, frequencyDays) {
  const { status, latestDriftPct, slopePctPerMonth, ai, anomaly, n } = item;
  if (status === "Insufficient data") {
    return "Only one calibration on record and no trained model yet. More history is needed to forecast drift.";
  }
  const parts = [];
  parts.push(
    `Latest drift is ${latestDriftPct}% of the instrument's uncertainty`,
  );
  if (slopePctPerMonth != null) {
    parts[0] +=
      slopePctPerMonth > 0.2
        ? `, trending up about ${slopePctPerMonth}% per month.`
        : ", with no meaningful upward trend.";
  } else parts[0] += ".";
  if (ai) {
    parts.push(
      `The model expects ${ai.predictedDriftAtDue}% by the ${frequencyDays}-day due date.`,
    );
    if (ai.atLimitEvenShortest)
      parts.push(
        `Even a ${ai.recommendedIntervalDays}-day interval is predicted to exceed the warning level, so review this instrument.`,
      );
    else if (ai.recommendedIntervalDays < frequencyDays)
      parts.push(
        `Recommend shortening the interval to ${ai.recommendedIntervalDays} days.`,
      );
    else if (ai.recommendedIntervalDays > frequencyDays && n >= 3)
      parts.push(
        `The current interval looks conservative; up to ${ai.recommendedIntervalDays} days stays within the warning level.`,
      );
    else parts.push("The current interval is appropriate.");
  }
  if (anomaly.flag)
    parts.push(
      `The latest result is unusual compared with its own trend (z = ${anomaly.z}); verify the measurement or standard used.`,
    );
  return parts.join(" ");
}

function buildItem(key, readings, model) {
  const latest = [...readings].sort(
    (a, b) => new Date(b.calibratedAt) - new Date(a.calibratedAt),
  )[0];
  const frequencyDays = latest.frequencyDays || 365;
  const series = driftSeries(readings);
  const reg = regressionAnalysis(series, frequencyDays);
  const anomaly = detectAnomaly(series);
  const lastT = series[series.length - 1].t;

  let ai = null;
  if (model) {
    const sweep = sweepIntervals(model, series, latest.description);
    const rec = recommendInterval(sweep);
    const predicted = predictDrift(
      model,
      series,
      latest.description,
      frequencyDays,
    );
    ai = {
      predictedDriftAtDue: round1(predicted),
      status: statusFromDrift(predicted),
      sweep,
      recommendedIntervalDays: rec.days,
      atLimitEvenShortest: rec.exhausted,
    };
  }

  const status = !ai
    ? reg.status
    : reg.status === "Insufficient data"
      ? ai.status
      : worstStatus(reg.status, ai.status);

  // Next calibration date: never later than the current interval, pulled earlier by the AI or the trend.
  const effectiveDays = ai
    ? Math.min(ai.recommendedIntervalDays, frequencyDays)
    : frequencyDays;
  let next = lastT + effectiveDays * DAY;
  if (reg.projectedWarnDate && reg.projectedWarnDate.getTime() > lastT)
    next = Math.min(next, reg.projectedWarnDate.getTime());

  const item = {
    instrumentKey: key,
    description: latest.description,
    companyName: latest.companyName,
    brand: latest.brand,
    model: latest.model,
    serialNo: latest.serialNo,
    heading: latest.heading,
    simulated: readings.every((r) => r.simulated),
    frequencyDays,
    status,
    n: reg.n,
    lastCalibratedAt: reg.lastCalibratedAt,
    latestDriftPct: reg.latestDriftPct,
    slopePctPerMonth: reg.slopePctPerMonth ?? null,
    r2: reg.r2 ?? null,
    confidence: reg.confidence,
    projectedWarnDate: reg.projectedWarnDate || null,
    projectedLimitDate: reg.projectedLimitDate || null,
    recommendedNextDate: new Date(next),
    fit: reg.fit || null,
    series: series.map((p) => ({ t: p.t, d: round1(p.d) })),
    anomaly,
    ai,
  };
  item.summary = buildSummary(item, frequencyDays);
  return item;
}

function buildAll(readingsByKey, model) {
  const items = Object.entries(readingsByKey).map(([k, rs]) =>
    buildItem(k, rs, model),
  );
  items.sort(
    (a, b) =>
      RANK[b.status] - RANK[a.status] ||
      (b.latestDriftPct ?? 0) - (a.latestDriftPct ?? 0),
  );
  return items;
}

module.exports = { buildItem, buildAll };
