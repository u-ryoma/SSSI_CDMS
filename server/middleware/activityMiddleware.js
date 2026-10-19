const jwt = require("jsonwebtoken");
const { logActivity } = require("../services/activityLogger");

// Requests that should never be logged
const SKIP = [
  /^\/api\/logs/, // the logs route itself (login/logout are recorded there)
  /^\/api\/presence/,
  /heartbeat/i,
  /login/i,
  /logout/i,
  /^\/api\/jobnumbers\/reserve/, // only reserves a number; the job is logged when it's saved
];

// Friendly module names by first path segment after /api/
const MODULES = {
  accounts: "Accounts",
  customers: "Customers",
  contacts: "Customers",
  jobreceipts: "Job Receipts",
  quotations: "Quotations",
  instruments: "Instruments",
  jobnumbers: "Job Numbers",
  deliveryreceipts: "Delivery Receipts",
  standards: "Asset Monitoring",
  technicians: "Technicians",
  schedule: "Schedule",
  sitecalibrations: "Site Calibration",
  "system-alerts": "System Alerts",
  predictions: "Predictions",
  drift: "Drift Analytics",
  signatures: "Signatures",
  uploads: "File Uploads",
};

// What each pipeline stage means in plain words. The stage names come from
// services/stageTracker.js (set on res.locals.activityStages by jobNumberRoutes).
const STAGE_LABELS = {
  InstrumentTagging: "Created job (waiting at Instrument Tagging)",
  IncomingCalibration: "Tagged instrument (sent to Incoming Calibration)",
  IncomingConcern: "Tagged job with concern (sent to Incoming Concern)",
  OngoingCalibration: "Sent job to Ongoing Calibration",
  ForTyping: "Sent job to For Typing",
  CheckingOIC: "Typed draft report (sent to For Checking OIC)",
  CheckingSIG: "OIC checked report (sent to Checking SIG)",
  PrintFinalCertificate: "SIG checked report (sent to Print Final Certificate)",
  Delivery: "Printed final certificate (sent to For Delivery)",
};

// Fallback when an update-details save didn't move the job to a new stage
// (e.g. saving calibration data again, or editing a field).
function jobFallbackLabel(b) {
  if (b.finalCertPrintedAt) return "Printed final certificate";
  if (b.draftCheckedSIGAt) return "SIG checked report";
  if (b.draftCheckedOICAt) return "OIC checked report";
  if (b.draftReportTypedAt) return "Saved draft report";
  if (b.calibrationData) return "Saved calibration data";
  return "Updated job details";
}

function stagesLabel(res, body, fallbackBody) {
  const stages = res.locals.activityStages;
  if (Array.isArray(stages) && stages.length > 0) {
    return stages
      .map((s) => STAGE_LABELS[s] || `Moved job to ${s}`)
      .join(", then ");
  }
  return jobFallbackLabel(fallbackBody || body);
}

// Specific routes get a specific label. First match wins.
// `label` is either a string or a function (req, res, body) => string.
const LABELS = [
  // ---- Job Numbers ----
  {
    re: /^\/api\/jobnumbers\/?$/,
    method: "POST",
    label: (req, res, b) =>
      b.scId
        ? "Created job from Site Calibration"
        : "Created job number (Job Receipt)",
  },
  {
    re: /^\/api\/jobnumbers\/tag/,
    label: (req, res, b) => stagesLabel(res, b, { tagged: true }),
  },
  {
    re: /^\/api\/jobnumbers\/update-details/,
    label: (req, res, b) => stagesLabel(res, b),
  },
  {
    re: /^\/api\/jobnumbers\/[0-9a-f]{24}$/i,
    method: "PUT",
    label: "Edited job receipt",
  },

  // ---- Quotations ----
  { re: /^\/api\/quotations\/?$/, method: "POST", label: "Created quotation" },
  {
    re: /\/upload-template$/,
    label: "Uploaded filled quotation (sent to For Checking)",
  },
  {
    re: /\/upload-client-proof$/,
    label: "Uploaded client proof for quotation",
  },
  { re: /\/apply-approval$/, label: "Applied approver signature to quotation" },
  { re: /\/move-to-sending$/, label: "Moved quotation to For Sending" },
  {
    re: /\/upload-signed$/,
    label: "Uploaded signed quotation (sent to For Sending)",
  },
  {
    re: /^\/api\/quotations\/[^/]+\/send$/,
    label: "Emailed quotation to customer",
  },
  { re: /\/mark-sent$/, label: "Marked quotation as Sent" },
  {
    re: /^\/api\/quotations\/[^/]+$/,
    method: "PUT",
    label: "Edited quotation",
  },

  // ---- Delivery Receipts ----
  {
    re: /^\/api\/deliveryreceipts\/?$/,
    method: "POST",
    label: "Created delivery receipt",
  },

  // ---- Other ----
  {
    re: /^\/api\/uploads\/equipment-photo/,
    label: "Uploaded instrument photo",
  },
  { re: /download-filled/, label: "Downloaded filled calibration template" },
  { re: /^\/api\/uploads/, label: "Uploaded a file" },
  { re: /^\/api\/predictions\/train/, label: "Retrained prediction model" },
  { re: /^\/api\/signatures/, label: "Updated signature" },
  { re: /auto-?schedule/i, label: "Ran Auto-Schedule" },
];

// Body fields worth showing in the Details column (never passwords/tokens)
const DETAIL_KEYS = [
  "jobNumber",
  "jobNo",
  "DRID",
  "drid",
  "quotationNo",
  "scId",
  "companyName",
  "name",
  "username",
  "code",
  "stage",
  "status",
  "typedBy",
  "oicBy",
  "sig",
  "approverName",
  "sentBy",
];

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch (e) {
    return s;
  }
}

function getUser(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ") && process.env.JWT_SECRET) {
    try {
      const p = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
      // adjust these keys to match what your login puts in the token
      if (p.username) {
        return { username: p.username, name: p.name || "", role: p.role || "" };
      }
    } catch (e) {
      /* fall through to headers */
    }
  }
  return {
    username: req.headers["x-username"] || "unknown",
    name: safeDecode(req.headers["x-name"] || ""),
    role: req.headers["x-user-role"] || "",
  };
}

function typeFromMethod(method) {
  if (method === "POST") return "create";
  if (method === "DELETE") return "delete";
  return "update"; // PUT / PATCH
}

function buildAction(req, res, path, module) {
  const body = req.body && typeof req.body === "object" ? req.body : {};

  const hit = LABELS.find(
    (l) => l.re.test(path) && (!l.method || l.method === req.method),
  );
  if (hit) {
    return typeof hit.label === "function"
      ? hit.label(req, res, body)
      : hit.label;
  }

  const verb = {
    POST: "Created",
    PUT: "Updated",
    PATCH: "Updated",
    DELETE: "Deleted",
  }[req.method];
  return `${verb} ${module.toLowerCase()} record`;
}

// Job numbers a delivery receipt covers (same shapes the delivery route accepts)
function jobNumbersFromBody(body) {
  const found = new Set();
  const add = (v) => {
    if (typeof v === "string" && v.trim()) found.add(v.trim());
  };
  add(body.jobNumber);
  if (Array.isArray(body.jobNumbers)) body.jobNumbers.forEach(add);
  ["items", "jobs", "instruments", "units"].forEach((key) => {
    if (Array.isArray(body[key])) {
      body[key].forEach((item) =>
        add(typeof item === "string" ? item : item && item.jobNumber),
      );
    }
  });
  return [...found];
}

// Builds the Details column from (1) the IDs the server generated, which are
// only in the response, (2) the ID in the URL, and (3) a few request-body fields.
function buildDetails(req, res, path) {
  const map = new Map();
  const put = (k, v) => {
    if (
      v !== undefined &&
      v !== null &&
      v !== "" &&
      typeof v !== "object" &&
      !map.has(k)
    ) {
      map.set(k, String(v).slice(0, 60));
    }
  };

  const resBody = res.locals._activityResBody;
  if (resBody && typeof resBody === "object") {
    put("jobNumber", resBody.jobNumber);
    put("deliveryReceiptId", resBody.deliveryReceiptId);
    put(
      "quotationId",
      resBody.quotationId ||
        (resBody.quotation && resBody.quotation.quotationId),
    );
  }

  const segs = path.split("/"); // ["", "api", "<module>", ...]
  if (segs[2] === "quotations" && segs[3] && segs[3] !== "next-id") {
    put("quotationId", safeDecode(segs[3]));
  }
  if (segs[2] === "uploads" && segs[3] === "equipment-photo" && segs[4]) {
    put("jobNumber", safeDecode(segs[4]));
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (segs[2] === "deliveryreceipts") {
    const jobs = jobNumbersFromBody(body);
    if (jobs.length) put("jobNumbers", jobs.join(", "));
  }
  for (const k of DETAIL_KEYS) put(k, body[k]);

  return Array.from(map, ([k, v]) => `${k}: ${v}`)
    .slice(0, 4)
    .join(" · ");
}

function activityMiddleware(req, res, next) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();

  const path = req.originalUrl.split("?")[0];
  if (SKIP.some((re) => re.test(path))) return next();

  // Keep a copy of the JSON the route responds with, so generated IDs
  // (DR/0001/26, QTN/0003/26, ...) can be shown in the Details column.
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    res.locals._activityResBody = data;
    return originalJson(data);
  };

  res.on("finish", () => {
    if (res.statusCode >= 400) return; // only log things that actually succeeded

    const segment = (path.split("/")[2] || "").toLowerCase();
    const module =
      MODULES[segment] ||
      (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "System");

    logActivity({
      ...getUser(req),
      action: buildAction(req, res, path, module),
      module,
      type: typeFromMethod(req.method),
      details: buildDetails(req, res, path),
      ip: req.ip,
    });
  });

  next();
}

module.exports = activityMiddleware;
