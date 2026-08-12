// // Human-readable pipeline stage for a jobnumbers document.
// //
// // NOTE: this mirrors the $switch stage logic inside the
// // /api/stats/analytics aggregation in routes/statsRoutes.js. That
// // version runs inside Mongo as an aggregation pipeline (so it can't just
// // call this function) — if you change the rules here, update the
// // $switch branches there too.
// function stageOf(job) {
//   if (job.rwocTagged) return "Returned Without Calibration";
//   if (job.unitDelivered && job.certificateDelivered) return "Completed";
//   if (!job.tagged) return "Pending Tagging";
//   if (job.tagged && job.concernTagged && !job.ongoingTagged) return "Concern";
//   if (job.tagged && !job.concernTagged && !job.ongoingTagged)
//     return "Incoming Calibration";
//   if (job.ongoingTagged && !job.forTypingTagged) return "On Going Calibration";
//   if (job.forTypingTagged) return "For Typing & Beyond";
//   return "Other";
// }

// module.exports = { stageOf };
// Human-readable pipeline stage for a jobnumbers document.
//
// NOTE: this mirrors the $switch stage logic inside the
// /api/stats/analytics aggregation in routes/statsRoutes.js. That
// version runs inside Mongo as an aggregation pipeline (so it can't just
// call this function) — if you change the rules here, update the
// $switch branches there too.
function stageOf(job) {
  if (job.rwocTagged) return "Returned Without Calibration";
  if (job.unitDelivered && job.certificateDelivered) return "Completed";
  if (!job.tagged) return "Pending Tagging";
  if (job.tagged && job.concernTagged && !job.ongoingTagged) return "Concern";
  if (job.tagged && !job.concernTagged && !job.ongoingTagged)
    return "Incoming Calibration";
  if (job.ongoingTagged && !job.forTypingTagged) return "On Going Calibration";
  if (job.forTypingTagged && !job.forCheckingOICTagged) return "For Typing";
  if (job.forCheckingOICTagged && !job.forCheckingSigTagged)
    return "For Checking (OIC)";
  if (job.forCheckingSigTagged && !job.forPrintFinalTagged)
    return "For Checking (Signatory)";
  if (job.forPrintFinalTagged && !job.forDeliveryTagged)
    return "For Print Final";
  if (job.forDeliveryTagged) return "For Delivery";
  return "Other";
}

module.exports = { stageOf };
