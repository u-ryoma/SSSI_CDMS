// scripts/repairStageEvents.js
//
// Finds jobs whose logged stage disagrees with the stage their own flags say
// they are in (for example a Site Calibration job logged at Instrument
// Tagging while it is really at For Typing).
//
//   node scripts/repairStageEvents.js           -> dry run: only lists mismatches
//   node scripts/repairStageEvents.js --apply   -> fixes Site Calibration jobs
//
// Only Site Calibration jobs (they have scId) are fixed automatically: they
// start at their real stage, so the recorded start time is still correct.
// For any other job a mismatch means a stage move was missed, and its start
// time can't be recovered, so those are only reported.

require("dotenv").config();
const { connectDB, getDb, client } = require("../config/db");
const { stageFromFlags } = require("../services/stageTracker");

async function main() {
  await connectDB();
  const db = getDb();
  const apply = process.argv.includes("--apply");

  const open = await db
    .collection("stageevents")
    .find({ exitedAt: null, simulated: { $ne: true } })
    .toArray();
  const jobs = await db
    .collection("jobnumbers")
    .find({ jobNumber: { $in: open.map((e) => e.jobNumber) } })
    .toArray();
  const byNumber = Object.fromEntries(jobs.map((j) => [j.jobNumber, j]));

  let fixed = 0;
  for (const e of open) {
    const job = byNumber[e.jobNumber];
    if (!job) continue;
    const expected = stageFromFlags(job);
    if (expected === e.stage) continue;

    const isSite = Boolean(job.scId);
    console.log(
      `${e.jobNumber}: logged at ${e.stage}, job flags say ${expected}` +
        (isSite ? " (Site Calibration job)" : " (regular job: not auto-fixed)"),
    );
    if (apply && isSite) {
      await db
        .collection("stageevents")
        .updateOne(
          { _id: e._id },
          { $set: { stage: expected, repairedAt: new Date() } },
        );
      fixed++;
    }
  }
  console.log(
    apply
      ? `Fixed ${fixed} job(s).`
      : "Dry run only. Add --apply to fix Site Calibration jobs.",
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
