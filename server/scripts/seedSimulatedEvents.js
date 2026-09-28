// scripts/seedSimulatedEvents.js
//
// Generates SIMULATED finished jobs in "stageevents" so the machine learning
// model can be trained and demonstrated before enough real history exists.
// Every row is flagged simulated:true, and the job numbers start with "SIM/",
// so they can be excluded from training (POST /api/predictions/train with
// { "includeSimulated": false }) or deleted at any time.
//
//   node scripts/seedSimulatedEvents.js 150     -> add 150 simulated jobs
//   node scripts/seedSimulatedEvents.js --clear -> remove all simulated rows
//
// IMPORTANT: state clearly in your paper that this data is simulated.

require("dotenv").config();
const { connectDB, getDb, client } = require("../config/db");
const { STAGE_ORDER, addWorkingMinutes } = require("../services/predictor");

// Typical working minutes per stage in the simulation, and the assumed effects.
// These are invented for the demo, not measurements of SSSI.
const BASE_MIN = {
  InstrumentTagging: 20,
  IncomingCalibration: 200,
  OngoingCalibration: 400,
  ForTyping: 180,
  CheckingOIC: 90,
  CheckingSIG: 100,
  PrintFinalCertificate: 40,
  Delivery: 200,
};
const URGENT_FACTOR = 0.6; // urgent jobs move faster
const CONCERN_FACTOR = 1.4; // jobs with a concern take longer
const QUEUE_FACTOR = 0.08; // each job waiting ahead adds 8%

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rnd = (a, b) => a + Math.random() * (b - a);

async function main() {
  await connectDB();
  const db = getDb();
  const events = db.collection("stageevents");

  if (process.argv.includes("--clear")) {
    const r = await events.deleteMany({ simulated: true });
    console.log(`Removed ${r.deletedCount} simulated rows.`);
    return;
  }

  const count = parseInt(process.argv[2], 10) || 150;

  // Use real procedures / types where they exist so the simulation looks like SSSI's data
  let procedures = (
    await db.collection("jobnumbers").distinct("calibrationProcedure")
  ).filter(Boolean);
  let types = (await db.collection("jobnumbers").distinct("type")).filter(
    Boolean,
  );
  if (!procedures.length)
    procedures = ["SSS-CP-020", "SSS-CP-021", "SSE-CP-005"];
  if (!types.length) types = ["mechanical", "electrical"];
  // Give some procedures a slower calibration stage so there is a pattern to learn
  const slowProcedures = new Set(procedures.filter((_, i) => i % 3 === 1));

  const now = Date.now();
  const spanDays = 150; // spread the jobs over the last ~5 months
  const docs = [];

  for (let j = 0; j < count; j++) {
    const procedure = pick(procedures);
    const type = pick(types);
    const urgent = Math.random() < 0.2;
    const concern = Math.random() < 0.15;
    const jobNumber = `SIM/${String(j + 1).padStart(4, "0")}/${String(new Date().getFullYear()).slice(-2)}`;

    let cursor = new Date(now - (1 - j / count) * spanDays * 86400000);
    for (const stage of STAGE_ORDER) {
      const queueLength = Math.floor(rnd(0, 6));
      let minutes = BASE_MIN[stage];
      if (stage === "OngoingCalibration" && slowProcedures.has(procedure))
        minutes *= 1.8;
      if (urgent) minutes *= URGENT_FACTOR;
      if (concern) minutes *= CONCERN_FACTOR;
      minutes *= 1 + queueLength * QUEUE_FACTOR;
      minutes = Math.max(5, Math.round(minutes * rnd(0.8, 1.2)));

      const exitedAt = addWorkingMinutes(cursor, minutes);
      docs.push({
        jobNumber,
        stage,
        enteredAt: cursor,
        exitedAt,
        durationMin: Math.round((exitedAt - cursor) / 60000), // wall-clock, like the real tracker
        movedBy: null,
        queueLength,
        calibrationProcedure: procedure,
        instrumentType: type,
        priority: urgent ? "Urgent" : "Normal",
        onSite: false,
        isSiteJob: false,
        hadConcern: concern,
        simulated: true,
      });
      cursor = exitedAt;
    }
  }

  await events.insertMany(docs);
  console.log(
    `Inserted ${docs.length} simulated stage rows for ${count} simulated jobs.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await client.close();
    } catch {}
  });
