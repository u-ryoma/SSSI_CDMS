// // services/scheduleService.js
// //
// // Database side of the auto-scheduler: reads pending site calibration jobs,
// // technicians and existing assignments, runs services/scheduler.js, and
// // (after staff confirm) writes the resulting scheduleassignments.

// const { ObjectId } = require("mongodb");
// const { getDb } = require("../config/db");
// const { compare } = require("./scheduler");

// // Today's calendar date in the Philippines (UTC+8), as "YYYY-MM-DD"
// const manilaToday = () =>
//   new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);

// const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// // Proposes assignments for site calibration jobs that are dated today or
// // later and do not have a schedule assignment linked to them yet.
// // Nothing is saved here; staff review the proposal first.
// async function buildSuggestion({ horizonDays = 30 } = {}) {
//   const db = getDb();
//   const startDate = manilaToday();

//   const technicians = (
//     await db
//       .collection("users")
//       .find({ role: "technician" }, { projection: { name: 1, username: 1 } })
//       .toArray()
//   ).map((u) => ({ id: String(u._id), name: u.name || u.username }));

//   // Existing assignments block those technician-days, and any site
//   // calibration already linked to one is not "pending".
//   const existing = await db
//     .collection("scheduleassignments")
//     .find({ date: { $gte: startDate } })
//     .toArray();
//   const busy = {};
//   const linked = new Set();
//   existing.forEach((a) => {
//     (busy[a.technicianId] ||= []).push(a.date);
//     if (a.scId) linked.add(a.scId);
//     (a.scIds || []).forEach((id) => linked.add(id));
//   });

//   const pending = (
//     await db
//       .collection("sitecalibrations")
//       .find({ date: { $gte: startDate } })
//       .toArray()
//   ).filter((sc) => !linked.has(sc.scId));

//   // One technician-day = one site, so site calibration jobs for the same
//   // customer on the same date share a single visit.
//   const groups = new Map();
//   for (const sc of pending) {
//     const key = `${sc.customerId || sc.companyName}|${sc.date}`;
//     if (!groups.has(key)) {
//       groups.set(key, {
//         id: key,
//         requestedDate: sc.date,
//         priority: "Normal",
//         scIds: [],
//         companyName: sc.companyName || "",
//         address: sc.companyAddress || "",
//         currentTechnicians: new Set(),
//       });
//     }
//     const g = groups.get(key);
//     g.scIds.push(sc.scId);
//     if (sc.priority === "Urgent") g.priority = "Urgent"; // only if a priority field exists
//     if (sc.technicians) g.currentTechnicians.add(sc.technicians);
//   }
//   const visits = [...groups.values()];

//   const base = {
//     startDate,
//     technicianCount: technicians.length,
//     pendingVisits: visits.length,
//   };
//   if (technicians.length === 0)
//     return { ...base, assignments: [], note: "No technician accounts found." };
//   if (visits.length === 0)
//     return {
//       ...base,
//       assignments: [],
//       note: "No site calibration jobs need scheduling.",
//     };

//   const result = compare(
//     { startDate, visits, technicians, busy },
//     { horizonDays },
//   );
//   const info = Object.fromEntries(visits.map((v) => [v.id, v]));

//   return {
//     ...base,
//     assignments: result.annealing.assignments.map((a) => {
//       const v = info[a.visitId];
//       return {
//         scIds: v.scIds,
//         companyName: v.companyName,
//         location: [v.companyName, v.address].filter(Boolean).join(", "),
//         currentTechnicians: [...v.currentTechnicians],
//         requestedDate: a.requestedDate,
//         date: a.date,
//         technicianId: a.technicianId,
//         technicianName: a.technicianName,
//         lateWorkingDays: a.lateWorkingDays,
//       };
//     }),
//     unscheduled: result.annealing.unscheduledVisitIds.map((id) => ({
//       scIds: info[id].scIds,
//       companyName: info[id].companyName,
//     })),
//     optimized: result.annealing.metrics,
//     baseline: result.greedy.metrics,
//   };
// }

// // Saves confirmed assignments. Re-checks each one, since the calendar may
// // have changed between the suggestion and the confirmation.
// async function confirmAssignments(items, createdBy = "") {
//   const db = getDb();
//   const created = [];
//   const skipped = [];

//   for (const it of Array.isArray(items) ? items : []) {
//     const scIds = Array.isArray(it.scIds) ? it.scIds : [];
//     const skip = (reason) =>
//       skipped.push({
//         scIds,
//         date: it.date,
//         technicianName: it.technicianName,
//         reason,
//       });

//     if (
//       !DATE_RE.test(it.date || "") ||
//       !scIds.length ||
//       !it.location ||
//       !ObjectId.isValid(it.technicianId)
//     ) {
//       skip("Invalid assignment data");
//       continue;
//     }
//     const tech = await db
//       .collection("users")
//       .findOne({ _id: new ObjectId(it.technicianId), role: "technician" });
//     if (!tech) {
//       skip("Technician not found");
//       continue;
//     }
//     if (
//       await db
//         .collection("scheduleassignments")
//         .findOne({ date: it.date, technicianId: it.technicianId })
//     ) {
//       skip("Technician is already assigned on this date");
//       continue;
//     }
//     if (
//       await db
//         .collection("scheduleassignments")
//         .findOne({ scIds: { $in: scIds } })
//     ) {
//       skip("Already scheduled");
//       continue;
//     }

//     const doc = {
//       date: it.date,
//       technicianId: it.technicianId,
//       technicianName: tech.name,
//       location: String(it.location).trim(),
//       jobNumber: null,
//       notes: `Auto-scheduled: ${scIds.join(", ")}`,
//       createdBy,
//       createdAt: new Date().toISOString(),
//       scId: scIds[0],
//       scIds,
//       autoScheduled: true,
//     };
//     const r = await db.collection("scheduleassignments").insertOne(doc);
//     created.push({ ...doc, _id: r.insertedId });
//   }
//   return { created, skipped };
// }

// module.exports = { buildSuggestion, confirmAssignments };
// services/scheduleService.js
//
// Database side of the auto-scheduler: reads pending site calibration jobs,
// technicians and existing assignments, runs services/scheduler.js, and
// (after staff confirm) writes the resulting scheduleassignments.

const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const { compare } = require("./scheduler");

// Today's calendar date in the Philippines (UTC+8), as "YYYY-MM-DD"
const manilaToday = () =>
  new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// When staff confirm an auto-schedule, also update the Site Calibration
// records so they agree with the calendar.
//   SYNC_SC_TECHNICIAN: set the record's technicians / technicianIds to the
//                       scheduled technician (the form field becomes "who goes")
//   SYNC_SC_DATE:       also move the record's date if the visit was pushed to
//                       a later day. Leave false if that date is meant to stay
//                       as the customer's requested date.
const SYNC_SC_TECHNICIAN = true;
const SYNC_SC_DATE = false;

// Proposes assignments for site calibration jobs that are dated today or
// later and do not have a schedule assignment linked to them yet.
// Nothing is saved here; staff review the proposal first.
async function buildSuggestion({ horizonDays = 30 } = {}) {
  const db = getDb();
  const startDate = manilaToday();

  const technicians = (
    await db
      .collection("users")
      .find({ role: "technician" }, { projection: { name: 1, username: 1 } })
      .toArray()
  ).map((u) => ({ id: String(u._id), name: u.name || u.username }));

  // Existing assignments block those technician-days, and any site
  // calibration already linked to one is not "pending".
  const existing = await db
    .collection("scheduleassignments")
    .find({ date: { $gte: startDate } })
    .toArray();
  const busy = {};
  const linked = new Set();
  existing.forEach((a) => {
    (busy[a.technicianId] ||= []).push(a.date);
    if (a.scId) linked.add(a.scId);
    (a.scIds || []).forEach((id) => linked.add(id));
  });

  const pending = (
    await db
      .collection("sitecalibrations")
      .find({ date: { $gte: startDate } })
      .toArray()
  ).filter((sc) => !linked.has(sc.scId));

  // One technician-day = one site, so site calibration jobs for the same
  // customer on the same date share a single visit.
  const groups = new Map();
  for (const sc of pending) {
    const key = `${sc.customerId || sc.companyName}|${sc.date}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        requestedDate: sc.date,
        priority: "Normal",
        scIds: [],
        companyName: sc.companyName || "",
        address: sc.companyAddress || "",
        currentTechnicians: new Set(),
      });
    }
    const g = groups.get(key);
    g.scIds.push(sc.scId);
    if (sc.priority === "Urgent") g.priority = "Urgent"; // only if a priority field exists
    if (sc.technicians) g.currentTechnicians.add(sc.technicians);
  }
  const visits = [...groups.values()];

  const base = {
    startDate,
    technicianCount: technicians.length,
    pendingVisits: visits.length,
    syncsTechnician: SYNC_SC_TECHNICIAN,
    syncsDate: SYNC_SC_DATE,
  };
  if (technicians.length === 0)
    return { ...base, assignments: [], note: "No technician accounts found." };
  if (visits.length === 0)
    return {
      ...base,
      assignments: [],
      note: "No site calibration jobs need scheduling.",
    };

  const result = compare(
    { startDate, visits, technicians, busy },
    { horizonDays },
  );
  const info = Object.fromEntries(visits.map((v) => [v.id, v]));

  return {
    ...base,
    assignments: result.annealing.assignments.map((a) => {
      const v = info[a.visitId];
      return {
        scIds: v.scIds,
        companyName: v.companyName,
        location: [v.companyName, v.address].filter(Boolean).join(", "),
        currentTechnicians: [...v.currentTechnicians],
        requestedDate: a.requestedDate,
        date: a.date,
        technicianId: a.technicianId,
        technicianName: a.technicianName,
        lateWorkingDays: a.lateWorkingDays,
      };
    }),
    unscheduled: result.annealing.unscheduledVisitIds.map((id) => ({
      scIds: info[id].scIds,
      companyName: info[id].companyName,
    })),
    optimized: result.annealing.metrics,
    baseline: result.greedy.metrics,
  };
}

// Saves confirmed assignments. Re-checks each one, since the calendar may
// have changed between the suggestion and the confirmation.
async function confirmAssignments(items, createdBy = "") {
  const db = getDb();
  const created = [];
  const skipped = [];

  for (const it of Array.isArray(items) ? items : []) {
    const scIds = Array.isArray(it.scIds) ? it.scIds : [];
    const skip = (reason) =>
      skipped.push({
        scIds,
        date: it.date,
        technicianName: it.technicianName,
        reason,
      });

    if (
      !DATE_RE.test(it.date || "") ||
      !scIds.length ||
      !it.location ||
      !ObjectId.isValid(it.technicianId)
    ) {
      skip("Invalid assignment data");
      continue;
    }
    const tech = await db
      .collection("users")
      .findOne({ _id: new ObjectId(it.technicianId), role: "technician" });
    if (!tech) {
      skip("Technician not found");
      continue;
    }
    if (
      await db
        .collection("scheduleassignments")
        .findOne({ date: it.date, technicianId: it.technicianId })
    ) {
      skip("Technician is already assigned on this date");
      continue;
    }
    if (
      await db
        .collection("scheduleassignments")
        .findOne({ scIds: { $in: scIds } })
    ) {
      skip("Already scheduled");
      continue;
    }

    const doc = {
      date: it.date,
      technicianId: it.technicianId,
      technicianName: tech.name,
      location: String(it.location).trim(),
      jobNumber: null,
      notes: `Auto-scheduled: ${scIds.join(", ")}`,
      createdBy,
      createdAt: new Date().toISOString(),
      scId: scIds[0],
      scIds,
      autoScheduled: true,
    };
    const r = await db.collection("scheduleassignments").insertOne(doc);
    created.push({ ...doc, _id: r.insertedId });

    // Keep the Site Calibration records in step with the calendar. The
    // assignment is already saved, so a failure here is logged, not thrown.
    if (SYNC_SC_TECHNICIAN || SYNC_SC_DATE) {
      try {
        const set = { updatedAt: new Date() };
        if (SYNC_SC_TECHNICIAN) {
          set.technicians = tech.username || tech.name; // e.g. "ARB"
          set.technicianIds = [String(tech._id)];
        }
        if (SYNC_SC_DATE) set.date = it.date;
        await db
          .collection("sitecalibrations")
          .updateMany({ scId: { $in: scIds } }, { $set: set });
      } catch (err) {
        console.error("Could not sync site calibration record:", err.message);
      }
    }
  }
  return { created, skipped };
}

module.exports = { buildSuggestion, confirmAssignments };
