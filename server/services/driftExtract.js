// Pulls drift readings out of finished jobs (jobnumbers) into the calibrationreadings collection.
const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/[+,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const norm = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function parseFrequencyDays(f) {
  const m = /(\d+)\s*(year|month|week|day)/i.exec(f || "");
  if (!m) return 365;
  const n = +m[1],
    u = m[2].toLowerCase();
  return n * (u === "year" ? 365 : u === "month" ? 30 : u === "week" ? 7 : 1);
}

function makeInstrumentKey(job, heading) {
  return [job.companyName, job.brand, job.model, job.serialNo, heading]
    .map(norm)
    .join("|");
}

function extractReading(job) {
  const cert = job.calibrationData?.certificate;
  const rows = cert?.calc?.rows;
  if (!rows?.length || !job.finalCertPrintedAt) return null;

  const points = rows
    .filter((r) => r.complete)
    .map((r) => {
      const corr = num(r.correctionFmt);
      const tol = r.budget?.expanded ?? num(r.uncertaintyFmt);
      return corr == null || !(tol > 0)
        ? null
        : { label: r.appliedFmt, asFoundError: -corr, tolerance: tol };
    })
    .filter(Boolean);
  if (!points.length) return null;

  const calibratedAt = new Date(job.dateCal || cert.dateCalibrated);
  if (isNaN(calibratedAt)) return null;

  const heading = cert.inputs?.heading || "";
  return {
    instrumentKey: makeInstrumentKey(job, heading),
    description: job.description || "",
    companyName: job.companyName,
    brand: job.brand,
    model: job.model,
    serialNo: job.serialNo,
    heading,
    jobNumber: job.jobNumber,
    calibratedAt,
    frequencyDays: parseFrequencyDays(job.frequency),
    points,
    simulated: false,
  };
}

async function syncReadings(db) {
  const jobs = await db
    .collection("jobnumbers")
    .find({
      finalCertPrintedAt: { $exists: true },
      "calibrationData.certificate.calc.rows.0": { $exists: true },
    })
    .toArray();

  const ops = jobs
    .map(extractReading)
    .filter(Boolean)
    .map((r) => ({
      updateOne: {
        filter: {
          jobNumber: r.jobNumber,
          heading: r.heading,
          simulated: { $ne: true },
        },
        update: { $set: r },
        upsert: true,
      },
    }));
  if (ops.length) await db.collection("calibrationreadings").bulkWrite(ops);
}

module.exports = {
  extractReading,
  syncReadings,
  makeInstrumentKey,
  norm,
  parseFrequencyDays,
};
