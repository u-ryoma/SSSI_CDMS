/**
 * calibrationEngine.js
 *
 * Pure-JS port of the SSS-CP-020 workbook logic (sheets: ws, calculations,
 * unc..unc (6), Front Page, Calib Data 1). No React in here, so it can be
 * unit-tested, or reused server-side if you later want to generate the PDF
 * on the backend.
 *
 * What the workbook does, in plain terms
 * --------------------------------------
 * 1. Expected value  : linear map of the applied (STD) value onto the UUT scale.
 *                      calculations!A5:A17 (and C..K for the other points)
 *                        expected = lower + (upper - lower) * (applied - applied0) / (ratioStd - applied0)
 *                      where applied0 is the first point's applied value (ws!B20).
 * 2. Correction      : round(expected,2) - round(indicated, uutDecimals), rounded to
 *                      uutDecimals and printed with an explicit +/- sign.
 *                      (calculations!DC..DE)
 * 3. Uncertainty     : unc..unc(6), one sheet per point.
 *                        calibrator std-unc mapped onto the UUT scale  (B12, from G26:G39)
 *                        UUT reading resolution / divisor              (B13)
 *                        root-sum-square -> uc
 *                        Welch-Satterthwaite veff using ONLY the UUT-resolution term (A26:A36)
 *                        k = 2 if veff < 11, otherwise the t-table lookup (I52:I75)
 *                        U = round(uc * k, 2), never below the row's CMC (O19 = MAX(D45, CMC))
 * 4. Text formatting : the giant IF/TRUNC chains in `calculations` are just
 *                      "ROUND to N decimals and pad with trailing zeros", so
 *                      they collapse to fmtFixed().
 */

// ---------------------------------------------------------------------------
// Template quirks.
//
// Three cells in the workbook look like typos. Switch to `true` if you want
// the *intended* behaviour instead of byte-for-byte parity with the xlsx.
//   digitalDivisorFromType  - ws!R2 tests UPPER(G2) (the "date cal" label, so it
//                             is never "DIGITAL"); intended cell is H4 (type).
//   onSiteTempFromExaminedAt- Front Page!J21 tests ws!H1 (date received); the
//                             intended cell is ws!B5 (examined at).
// The third one (relative-humidity chain reading blank O3 instead of L3) is
// always fixed here, because the template version prints "CONTACT ADMIN" for
// any 45-65 % reading.
// ---------------------------------------------------------------------------
export const TEMPLATE_QUIRKS = {
  digitalDivisorFromType: false,
  onSiteTempFromExaminedAt: false,
};

export const POINT_COUNT = 6;
export const NOMINAL_FRACTIONS = [0, 0.2, 0.4, 0.6, 0.8, 1]; // ws!F20:F25 = upper * these

export const TRACEABILITY =
  "NIM (China) thru SCM (Hongkong), NMC@A*STAR (Singapore) , NIST (USA), and NML ITDI (Philippines), NPL (UK) thru SONJU Engineering Services (Philippines) and MIRDC (Philippines)";

// calculations!B86:C93 / H86:I93 fallback acronym -> full name table.
export const SIGNER_FALLBACK = {
  ALP: "ARSEMAR L. POBLETE",
  MGJ: "MARIO G. JULIAN",
  RMP: "ROWELL M. POBLETE",
  COT: "CELSO O. TAMAYO JR.",
  SPE: "SUNNY P. EVANGELISTA",
  FSO: "FREDIRICK S. ORTEGA",
  HAS: "HERMINIO A. SANTOS III",
  RCL: "RAMEL C. LUNA",
  NEZ: "NEIL BRIAN E. ZABALA",
};

// unc!F52:G75 - k by effective degrees of freedom (first row where veff <= F)
const K_BY_VEFF = [
  [1.5, 12.71],
  [2.5, 4.3],
  [3.5, 3.18],
  [4.5, 2.78],
  [5.5, 2.57],
  [6.5, 2.45],
  [7.5, 2.36],
  [8.5, 2.31],
  [9.5, 2.26],
  [12.5, 2.23],
  [15.5, 2.13],
  [16.5, 2.12],
  [17.5, 2.11],
  [18.5, 2.1],
  [19.5, 2.09],
  [22.5, 2.09],
  [27.5, 2.06],
  [32.5, 2.04],
  [37.5, 2.03],
  [42.5, 2.02],
  [47.5, 2.01],
  [75, 2.01],
  [100, 1.984],
];
const K_FALLBACK = 1.96; // veff > 100

// unc!A79:B100 - degrees of freedom for the calibrator, looked up from its divisor
const DOF_BY_K = [
  [1, 8.505],
  [2, 3.74],
  [3, 2.98],
  [4, 2.675],
  [5, 2.51],
  [6, 2.405],
  [7, 2.335],
  [8, 2.285],
  [9, 2.245],
  [10, 2.18],
  [15, 2.125],
  [16, 2.115],
  [17, 2.105],
  [18, 2.095],
  [19, 2.09],
  [20, 2.075],
  [25, 2.05],
  [30, 2.035],
  [35, 2.025],
  [40, 2.015],
  [45, 2.01],
  [50, 1.997],
];

// ---------------------------------------------------------------------------
// Number helpers
// ---------------------------------------------------------------------------

/** "" / null / "abc" -> NaN, everything else Number(). */
export const toNum = (v) => {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

/** Excel-style ROUND (half away from zero, decimal-string based). */
export const roundHalfAway = (x, n = 0) => {
  if (!Number.isFinite(x)) return NaN;
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const s = String(a);
  let scaled;
  if (s.includes("e")) {
    scaled = Math.round(a * 10 ** n);
    return sign * (scaled / 10 ** n);
  }
  scaled = Math.round(Number(`${s}e${n}`));
  return sign * Number(`${scaled}e-${n}`);
};

const clampDecimals = (d) => {
  const n = Number.isFinite(d) ? Math.trunc(d) : 0;
  return Math.min(7, Math.max(0, n)); // the workbook only has 0..7 decimal blocks
};

/** ROUND to n decimals and print with exactly n decimals. "-0.00" never appears. */
export const fmtFixed = (x, decimals) => {
  if (!Number.isFinite(x)) return "";
  const n = clampDecimals(decimals);
  const r = roundHalfAway(x, n);
  return (r === 0 ? 0 : r).toFixed(n);
};

/** Same, but with an explicit "+" for positives (correction column). */
export const fmtSigned = (x, decimals) => {
  if (!Number.isFinite(x)) return "";
  const n = clampDecimals(decimals);
  const r = roundHalfAway(x, n);
  if (r > 0) return `+${r.toFixed(n)}`;
  if (r < 0) return `-${Math.abs(r).toFixed(n)}`;
  return (0).toFixed(n);
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export const coverageFactorFromVeff = (veff) => {
  if (!(veff >= 11)) return 2; // D47: IF(A36<11, 2, ...)
  let k = K_FALLBACK;
  for (const [limit, value] of K_BY_VEFF) {
    if (veff <= limit) {
      k = value;
      break;
    }
  }
  return k === 1.984 ? 2 : k; // O29: IF(D47=1.984, 2, D47)
};

export const dofFromDivisor = (divisor) => {
  if (!Number.isFinite(divisor)) return NaN;
  for (const [dof, t] of DOF_BY_K) {
    if (divisor >= t) return dof;
  }
  return 100;
};

export const relativeHumidityLabel = (rh) => {
  if (rh >= 45 && rh <= 65) return "45% to 65%";
  if (rh >= 25 && rh <= 45) return "25% to 45%";
  if (rh >= 85 && rh <= 90) return "85% to +90%";
  return "CONTACT ADMIN";
};

export const resolveSignerName = (code, accounts = []) => {
  if (!code) return "";
  const hit = accounts.find((a) => a.username === code);
  if (hit?.name) return hit.name.toUpperCase();
  return SIGNER_FALLBACK[code] || code;
};

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const emptyPoint = () => ({ applied: "", indicated: "", cmc: "0.06" });

export const defaultInputs = () => ({
  heading: "1.0 AC CURRENT @ 60Hz:", // ws!A17
  type: "ANALOG", // ws!H4
  examinedAt: "LAB", // ws!B5
  temp: "", // ws!L2
  rh: "", // ws!L3
  lower: "0", // ws!B15
  upper: "10", // ws!C15
  rsln: "", // ws!D15
  read: "", // ws!E15  (UUT reading resolution, feeds the type-B term)
  unit: "A", // ws!F15
  uutDecimals: "0", // ws!G15
  appliedDecimals: "2", // ws!A20:A25
  stdUnit: "A",
  ratioUut: "10", // ws!B6 (shown "10A : 5A")
  ratioStd: "5", // ws!C6
  calStdUnc: "0.06", // unc!I27 - std calibrator uncertainty at the std side
  calDivisor: "2.01", // ws!Q20
  points: Array.from({ length: POINT_COUNT }, emptyPoint),
});

// ---------------------------------------------------------------------------
// Main computation
// ---------------------------------------------------------------------------

export const rangeLabel = (i) => {
  const u = i.unit || "";
  return `${i.lower}${u} to ${i.upper}${u} x ${i.rsln}${u} /div.`; // ws!H5
};

export const ratioLabel = (i) =>
  `${i.ratioUut}${i.unit || ""} : ${i.ratioStd}${i.stdUnit || ""}`; // Calib Data!J18

export function computeCalibration(inputs) {
  const lower = toNum(inputs.lower);
  const upper = toNum(inputs.upper);
  const read = toNum(inputs.read);
  const uutDec = clampDecimals(toNum(inputs.uutDecimals));
  const appDec = clampDecimals(toNum(inputs.appliedDecimals));
  const ratioUut = toNum(inputs.ratioUut);
  const ratioStd = toNum(inputs.ratioStd);
  const calStdUnc = toNum(inputs.calStdUnc);
  const calDivisor = toNum(inputs.calDivisor);

  const errors = [];
  if (!Number.isFinite(lower) || !Number.isFinite(upper))
    errors.push("Enter the lower and upper range.");
  if (!(read > 0))
    errors.push('"Read" (UUT reading resolution) must be greater than 0.');
  if (!(calDivisor > 0))
    errors.push("Calibrator divisor must be greater than 0.");
  if (!Number.isFinite(ratioUut) || !Number.isFinite(ratioStd))
    errors.push("Enter the ratio (UUT : STD).");

  const y1 = toNum(inputs.points[0]?.applied); // ws!B20 - baseline applied value
  const baseline = Number.isFinite(y1) ? y1 : 0;
  if (Number.isFinite(ratioStd) && ratioStd === baseline) {
    errors.push(
      "The std-side ratio cannot equal the first applied value (division by zero).",
    );
  }

  // Digital instruments use a different divisor on the reading resolution.
  const isDigital = String(inputs.type).toUpperCase() === "DIGITAL";
  const readDivisor =
    TEMPLATE_QUIRKS.digitalDivisorFromType && isDigital ? 3.4641 : 1.732; // ws!R2
  const readDof = readDivisor === 3.4641 ? 100 : 12.5; // unc!F13

  // Calibrator std-uncertainty mapped onto the UUT scale (unc!G26:G39).
  const calibratorU = roundHalfAway(
    lower +
      ((ratioUut - lower) * (calStdUnc - baseline)) / (ratioStd - baseline),
    2,
  );

  const rows = inputs.points.map((p, idx) => {
    const applied = toNum(p.applied);
    const indicated = toNum(p.indicated);
    const cmc = Number.isFinite(toNum(p.cmc)) ? toNum(p.cmc) : 0;
    const nominal = Number.isFinite(upper)
      ? upper * NOMINAL_FRACTIONS[idx]
      : NaN;

    const row = {
      index: idx + 1,
      nominal,
      complete: Number.isFinite(applied) && Number.isFinite(indicated),
      appliedFmt: "",
      expectedFmt: "",
      indicatedFmt: "",
      correctionFmt: "",
      uncertaintyFmt: "",
      kFmt: "",
      budget: null,
    };
    if (!row.complete || errors.length) return row;

    // 1) expected value -----------------------------------------------------
    const expected =
      lower + ((upper - lower) * (applied - baseline)) / (ratioStd - baseline);
    const expectedR = roundHalfAway(expected, 2); // AK23 is hard-wired to 2 decimals
    const indicatedR = roundHalfAway(indicated, uutDec);

    row.appliedFmt = fmtFixed(applied, appDec);
    row.expectedFmt = fmtFixed(expected, 2);
    row.indicatedFmt = fmtFixed(indicated, uutDec);

    // 2) correction ----------------------------------------------------------
    row.correctionFmt = fmtSigned(expectedR - indicatedR, uutDec);

    // 3) uncertainty ---------------------------------------------------------
    const u12 = roundHalfAway(calibratorU / calDivisor, 8); // unc!I12
    const u13 = roundHalfAway(read / readDivisor, 8); // unc!I13
    const uc = roundHalfAway(Math.sqrt(u12 * u12 + u13 * u13), 7); // unc!E18 -> E19 (type A = 0)
    const veff = u13 > 0 ? uc ** 4 / (u13 ** 4 / readDof) : Infinity; // unc!A36
    const k = coverageFactorFromVeff(veff); // unc!O29
    const expanded = roundHalfAway(uc * k, 2); // unc!D45
    const reported = Math.max(expanded, cmc); // unc!O19

    row.uncertaintyFmt = fmtFixed(reported, 2); // unc!Q18
    row.kFmt = fmtFixed(k, 2); // unc!Q28
    row.budget = {
      calibratorU,
      calDivisor,
      calDof: dofFromDivisor(calDivisor),
      u12,
      read,
      readDivisor,
      readDof,
      u13,
      uc,
      veff,
      k,
      expanded,
      cmc,
      reported,
      cmcApplied: cmc > expanded,
    };
    return row;
  });

  return {
    errors,
    complete: rows.every((r) => r.complete),
    range: rangeLabel(inputs),
    ratio: ratioLabel(inputs),
    rhLabel: relativeHumidityLabel(toNum(inputs.rh)),
    isDigital,
    rows,
  };
}

/** Front Page!J21 */
export const ambientTempLabel = (inputs) => {
  const onSite = String(inputs.examinedAt).toUpperCase() === "ON SITE";
  if (TEMPLATE_QUIRKS.onSiteTempFromExaminedAt && onSite)
    return `${inputs.temp}°C ± 2°C`;
  return "23°C ± 2°C";
};

/** Everything the Front Page / Calib Data sheets would have shown, ready to render or persist. */
export function buildCertificateData({
  inputs,
  standards,
  job,
  signerName,
  oicName,
}) {
  const calc = computeCalibration(inputs);
  return {
    jobNumber: job.jobNumber,
    company: job.companyName,
    address: job.companyAddress,
    attention: job.contactName || "",
    instrument: job.description,
    manufacturer: job.brand,
    model: job.model,
    serialNo: job.serialNo,
    ambientTemp: ambientTempLabel(inputs),
    relativeHumidity: calc.rhLabel,
    dateCalibrated: job.dateCal,
    dueDate: job.dateDue,
    dateReceived: job.dateRec,
    procedureNumber: job.calibrationProcedure,
    accreditationLogo: job.accreditationLogo,
    standards,
    traceability: TRACEABILITY,
    oicName,
    signerName,
    calc,
    inputs,
  };
}
