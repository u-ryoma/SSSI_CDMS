// Atomic auto-increment counters backing every human-readable ID in the
// app (customerID, jrId, quotationId, deliveryReceiptId, standardID,
// jobNumber, contactID). Centralized here since every route previously
// re-implemented the same findOneAndUpdate + upsert pattern.
async function getNextSequence(db, counterId) {
  const counter = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  return counter.seq;
}

function currentYearSuffix() {
  return new Date().getFullYear().toString().slice(-2);
}

function pad4(seq) {
  return String(seq).padStart(4, "0");
}

module.exports = { getNextSequence, currentYearSuffix, pad4 };
