// const express = require("express");
// const { getDb } = require("../config/db");

// const router = express.Router();

// // ==========================
// // DASHBOARD STATS (System Status panel)
// // ==========================
// //
// // FIX: the list pages (OnGoingCalib.jsx, IncomingCalib.jsx, etc.) default
// // to filtering by the CURRENT YEAR based on the job number's own year
// // segment (e.g. "SSS/0001/26" -> "26"), not by when a job was tagged.
// // The old version of this route counted ongoingTagged/etc. jobs with NO
// // year filter at all, so a job carried over from a prior year (job
// // number ends in a different year) would show up in the System Status
// // count but not in the actual list — hence "On Going Calibration: 1"
// // while the list said "0 of 0 records for 2026".
// //
// // This adds the same jobNumber-year-suffix filter used by the list
// // pages, so the dashboard number always matches what you'd see if you
// // opened that list with its default (current-year) filter.
// router.get("/dashboard", async (req, res) => {
//   try {
//     const db = getDb();
//     const yr = new Date().getFullYear().toString().slice(-2);
//     // Matches jobNumber values like "SSS/0001/26" or "SSE/0012/26" —
//     // anchors on "/" + the 2-digit year at the very end, same segment
//     // the list pages compare against via jobNumber.split("/")[2].
//     const currentYearJobNumber = { $regex: `/${yr}$` };

//     const [
//       incomingCalibration,
//       ongoingCalibration,
//       instrumentTag,
//       siteCalibration,
//       incomingConcern,
//       outgoingConcern,
//       forTyping,
//       forCheckingOIC,
//       forCheckingSig,
//       forPrintFinal,
//     ] = await Promise.all([
//       // Same filter as IncomingCalib.jsx.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         tagged: true,
//         concernTagged: { $ne: true },
//         ongoingTagged: { $ne: true },
//         rwocTagged: { $ne: true },
//       }),
//       // Same filter as OnGoingCalib.jsx.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         ongoingTagged: true,
//         forTypingTagged: { $ne: true },
//         rwocTagged: { $ne: true },
//         concernTagged: { $ne: true },
//       }),
//       // Same filter as InstrumentTag.jsx.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         tagged: { $ne: true },
//       }),
//       // SiteCalibration.jsx lists every record in this collection,
//       // unfiltered — leave as-is (different collection, no jobNumber
//       // year segment to match against).
//       db.collection("sitecalibrations").countDocuments({}),
//       // Same filter as ConcernIncoming.jsx: concern-tagged, not yet
//       // promoted to Outgoing Concern, not closed via RWOC.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         tagged: true,
//         concernTagged: true,
//         outgoingConcernTagged: { $ne: true },
//         rwocTagged: { $ne: true },
//       }),
//       // Same filter as ConcernOutgoing.jsx.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         tagged: true,
//         concernTagged: true,
//         outgoingConcernTagged: true,
//         rwocTagged: { $ne: true },
//       }),
//       // Same filter as ForTyping.jsx.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         forTypingTagged: true,
//         forCheckingOICTagged: { $ne: true },
//       }),
//       // Same filter as ForCheckingOIC.jsx.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         forCheckingOICTagged: true,
//         forCheckingSigTagged: { $ne: true },
//       }),
//       // Same filter as ForCheckingSig.jsx.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         forCheckingSigTagged: true,
//         forPrintFinalTagged: { $ne: true },
//       }),
//       // Same filter as PrintFinal.jsx.
//       db.collection("jobnumbers").countDocuments({
//         jobNumber: currentYearJobNumber,
//         forPrintFinalTagged: true,
//         forDeliveryTagged: { $ne: true },
//       }),
//     ]);

//     res.json({
//       incomingCalibration,
//       ongoingCalibration,
//       instrumentTag,
//       siteCalibration,
//       incomingConcern,
//       outgoingConcern,
//       forTyping,
//       forCheckingOIC,
//       forCheckingSig,
//       forPrintFinal,
//     });
//   } catch (err) {
//     console.error("Dashboard stats error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ==========================
// // DASHBOARD ANALYTICS
// // ==========================
// // GET /api/stats/analytics?view=week|month|year
// router.get("/analytics", async (req, res) => {
//   try {
//     const db = getDb();
//     const view = ["week", "month", "year"].includes(req.query.view) ? req.query.view : "year";

//     const now = new Date();
//     const windowMs = { week: 7, month: 30, year: 365 }[view] * 24 * 60 * 60 * 1000;
//     const periodStart = new Date(now.getTime() - windowMs);
//     const dueSoonEnd = new Date(now.getTime() + windowMs);

//     // trend bucketing: daily for week/month, monthly for year
//     const trendFormat = view === "year" ? "%Y-%m" : "%Y-%m-%d";

//     const result = await db
//       .collection("jobnumbers")
//       .aggregate([
//         {
//           $lookup: {
//             from: "jobreceipts",
//             localField: "jobReceiptID",
//             foreignField: "jrId",
//             as: "receipt",
//           },
//         },
//         { $addFields: { receipt: { $arrayElemAt: ["$receipt", 0] } } },

//         // Join each job to its CURRENT-CYCLE certificate delivery receipt.
//         // "Current cycle" mirrors the frontend fix in RecallSys.jsx /
//         // JobNumber.jsx / RecallJobModal.jsx: if the job has been reused
//         // (job.reusedAt is set), any delivery receipt dated before that
//         // cutoff belongs to a previous, already-closed-out cycle and must
//         // be excluded — otherwise a reused job could inherit a stale due
//         // date from its last calibration instead of its current one.
//         // Among whatever remains, take the most recently dated one.
//         {
//           $lookup: {
//             from: "deliveryreceipts",
//             let: { jobNum: "$jobNumber", reusedAt: "$reusedAt" },
//             pipeline: [
//               {
//                 $match: {
//                   type: "certificate",
//                   $expr: { $in: ["$$jobNum", { $ifNull: ["$items.jobNumber", []] }] },
//                 },
//               },
//               {
//                 $addFields: {
//                   dateParsed: {
//                     $convert: { input: "$date", to: "date", onError: null, onNull: null },
//                   },
//                 },
//               },
//               {
//                 $match: {
//                   $expr: {
//                     $or: [
//                       { $eq: ["$$reusedAt", null] },
//                       { $eq: ["$dateParsed", null] },
//                       {
//                         $gte: [
//                           "$dateParsed",
//                           { $convert: { input: "$$reusedAt", to: "date", onError: null, onNull: null } },
//                         ],
//                       },
//                     ],
//                   },
//                 },
//               },
//               { $sort: { dateParsed: -1 } },
//               { $limit: 1 },
//               { $project: { _id: 0, dateParsed: 1 } },
//             ],
//             as: "certDR",
//           },
//         },
//         { $addFields: { certDR: { $arrayElemAt: ["$certDR", 0] } } },

//         {
//           $addFields: {
//             createdAtParsed: {
//               $convert: { input: "$createdAt", to: "date", onError: null, onNull: null },
//             },
//             certDateParsed: { $ifNull: ["$certDR.dateParsed", null] },
//             isFinished: {
//               $and: [{ $eq: ["$unitDelivered", true] }, { $eq: ["$certificateDelivered", true] }],
//             },
//             // Calibration frequency -> months, same mapping as
//             // RecallSys.jsx's FREQUENCY_MONTHS.
//             frequencyMonths: {
//               $switch: {
//                 branches: [
//                   { case: { $eq: ["$frequency", "6 Months"] }, then: 6 },
//                   { case: { $eq: ["$frequency", "1 Year"] }, then: 12 },
//                   { case: { $eq: ["$frequency", "2 Years"] }, then: 24 },
//                   { case: { $eq: ["$frequency", "3 Years"] }, then: 36 },
//                 ],
//                 default: null,
//               },
//             },
//           },
//         },
//         {
//           $addFields: {
//             // Due date = certificate delivery date + frequency, same
//             // formula as RecallSys.jsx's getDueDate(). Requires Mongo 5.0+
//             // for $dateAdd.
//             dueDateParsed: {
//               $cond: [
//                 { $and: [{ $ne: ["$certDateParsed", null] }, { $ne: ["$frequencyMonths", null] }] },
//                 { $dateAdd: { startDate: "$certDateParsed", unit: "month", amount: "$frequencyMonths" } },
//                 null,
//               ],
//             },
//           },
//         },

//         {
//           $addFields: {
//             // NOTE: mirrors utils/jobStage.js's stageOf() — that plain-JS
//             // version is used where a job doc is already in hand
//             // (customerRoutes.js). Update both together if the rules change.
//             stage: {
//               $switch: {
//                 branches: [
//                   { case: { $eq: ["$rwocTagged", true] }, then: "Returned Without Calibration" },
//                   { case: { $eq: ["$isFinished", true] }, then: "Completed" },
//                   { case: { $ne: ["$tagged", true] }, then: "Pending Tagging" },
//                   {
//                     case: {
//                       $and: [
//                         { $eq: ["$tagged", true] },
//                         { $eq: ["$concernTagged", true] },
//                         { $ne: ["$ongoingTagged", true] },
//                       ],
//                     },
//                     then: "Concern",
//                   },
//                   {
//                     case: {
//                       $and: [
//                         { $eq: ["$tagged", true] },
//                         { $ne: ["$concernTagged", true] },
//                         { $ne: ["$ongoingTagged", true] },
//                       ],
//                     },
//                     then: "Incoming Calibration",
//                   },
//                   {
//                     case: {
//                       $and: [{ $eq: ["$ongoingTagged", true] }, { $ne: ["$forTypingTagged", true] }],
//                     },
//                     then: "On Going Calibration",
//                   },
//                   { case: { $eq: ["$forTypingTagged", true] }, then: "For Typing & Beyond" },
//                 ],
//                 default: "Other",
//               },
//             },
//           },
//         },
//         {
//           $facet: {
//             totalReceived: [
//               { $match: { createdAtParsed: { $gte: periodStart } } },
//               { $count: "count" },
//             ],
//             completed: [
//               { $match: { isFinished: true, certDateParsed: { $ne: null, $gte: periodStart } } },
//               { $count: "count" },
//             ],
//             overdue: [
//               { $match: { isFinished: true, dueDateParsed: { $ne: null, $lt: now } } },
//               { $count: "count" },
//             ],
//             dueSoon: [
//               {
//                 $match: {
//                   isFinished: true,
//                   dueDateParsed: { $ne: null, $gte: now, $lte: dueSoonEnd },
//                 },
//               },
//               { $count: "count" },
//             ],
//             pipeline: [
//               { $group: { _id: "$stage", count: { $sum: 1 } } },
//               { $project: { _id: 0, stage: "$_id", count: 1 } },
//             ],
//             typeDistribution: [
//               { $match: { createdAtParsed: { $gte: periodStart } } },
//               { $group: { _id: { $ifNull: ["$type", "mechanical"] }, count: { $sum: 1 } } },
//               { $project: { _id: 0, type: "$_id", count: 1 } },
//             ],
//             topCompanies: [
//               { $match: { createdAtParsed: { $gte: periodStart } } },
//               { $group: { _id: { $ifNull: ["$receipt.companyName", "Unknown"] }, count: { $sum: 1 } } },
//               { $sort: { count: -1 } },
//               { $limit: 5 },
//               { $project: { _id: 0, company: "$_id", count: 1 } },
//             ],
//             trend: [
//               { $match: { createdAtParsed: { $gte: periodStart } } },
//               {
//                 $group: {
//                   _id: { $dateToString: { format: trendFormat, date: "$createdAtParsed" } },
//                   count: { $sum: 1 },
//                 },
//               },
//               { $sort: { _id: 1 } },
//               { $project: { _id: 0, label: "$_id", count: 1 } },
//             ],
//             recentJobs: [
//               { $sort: { createdAtParsed: -1 } },
//               { $limit: 5 },
//               {
//                 $project: {
//                   _id: 0,
//                   jobNumber: 1,
//                   stage: 1,
//                   companyName: { $ifNull: ["$receipt.companyName", "\u2014"] },
//                   createdAt: 1,
//                 },
//               },
//             ],
//           },
//         },
//       ])
//       .toArray();

//     const facets = result[0] || {};
//     const getCount = (arr) => (arr && arr[0]?.count) || 0;

//     res.json({
//       view,
//       totalReceived: getCount(facets.totalReceived),
//       completed: getCount(facets.completed),
//       overdue: getCount(facets.overdue),
//       dueSoon: getCount(facets.dueSoon),
//       pipeline: facets.pipeline || [],
//       typeDistribution: facets.typeDistribution || [],
//       topCompanies: facets.topCompanies || [],
//       trend: facets.trend || [],
//       recentJobs: facets.recentJobs || [],
//     });
//   } catch (err) {
//     console.error("Dashboard analytics error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const { getDb } = require("../config/db");

const router = express.Router();

// ==========================
// DASHBOARD STATS (System Status panel)
// ==========================
//
// FIX: the list pages (OnGoingCalib.jsx, IncomingCalib.jsx, etc.) default
// to filtering by the CURRENT YEAR based on the job number's own year
// segment (e.g. "SSS/0001/26" -> "26"), not by when a job was tagged.
// The old version of this route counted ongoingTagged/etc. jobs with NO
// year filter at all, so a job carried over from a prior year (job
// number ends in a different year) would show up in the System Status
// count but not in the actual list — hence "On Going Calibration: 1"
// while the list said "0 of 0 records for 2026".
//
// This adds the same jobNumber-year-suffix filter used by the list
// pages, so the dashboard number always matches what you'd see if you
// opened that list with its default (current-year) filter.
router.get("/dashboard", async (req, res) => {
  try {
    const db = getDb();
    const yr = new Date().getFullYear().toString().slice(-2);
    // Matches jobNumber values like "SSS/0001/26" or "SSE/0012/26" —
    // anchors on "/" + the 2-digit year at the very end, same segment
    // the list pages compare against via jobNumber.split("/")[2].
    const currentYearJobNumber = { $regex: `/${yr}$` };

    const [
      incomingCalibration,
      ongoingCalibration,
      instrumentTag,
      siteCalibration,
      incomingConcern,
      outgoingConcern,
      forTyping,
      forCheckingOIC,
      forCheckingSig,
      forPrintFinal,
    ] = await Promise.all([
      // Same filter as IncomingCalib.jsx.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        tagged: true,
        concernTagged: { $ne: true },
        ongoingTagged: { $ne: true },
        rwocTagged: { $ne: true },
      }),
      // Same filter as OnGoingCalib.jsx.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        ongoingTagged: true,
        forTypingTagged: { $ne: true },
        rwocTagged: { $ne: true },
        concernTagged: { $ne: true },
      }),
      // Same filter as InstrumentTag.jsx.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        tagged: { $ne: true },
      }),
      // SiteCalibration.jsx lists every record in this collection,
      // unfiltered — leave as-is (different collection, no jobNumber
      // year segment to match against).
      db.collection("sitecalibrations").countDocuments({}),
      // Same filter as ConcernIncoming.jsx: concern-tagged, not yet
      // promoted to Outgoing Concern, not closed via RWOC.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        tagged: true,
        concernTagged: true,
        outgoingConcernTagged: { $ne: true },
        rwocTagged: { $ne: true },
      }),
      // Same filter as ConcernOutgoing.jsx.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        tagged: true,
        concernTagged: true,
        outgoingConcernTagged: true,
        rwocTagged: { $ne: true },
      }),
      // Same filter as ForTyping.jsx.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        forTypingTagged: true,
        forCheckingOICTagged: { $ne: true },
      }),
      // Same filter as ForCheckingOIC.jsx.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        forCheckingOICTagged: true,
        forCheckingSigTagged: { $ne: true },
      }),
      // Same filter as ForCheckingSig.jsx.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        forCheckingSigTagged: true,
        forPrintFinalTagged: { $ne: true },
      }),
      // Same filter as PrintFinal.jsx.
      db.collection("jobnumbers").countDocuments({
        jobNumber: currentYearJobNumber,
        forPrintFinalTagged: true,
        forDeliveryTagged: { $ne: true },
      }),
    ]);

    res.json({
      incomingCalibration,
      ongoingCalibration,
      instrumentTag,
      siteCalibration,
      incomingConcern,
      outgoingConcern,
      forTyping,
      forCheckingOIC,
      forCheckingSig,
      forPrintFinal,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// DASHBOARD ANALYTICS
// ==========================
// GET /api/stats/analytics?view=week|month|year
router.get("/analytics", async (req, res) => {
  try {
    const db = getDb();
    const view = ["week", "month", "year"].includes(req.query.view)
      ? req.query.view
      : "year";

    const now = new Date();
    const windowMs =
      { week: 7, month: 30, year: 365 }[view] * 24 * 60 * 60 * 1000;
    const periodStart = new Date(now.getTime() - windowMs);
    const dueSoonEnd = new Date(now.getTime() + windowMs);

    // trend bucketing: daily for week/month, monthly for year
    const trendFormat = view === "year" ? "%Y-%m" : "%Y-%m-%d";

    const result = await db
      .collection("jobnumbers")
      .aggregate([
        {
          $lookup: {
            from: "jobreceipts",
            localField: "jobReceiptID",
            foreignField: "jrId",
            as: "receipt",
          },
        },
        { $addFields: { receipt: { $arrayElemAt: ["$receipt", 0] } } },

        // Join each job to its CURRENT-CYCLE certificate delivery receipt.
        // "Current cycle" mirrors the frontend fix in RecallSys.jsx /
        // JobNumber.jsx / RecallJobModal.jsx: if the job has been reused
        // (job.reusedAt is set), any delivery receipt dated before that
        // cutoff belongs to a previous, already-closed-out cycle and must
        // be excluded — otherwise a reused job could inherit a stale due
        // date from its last calibration instead of its current one.
        // Among whatever remains, take the most recently dated one.
        {
          $lookup: {
            from: "deliveryreceipts",
            let: { jobNum: "$jobNumber", reusedAt: "$reusedAt" },
            pipeline: [
              {
                $match: {
                  type: "certificate",
                  $expr: {
                    $in: ["$$jobNum", { $ifNull: ["$items.jobNumber", []] }],
                  },
                },
              },
              {
                $addFields: {
                  dateParsed: {
                    $convert: {
                      input: "$date",
                      to: "date",
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$$reusedAt", null] },
                      { $eq: ["$dateParsed", null] },
                      {
                        $gte: [
                          "$dateParsed",
                          {
                            $convert: {
                              input: "$$reusedAt",
                              to: "date",
                              onError: null,
                              onNull: null,
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              },
              { $sort: { dateParsed: -1 } },
              { $limit: 1 },
              { $project: { _id: 0, dateParsed: 1 } },
            ],
            as: "certDR",
          },
        },
        { $addFields: { certDR: { $arrayElemAt: ["$certDR", 0] } } },

        {
          $addFields: {
            createdAtParsed: {
              $convert: {
                input: "$createdAt",
                to: "date",
                onError: null,
                onNull: null,
              },
            },
            certDateParsed: { $ifNull: ["$certDR.dateParsed", null] },
            isFinished: {
              $and: [
                { $eq: ["$unitDelivered", true] },
                { $eq: ["$certificateDelivered", true] },
              ],
            },
            // Calibration frequency -> months, same mapping as
            // RecallSys.jsx's FREQUENCY_MONTHS.
            frequencyMonths: {
              $switch: {
                branches: [
                  { case: { $eq: ["$frequency", "6 Months"] }, then: 6 },
                  { case: { $eq: ["$frequency", "1 Year"] }, then: 12 },
                  { case: { $eq: ["$frequency", "2 Years"] }, then: 24 },
                  { case: { $eq: ["$frequency", "3 Years"] }, then: 36 },
                ],
                default: null,
              },
            },
          },
        },
        {
          $addFields: {
            // Due date = certificate delivery date + frequency, same
            // formula as RecallSys.jsx's getDueDate(). Requires Mongo 5.0+
            // for $dateAdd.
            dueDateParsed: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$certDateParsed", null] },
                    { $ne: ["$frequencyMonths", null] },
                  ],
                },
                {
                  $dateAdd: {
                    startDate: "$certDateParsed",
                    unit: "month",
                    amount: "$frequencyMonths",
                  },
                },
                null,
              ],
            },
          },
        },

        {
          $addFields: {
            // NOTE: mirrors utils/jobStage.js's stageOf() — that plain-JS
            // version is used where a job doc is already in hand
            // (customerRoutes.js). Update both together if the rules change.
            stage: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$rwocTagged", true] },
                    then: "Returned Without Calibration",
                  },
                  { case: { $eq: ["$isFinished", true] }, then: "Completed" },
                  { case: { $ne: ["$tagged", true] }, then: "Pending Tagging" },
                  {
                    case: {
                      $and: [
                        { $eq: ["$tagged", true] },
                        { $eq: ["$concernTagged", true] },
                        { $ne: ["$ongoingTagged", true] },
                      ],
                    },
                    then: "Concern",
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$tagged", true] },
                        { $ne: ["$concernTagged", true] },
                        { $ne: ["$ongoingTagged", true] },
                      ],
                    },
                    then: "Incoming Calibration",
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$ongoingTagged", true] },
                        { $ne: ["$forTypingTagged", true] },
                      ],
                    },
                    then: "On Going Calibration",
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$forTypingTagged", true] },
                        { $ne: ["$forCheckingOICTagged", true] },
                      ],
                    },
                    then: "For Typing",
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$forCheckingOICTagged", true] },
                        { $ne: ["$forCheckingSigTagged", true] },
                      ],
                    },
                    then: "For Checking (OIC)",
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$forCheckingSigTagged", true] },
                        { $ne: ["$forPrintFinalTagged", true] },
                      ],
                    },
                    then: "For Checking (Signatory)",
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$forPrintFinalTagged", true] },
                        { $ne: ["$forDeliveryTagged", true] },
                      ],
                    },
                    then: "For Print Final",
                  },
                  {
                    case: { $eq: ["$forDeliveryTagged", true] },
                    then: "For Delivery",
                  },
                ],
                default: "Other",
              },
            },
          },
        },
        {
          $facet: {
            totalReceived: [
              { $match: { createdAtParsed: { $gte: periodStart } } },
              { $count: "count" },
            ],
            completed: [
              {
                $match: {
                  isFinished: true,
                  certDateParsed: { $ne: null, $gte: periodStart },
                },
              },
              { $count: "count" },
            ],
            overdue: [
              {
                $match: {
                  isFinished: true,
                  dueDateParsed: { $ne: null, $lt: now },
                },
              },
              { $count: "count" },
            ],
            dueSoon: [
              {
                $match: {
                  isFinished: true,
                  dueDateParsed: { $ne: null, $gte: now, $lte: dueSoonEnd },
                },
              },
              { $count: "count" },
            ],
            pipeline: [
              { $group: { _id: "$stage", count: { $sum: 1 } } },
              { $project: { _id: 0, stage: "$_id", count: 1 } },
            ],
            typeDistribution: [
              { $match: { createdAtParsed: { $gte: periodStart } } },
              {
                $group: {
                  _id: { $ifNull: ["$type", "mechanical"] },
                  count: { $sum: 1 },
                },
              },
              { $project: { _id: 0, type: "$_id", count: 1 } },
            ],
            // FIX: site-calibration-originated jobs (AddSiteCalibrationModal.jsx)
            // are never linked to a jobreceipts doc — there's no walk-in
            // receipt for an on-site job, so jobReceiptID is never set and
            // the $lookup to jobreceipts above always comes back empty for
            // them. Those jobs DO carry companyName directly on the
            // jobnumbers document (stamped in handleUpdate), so prefer that
            // first and only fall back to the joined receipt's company name,
            // then "Unknown".
            topCompanies: [
              { $match: { createdAtParsed: { $gte: periodStart } } },
              {
                $group: {
                  _id: {
                    $ifNull: [
                      "$companyName",
                      { $ifNull: ["$receipt.companyName", "Unknown"] },
                    ],
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              { $project: { _id: 0, company: "$_id", count: 1 } },
            ],
            trend: [
              { $match: { createdAtParsed: { $gte: periodStart } } },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: trendFormat,
                      date: "$createdAtParsed",
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
              { $project: { _id: 0, label: "$_id", count: 1 } },
            ],
            recentJobs: [
              { $sort: { createdAtParsed: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  jobNumber: 1,
                  stage: 1,
                  // Same fallback as topCompanies above.
                  companyName: {
                    $ifNull: [
                      "$companyName",
                      { $ifNull: ["$receipt.companyName", "\u2014"] },
                    ],
                  },
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();

    const facets = result[0] || {};
    const getCount = (arr) => (arr && arr[0]?.count) || 0;

    res.json({
      view,
      totalReceived: getCount(facets.totalReceived),
      completed: getCount(facets.completed),
      overdue: getCount(facets.overdue),
      dueSoon: getCount(facets.dueSoon),
      pipeline: facets.pipeline || [],
      typeDistribution: facets.typeDistribution || [],
      topCompanies: facets.topCompanies || [],
      trend: facets.trend || [],
      recentJobs: facets.recentJobs || [],
    });
  } catch (err) {
    console.error("Dashboard analytics error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
