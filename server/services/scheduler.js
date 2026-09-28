// services/scheduler.js
//
// On-site calibration scheduling. Pure logic, no database access.
//
// Model (matches your Schedule page): a technician can be assigned to ONE
// site visit per day. A "visit" is one customer site that needs a
// technician on or after a requested date. The scheduler decides
// which technician goes on which day.
//
// Two methods are provided so they can be compared:
//   greedy    - earliest requested date first, least-loaded free technician
//   annealing - simulated annealing that starts from the greedy result and
//               searches for a cheaper overall schedule
//
// Cost (lower is better):
//   priority-weighted lateness (working days after the requested date)
// + balance weight * workload imbalance across technicians
// + a large penalty for every visit that cannot be placed in the horizon

const DEFAULTS = {
  horizonDays: 30, // working days to plan over
  workDays: [1, 2, 3, 4, 5, 6], // 0 = Sunday ... 6 = Saturday
  urgentWeight: 3, // one late day of an urgent visit counts 3x
  balanceWeight: 0.5,
  unscheduledPenalty: 1000,
  iterations: 30000,
  startTemp: 5,
  cooling: 0.9997,
  window: 12, // how many working days after the request a move may try
};

// ---- small helpers ---------------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Calendar dates are plain "YYYY-MM-DD" strings, handled in UTC so the
// server's timezone never shifts a date.
const parse = (s) => new Date(`${s}T00:00:00Z`);
const fmt = (d) => d.toISOString().slice(0, 10);

function workingCalendar(startDate, count, workDays) {
  const cal = [];
  const d = parse(startDate);
  while (cal.length < count) {
    if (workDays.includes(d.getUTCDay())) cal.push(fmt(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return cal;
}

// ---- problem setup ---------------------------------------------------------
// input = {
//   startDate: "2026-09-28",
//   visits:      [{ id, requestedDate: "YYYY-MM-DD", priority: "Normal"|"Urgent", label? }],
//   technicians: [{ id, name }],
//   busy:        { [technicianId]: ["YYYY-MM-DD", ...] }   // already assigned days
// }
function buildProblem(input, options = {}) {
  const opt = { ...DEFAULTS, ...options };
  const cal = workingCalendar(input.startDate, opt.horizonDays, opt.workDays);
  const D = cal.length;
  const T = input.technicians.length;
  const dayIndex = new Map(cal.map((d, i) => [d, i]));

  const busy = input.technicians.map((t) => {
    const row = new Array(D).fill(false);
    (input.busy?.[t.id] || []).forEach((d) => {
      if (dayIndex.has(d)) row[dayIndex.get(d)] = true;
    });
    return row;
  });
  const baseLoad = busy.map((row) => row.filter(Boolean).length);

  const visits = input.visits.map((v) => {
    // first working day on or after the requested date (clamped to the horizon)
    let req = cal.findIndex((d) => d >= v.requestedDate);
    if (req === -1) req = D - 1;
    return {
      ...v,
      req,
      weight: v.priority === "Urgent" ? opt.urgentWeight : 1,
    };
  });

  return {
    opt,
    cal,
    D,
    T,
    busy,
    baseLoad,
    visits,
    technicians: input.technicians,
  };
}

function costOf(p, pos) {
  let late = 0,
    unscheduled = 0;
  const load = p.baseLoad.slice();
  for (let i = 0; i < pos.length; i++) {
    const s = pos[i];
    if (!s) {
      unscheduled++;
      continue;
    }
    late += p.visits[i].weight * Math.max(0, s.d - p.visits[i].req);
    load[s.t]++;
  }
  const mean = load.reduce((a, b) => a + b, 0) / (p.T || 1);
  const imbalance = load.reduce((a, b) => a + (b - mean) ** 2, 0);
  return (
    late +
    p.opt.balanceWeight * imbalance +
    p.opt.unscheduledPenalty * unscheduled
  );
}

// ---- method 1: greedy ------------------------------------------------------
function greedy(p) {
  const order = p.visits
    .map((v, i) => i)
    .sort(
      (a, b) =>
        p.visits[a].req - p.visits[b].req ||
        p.visits[b].weight - p.visits[a].weight,
    );
  const taken = new Set();
  const load = p.baseLoad.slice();
  const pos = new Array(p.visits.length).fill(null);

  for (const i of order) {
    for (let d = p.visits[i].req; d < p.D && !pos[i]; d++) {
      let best = -1;
      for (let t = 0; t < p.T; t++) {
        if (p.busy[t][d] || taken.has(d * p.T + t)) continue;
        if (best === -1 || load[t] < load[best]) best = t;
      }
      if (best !== -1) {
        pos[i] = { d, t: best };
        taken.add(d * p.T + best);
        load[best]++;
      }
    }
  }
  return pos;
}

// ---- method 2: simulated annealing -----------------------------------------
function anneal(p, start, seed = 1) {
  const rand = mulberry32(seed);
  const n = p.visits.length;
  let pos = start.map((s) => (s ? { ...s } : null));
  const taken = new Set(pos.filter(Boolean).map((s) => s.d * p.T + s.t));
  let cur = costOf(p, pos);
  let best = cur;
  let bestPos = pos.map((s) => (s ? { ...s } : null));
  let temp = p.opt.startTemp;
  if (n === 0) return bestPos;

  for (let it = 0; it < p.opt.iterations; it++, temp *= p.opt.cooling) {
    const i = Math.floor(rand() * n);
    const old = pos[i];

    if (rand() < 0.5 || n < 2) {
      // Move: put visit i on a different free slot
      const hi = Math.min(p.D - 1, p.visits[i].req + p.opt.window);
      const d =
        p.visits[i].req + Math.floor(rand() * (hi - p.visits[i].req + 1));
      const t = Math.floor(rand() * p.T);
      if (p.busy[t][d] || taken.has(d * p.T + t)) continue;
      pos[i] = { d, t };
      const next = costOf(p, pos);
      if (next <= cur || rand() < Math.exp((cur - next) / temp)) {
        if (old) taken.delete(old.d * p.T + old.t);
        taken.add(d * p.T + t);
        cur = next;
      } else pos[i] = old;
    } else {
      // Swap: exchange the slots of two visits
      const j = Math.floor(rand() * n);
      const oj = pos[j];
      if (i === j || !old || !oj) continue;
      if (oj.d < p.visits[i].req || old.d < p.visits[j].req) continue;
      pos[i] = oj;
      pos[j] = old;
      const next = costOf(p, pos);
      if (next <= cur || rand() < Math.exp((cur - next) / temp)) cur = next;
      else {
        pos[i] = old;
        pos[j] = oj;
      }
    }

    if (cur < best) {
      best = cur;
      bestPos = pos.map((s) => (s ? { ...s } : null));
    }
  }
  return bestPos;
}

// ---- results ---------------------------------------------------------------
function summarize(p, pos, method) {
  const load = p.baseLoad.slice();
  let lateDays = 0,
    weightedLate = 0,
    lateVisits = 0,
    unscheduled = 0;
  const assignments = [];
  pos.forEach((s, i) => {
    const v = p.visits[i];
    if (!s) {
      unscheduled++;
      return;
    }
    const late = Math.max(0, s.d - v.req);
    lateDays += late;
    weightedLate += late * v.weight;
    if (late) lateVisits++;
    load[s.t]++;
    assignments.push({
      visitId: v.id,
      date: p.cal[s.d],
      technicianId: p.technicians[s.t].id,
      technicianName: p.technicians[s.t].name,
      requestedDate: v.requestedDate,
      lateWorkingDays: late,
    });
  });
  assignments.sort((a, b) => a.date.localeCompare(b.date));
  return {
    method,
    assignments,
    unscheduledVisitIds: pos
      .map((s, i) => (s ? null : p.visits[i].id))
      .filter((x) => x !== null),
    metrics: {
      totalCost: Math.round(costOf(p, pos) * 100) / 100,
      lateVisits,
      totalLateDays: lateDays,
      weightedLateDays: weightedLate,
      unscheduled,
      maxLoad: Math.max(...load),
      minLoad: Math.min(...load),
      loadSpread: Math.max(...load) - Math.min(...load),
    },
  };
}

function schedule(input, { method = "annealing", seed = 1, ...options } = {}) {
  const p = buildProblem(input, options);
  const g = greedy(p);
  const pos = method === "greedy" ? g : anneal(p, g, seed);
  return summarize(p, pos, method);
}

// Both methods on the same input, for the comparison shown in your paper
function compare(input, options = {}) {
  const p = buildProblem(input, options);
  const g = greedy(p);
  const a = anneal(p, g, options.seed || 1);
  return {
    greedy: summarize(p, g, "greedy"),
    annealing: summarize(p, a, "annealing"),
  };
}

module.exports = { schedule, compare, buildProblem, DEFAULTS };
