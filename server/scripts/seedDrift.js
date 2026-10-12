// Usage:  node scripts/seedDrift.js [--count=40]     seed simulated instruments
//         node scripts/seedDrift.js --clear           remove simulated rows (and the trained model)
require("dotenv").config();
const { MongoClient } = require("mongodb");
const { generateInstruments } = require("../services/driftSimulator");

(async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.DB_NAME || "ryodb");
  const readings = db.collection("calibrationreadings");

  if (process.argv.includes("--clear")) {
    const r = await readings.deleteMany({ simulated: true });
    await db.collection("driftmodels").deleteOne({ _id: "current" });
    console.log(
      `Removed ${r.deletedCount} simulated readings and the stored model.`,
    );
  } else {
    const arg = process.argv.find((a) => a.startsWith("--count="));
    const count = arg ? parseInt(arg.split("=")[1], 10) : 40;
    await readings.deleteMany({ simulated: true }); // re-seeding replaces the old simulated set
    const docs = generateInstruments(count, new Date());
    await readings.insertMany(docs);
    await db.collection("driftmodels").deleteOne({ _id: "current" }); // force retrain on next request
    console.log(
      `Seeded ${docs.length} simulated calibrations for ${count} instruments.`,
    );
  }
  await client.close();
})();
