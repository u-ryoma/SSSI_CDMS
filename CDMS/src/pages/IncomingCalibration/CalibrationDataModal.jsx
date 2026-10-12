// import React, { useEffect, useMemo, useState } from "react";
// import { createPortal } from "react-dom";
// import "./CalibrationDataModal.css";
// import CdmsModalHeader from "./CdmsModalHeader";
// import {
//   NOMINAL_FRACTIONS,
//   TEMPLATE_QUIRKS,
//   buildCertificateData,
//   computeCalibration,
//   defaultInputs,
//   resolveSignerName,
//   toNum,
// } from "./calibrationEngine";

// const API = import.meta.env.VITE_API_URL;

// const TABS = [
//   { id: "setup", label: "1. Setup" },
//   { id: "readings", label: "2. Readings" },
//   { id: "uncertainty", label: "3. Uncertainty" },
//   { id: "certificate", label: "4. Certificate" },
// ];

// const formatDate = (iso) => {
//   if (!iso) return "";
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return iso; // dateRec is free text in this app
//   return d.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "long",
//     year: "numeric",
//   });
// };

// /**
//  * CalibrationDataModal
//  *
//  * In-app replacement for the SSS-CP-020.xlsx "download, fill in, re-upload" flow.
//  * Every input cell of the workbook's `ws` sheet is a field here, and every
//  * formula (expected value, correction, uncertainty budget, k-factor, RH range,
//  * signer lookup) runs live through calibrationEngine.js. The "Certificate" tab
//  * renders what the workbook's Front Page and Calib Data 1 sheets showed.
//  *
//  * Props
//  *  job          the form object from IncomingCalibDetailsModal (job no., company, brand ...)
//  *  standards    form.calibrationStandards (the 5x3 grid of standard codes)
//  *  accounts     eligible signer accounts [{ username, name }] - used to resolve OIC / SIG names
//  *  initialData  previously saved calibrationData (to re-open and edit)
//  *  onSave(data) called with { inputs, standards, certificate, savedAt }
//  *  onCancel()
//  */
// const CalibrationDataModal = ({
//   job,
//   standards: standardGrid,
//   accounts = [],
//   initialData,
//   onSave,
//   onCancel,
// }) => {
//   const [tab, setTab] = useState("setup");
//   const [inputs, setInputs] = useState(() => ({
//     ...defaultInputs(),
//     ...(initialData?.inputs || {}),
//   }));
//   const [showErrors, setShowErrors] = useState(false);

//   // ---- Reference standards (CDMS!B17:G32 in the workbook) ---------------
//   const codes = useMemo(
//     () =>
//       (standardGrid || [])
//         .flatMap((row) => [row.item1, row.item2, row.item3])
//         .map((c) => (c || "").trim())
//         .filter(Boolean),
//     [standardGrid],
//   );

//   const [standards, setStandards] = useState(
//     () => initialData?.standards || [],
//   );
//   const [standardsLoading, setStandardsLoading] = useState(false);

//   useEffect(() => {
//     // Keep rows the user already edited; only add rows for codes we don't have yet.
//     let cancelled = false;
//     const missing = codes.filter((c) => !standards.some((s) => s.code === c));
//     const stale = standards.filter((s) => !codes.includes(s.code));
//     if (missing.length === 0 && stale.length === 0) return;

//     (async () => {
//       let registry = [];
//       if (missing.length) {
//         setStandardsLoading(true);
//         try {
//           const res = await fetch(`${API}/api/standards`);
//           const data = await res.json();
//           registry = Array.isArray(data) ? data : [];
//         } catch (err) {
//           console.error("Failed to load standards for certificate:", err);
//         }
//       }
//       if (cancelled) return;
//       setStandards((prev) => {
//         const kept = prev.filter((s) => codes.includes(s.code));
//         const added = missing.map((code) => {
//           const hit =
//             registry.find((r) => (r.code || r.standardId) === code) || {};
//           return {
//             code,
//             name: hit.description || "",
//             serialNo: hit.serialNo || "",
//             certNo: hit.certNo || hit.certificateNo || hit.certNumber || "",
//             dueDate: hit.dateDue || "",
//           };
//         });
//         return codes.map(
//           (c) =>
//             kept.find((s) => s.code === c) || added.find((s) => s.code === c),
//         );
//       });
//       setStandardsLoading(false);
//     })();
//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [codes]);

//   const setField = (name, value) => setInputs((p) => ({ ...p, [name]: value }));
//   const setPoint = (idx, name, value) =>
//     setInputs((p) => ({
//       ...p,
//       points: p.points.map((pt, i) =>
//         i === idx ? { ...pt, [name]: value } : pt,
//       ),
//     }));
//   const setStandardField = (idx, name, value) =>
//     setStandards((p) =>
//       p.map((s, i) => (i === idx ? { ...s, [name]: value } : s)),
//     );

//   // ---- Live calculation ----------------------------------------------------
//   const calc = useMemo(() => computeCalibration(inputs), [inputs]);

//   const signerName = resolveSignerName(job.sig, accounts);
//   const oicName = resolveSignerName(job.oicBy, accounts);

//   const certificate = useMemo(
//     () => buildCertificateData({ inputs, standards, job, signerName, oicName }),
//     [inputs, standards, job, signerName, oicName],
//   );

//   const problems = [
//     ...calc.errors,
//     ...(calc.complete
//       ? []
//       : ["Fill in the applied value and indicated value for all 6 points."]),
//   ];

//   const handleSave = () => {
//     if (problems.length) {
//       setShowErrors(true);
//       setTab(calc.errors.length && tab === "certificate" ? "setup" : tab);
//       return;
//     }
//     onSave?.({
//       inputs,
//       standards,
//       certificate,
//       savedAt: new Date().toISOString(),
//     });
//   };

//   const field = (label, name, extra = {}) => (
//     <div className="cdm-field">
//       <label>{label}</label>
//       <input
//         type={extra.type || "text"}
//         value={inputs[name]}
//         placeholder={extra.placeholder}
//         step={extra.step}
//         onChange={(e) => setField(name, e.target.value)}
//       />
//       {extra.hint && <span className="cdm-hint">{extra.hint}</span>}
//     </div>
//   );

//   // =========================================================================
//   // Tabs
//   // =========================================================================
//   const setupTab = (
//     <div className="cdm-grid">
//       <section className="cdm-card">
//         <h4>Instrument &amp; environment</h4>
//         {field("Test heading", "heading")}
//         <div className="cdm-field">
//           <label>Type</label>
//           <select
//             value={inputs.type}
//             onChange={(e) => setField("type", e.target.value)}
//           >
//             <option>ANALOG</option>
//             <option>DIGITAL</option>
//           </select>
//         </div>
//         <div className="cdm-field">
//           <label>Examined at</label>
//           <select
//             value={inputs.examinedAt}
//             onChange={(e) => setField("examinedAt", e.target.value)}
//           >
//             <option>LAB</option>
//             <option>ON SITE</option>
//           </select>
//         </div>
//         {field("Temperature (°C)", "temp", { type: "number", step: "0.1" })}
//         {field("Relative humidity (%)", "rh", { type: "number", step: "0.1" })}
//         <div className="cdm-computed">
//           RH range on certificate: <strong>{calc.rhLabel}</strong>
//           {calc.rhLabel === "CONTACT ADMIN" && inputs.rh !== "" && (
//             <span className="cdm-warn">
//               {" "}
//               — outside the allowed ranges (25–45, 45–65, 85–90 %)
//             </span>
//           )}
//         </div>
//       </section>

//       <section className="cdm-card">
//         <h4>Range of the unit under test</h4>
//         {field("Lower", "lower", { type: "number", step: "any" })}
//         {field("Upper", "upper", { type: "number", step: "any" })}
//         {field("Resolution (per division)", "rsln", {
//           type: "number",
//           step: "any",
//         })}
//         {field("Read (UUT reading resolution)", "read", {
//           type: "number",
//           step: "any",
//           hint: "Drives the type-B uncertainty term.",
//         })}
//         {field("Unit", "unit")}
//         {field("UUT decimals (0–7)", "uutDecimals", {
//           type: "number",
//           step: "1",
//         })}
//         <div className="cdm-computed">
//           Range on certificate: <strong>{calc.range}</strong>
//         </div>
//       </section>

//       <section className="cdm-card">
//         <h4>Ratio &amp; calibrator</h4>
//         {field("Ratio — UUT side", "ratioUut", { type: "number", step: "any" })}
//         {field("Ratio — STD side", "ratioStd", { type: "number", step: "any" })}
//         {field("STD unit", "stdUnit")}
//         {field("Applied-value decimals", "appliedDecimals", {
//           type: "number",
//           step: "1",
//         })}
//         {field("Calibrator uncertainty (STD side)", "calStdUnc", {
//           type: "number",
//           step: "any",
//         })}
//         {field("Calibrator divisor", "calDivisor", {
//           type: "number",
//           step: "any",
//         })}
//         <div className="cdm-computed">
//           Ratio on certificate: <strong>{calc.ratio}</strong>
//         </div>
//       </section>

//       <section className="cdm-card cdm-card-wide">
//         <h4>Reference standards {standardsLoading && <em>(loading…)</em>}</h4>
//         {standards.length === 0 ? (
//           <div className="cdm-empty">
//             No calibration standards selected on the job yet. Pick them in the
//             Calibration Standard grid, then re-open this window.
//           </div>
//         ) : (
//           <table className="cdm-table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Code</th>
//                 <th>Asset name</th>
//                 <th>Serial no.</th>
//                 <th>Cert no.</th>
//                 <th>Due date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {standards.map((s, i) => (
//                 <tr key={s.code}>
//                   <td>{i + 1}</td>
//                   <td>{s.code}</td>
//                   <td>
//                     <input
//                       value={s.name}
//                       onChange={(e) =>
//                         setStandardField(i, "name", e.target.value)
//                       }
//                     />
//                   </td>
//                   <td>
//                     <input
//                       value={s.serialNo}
//                       onChange={(e) =>
//                         setStandardField(i, "serialNo", e.target.value)
//                       }
//                     />
//                   </td>
//                   <td>
//                     <input
//                       value={s.certNo}
//                       onChange={(e) =>
//                         setStandardField(i, "certNo", e.target.value)
//                       }
//                     />
//                   </td>
//                   <td>
//                     <input
//                       value={s.dueDate}
//                       onChange={(e) =>
//                         setStandardField(i, "dueDate", e.target.value)
//                       }
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </section>
//     </div>
//   );

//   const readingsTab = (
//     <div>
//       <div className="cdm-computed">
//         Row 1's applied value is the baseline for the interpolation (it is
//         usually 0). Expected = lower + (upper − lower) × (applied − applied₁) ÷
//         (STD ratio − applied₁).
//       </div>
//       <div className="cdm-table-scroll">
//         <table className="cdm-table cdm-readings">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Suggested UUT point</th>
//               <th>Applied ({inputs.stdUnit}) STD</th>
//               <th>Indicated ({inputs.unit}) UUT</th>
//               <th>CMC</th>
//               <th className="cdm-out">Expected</th>
//               <th className="cdm-out">Correction</th>
//               <th className="cdm-out">± U</th>
//               <th className="cdm-out">k</th>
//             </tr>
//           </thead>
//           <tbody>
//             {inputs.points.map((p, i) => {
//               const r = calc.rows[i];
//               return (
//                 <tr key={i}>
//                   <td>{i + 1}</td>
//                   <td className="cdm-muted">
//                     {Number.isFinite(toNum(inputs.upper))
//                       ? +(toNum(inputs.upper) * NOMINAL_FRACTIONS[i]).toFixed(6)
//                       : "—"}
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       step="any"
//                       value={p.applied}
//                       onChange={(e) => setPoint(i, "applied", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       step="any"
//                       value={p.indicated}
//                       onChange={(e) => setPoint(i, "indicated", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       step="any"
//                       value={p.cmc}
//                       onChange={(e) => setPoint(i, "cmc", e.target.value)}
//                     />
//                   </td>
//                   <td className="cdm-out">{r.expectedFmt || "—"}</td>
//                   <td className="cdm-out">{r.correctionFmt || "—"}</td>
//                   <td className="cdm-out">{r.uncertaintyFmt || "—"}</td>
//                   <td className="cdm-out">{r.kFmt || "—"}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   const fmt = (n, d = 6) =>
//     Number.isFinite(n) ? (n === Infinity ? "∞" : +n.toFixed(d)) : "—";
//   const uncertaintyTab = (
//     <div>
//       <div className="cdm-computed">
//         Type A is 0 (no repeat readings in this procedure). Effective degrees of
//         freedom use only the UUT-resolution term, exactly as in the workbook. If
//         veff &lt; 11, k = 2; otherwise k comes from the t-table. The reported ±
//         U is never below the row's CMC.
//       </div>
//       <div className="cdm-table-scroll">
//         <table className="cdm-table">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Calibrator U</th>
//               <th>÷ divisor</th>
//               <th>u(cal)</th>
//               <th>dof(cal)</th>
//               <th>Read</th>
//               <th>÷ divisor</th>
//               <th>u(read)</th>
//               <th>dof(read)</th>
//               <th>uc</th>
//               <th>veff</th>
//               <th>k</th>
//               <th>k·uc</th>
//               <th>CMC</th>
//               <th>Reported ± U</th>
//             </tr>
//           </thead>
//           <tbody>
//             {calc.rows.map((r) => {
//               const b = r.budget;
//               return (
//                 <tr key={r.index}>
//                   <td>{r.index}</td>
//                   {b ? (
//                     <>
//                       <td>{fmt(b.calibratorU)}</td>
//                       <td>{fmt(b.calDivisor, 4)}</td>
//                       <td>{fmt(b.u12, 8)}</td>
//                       <td>{fmt(b.calDof, 0)}</td>
//                       <td>{fmt(b.read)}</td>
//                       <td>{fmt(b.readDivisor, 4)}</td>
//                       <td>{fmt(b.u13, 8)}</td>
//                       <td>{fmt(b.readDof, 1)}</td>
//                       <td>{fmt(b.uc, 7)}</td>
//                       <td>{fmt(b.veff, 2)}</td>
//                       <td>{fmt(b.k, 3)}</td>
//                       <td>{fmt(b.expanded, 2)}</td>
//                       <td>{fmt(b.cmc, 3)}</td>
//                       <td className="cdm-out">
//                         {r.uncertaintyFmt}
//                         {b.cmcApplied && (
//                           <span title="CMC is larger than the computed uncertainty, so the CMC is reported">
//                             {" "}
//                             *
//                           </span>
//                         )}
//                       </td>
//                     </>
//                   ) : (
//                     <td colSpan={14} className="cdm-muted">
//                       Enter readings for this point
//                     </td>
//                   )}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       <div className="cdm-hint">
//         * CMC reported because it is greater than the computed uncertainty.
//       </div>
//     </div>
//   );

//   const unit = inputs.unit;
//   const certificateTab = (
//     <div>
//       <div className="cdm-cert-toolbar cdm-no-print">
//         <button type="button" onClick={() => window.print()}>
//           🖨 Print / Save as PDF
//         </button>
//         <span className="cdm-hint">
//           Page 1 = Front Page, Page 2 = Calibration Data (same content as the
//           workbook's two certificate sheets).
//         </span>
//       </div>

//       <div className="cdm-cert-pages">
//         {/* ---------------- PAGE 1 : FRONT PAGE ---------------- */}
//         <div className="cdm-page">
//           <div className="cdm-page-head">
//             <div className="cdm-org">SCIENTIFIC STANDARDS SERVICES</div>
//             {certificate.accreditationLogo !== "none" && (
//               <div className="cdm-logo">PAB ACCREDITED</div>
//             )}
//           </div>
//           <h2 className="cdm-title">CERTIFICATE OF CALIBRATION</h2>
//           <div className="cdm-certno">{certificate.jobNumber}</div>
//           <div className="cdm-note">
//             (This Certificate shall not be reproduced without the written
//             approval of the laboratory)
//           </div>

//           <dl className="cdm-dl">
//             <dt>Submitted By</dt>
//             <dd>
//               {certificate.company}
//               <br />
//               {certificate.address}
//             </dd>
//             <dt>Attention</dt>
//             <dd>{certificate.attention}</dd>
//             <dt>Instrument</dt>
//             <dd>{certificate.instrument}</dd>
//             <dt>Manufacturer</dt>
//             <dd>{certificate.manufacturer}</dd>
//             <dt>Model</dt>
//             <dd>{certificate.model}</dd>
//             <dt>Serial Number</dt>
//             <dd>{certificate.serialNo}</dd>
//             <dt>Ambient Temperature</dt>
//             <dd>{certificate.ambientTemp}</dd>
//             <dt>Relative Humidity</dt>
//             <dd>{certificate.relativeHumidity}</dd>
//             <dt>Date Calibrated</dt>
//             <dd>{formatDate(certificate.dateCalibrated)}</dd>
//             <dt>Recommended Due Date</dt>
//             <dd>{formatDate(certificate.dueDate)}</dd>
//             <dt>Date Received</dt>
//             <dd>{formatDate(certificate.dateReceived)}</dd>
//           </dl>

//           <p>
//             The Scientific Standards Services certifies that this instrument was
//             calibrated under the environmental conditions stated above using
//             reference standard traceable to SI Units as maintained by{" "}
//             {certificate.traceability}.
//           </p>

//           <h5>Method of Calibration</h5>
//           <p>
//             The instrument was calibrated according to the established SSS
//             Standard Calibration Procedure {certificate.procedureNumber} by
//             direct comparison to the range stated on the calibration data at the
//             time of calibration.
//           </p>

//           <h5>Reference Standard(s) Used During Calibration</h5>
//           <table className="cdm-table cdm-cert-table">
//             <thead>
//               <tr>
//                 <th>Standard</th>
//                 <th>Serial No.</th>
//                 <th>Certificate No.</th>
//                 <th>Due Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {certificate.standards.map((s, i) => (
//                 <tr key={s.code}>
//                   <td>
//                     {i + 1}.{" "}
//                     {(s.name || s.code)
//                       .toLowerCase()
//                       .replace(/\b\w/g, (c) => c.toUpperCase())}
//                   </td>
//                   <td>{s.serialNo}</td>
//                   <td>{s.certNo}</td>
//                   <td>{formatDate(s.dueDate)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h5>Results of Calibration</h5>
//           <p>
//             The results of calibration are given on the attached calibration
//             data. The estimated uncertainty of measurement associated in this
//             calibration was determined in accordance with ISO Guide to the
//             expression of uncertainty in measurement (GUM) and is within 95%
//             level of confidence.
//           </p>

//           <div className="cdm-sign">
//             <div>
//               <strong>{certificate.oicName}</strong>
//               <br />
//               <span>Calibrated by</span>
//             </div>
//             <div>
//               <strong>{certificate.signerName}</strong>
//               <br />
//               <span>Approved signatory</span>
//             </div>
//           </div>
//           <div className="cdm-pageno">Page 1 of 2</div>
//         </div>

//         {/* ---------------- PAGE 2 : CALIB DATA ---------------- */}
//         <div className="cdm-page">
//           <div className="cdm-page-head">
//             <div className="cdm-org">SCIENTIFIC STANDARDS SERVICES</div>
//             {certificate.accreditationLogo !== "none" && (
//               <div className="cdm-logo">PAB ACCREDITED</div>
//             )}
//           </div>
//           <div className="cdm-certno">{certificate.jobNumber}</div>
//           <h2 className="cdm-title">CALIBRATION DATA</h2>

//           <dl className="cdm-dl">
//             <dt>Temperature</dt>
//             <dd>{inputs.temp}°C</dd>
//             <dt>Relative Humidity</dt>
//             <dd>{inputs.rh}% RH</dd>
//             <dt>Examined At</dt>
//             <dd>{inputs.examinedAt}</dd>
//             <dt>Range</dt>
//             <dd>{calc.range}</dd>
//             <dt>Type</dt>
//             <dd>{inputs.type}</dd>
//             <dt>Ratio</dt>
//             <dd>{calc.ratio}</dd>
//           </dl>

//           <h5>{inputs.heading}</h5>
//           <table className="cdm-table cdm-cert-table cdm-center">
//             <thead>
//               <tr>
//                 <th>
//                   APPLIED VALUE
//                   <br />
//                   (STD)
//                 </th>
//                 <th>
//                   EXPECTED VALUE
//                   <br />
//                   (STD)
//                 </th>
//                 <th>
//                   INDICATED VALUE
//                   <br />
//                   (UUT)
//                 </th>
//                 <th>CORRECTION</th>
//                 <th>UNCERTAINTY OF MEASUREMENT</th>
//                 <th>COVERAGE FACTOR</th>
//               </tr>
//               <tr className="cdm-units">
//                 <th>({inputs.stdUnit})</th>
//                 <th>({unit})</th>
//                 <th>({unit})</th>
//                 <th>({unit})</th>
//                 <th>(± {unit})</th>
//                 <th>(k)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {calc.rows.map((r) => (
//                 <tr key={r.index}>
//                   <td>{r.appliedFmt}</td>
//                   <td>{r.expectedFmt}</td>
//                   <td>{r.indicatedFmt}</td>
//                   <td>{r.correctionFmt}</td>
//                   <td>{r.uncertaintyFmt}</td>
//                   <td>{r.kFmt}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h5>REMARKS:</h5>
//           <ol className="cdm-remarks">
//             <li>
//               The user should determine the suitability of the instrument for
//               its intended use.
//             </li>
//             <li>
//               Certain factors may cause the calibration item to drift out of
//               calibration before the recommended interval has expired.
//             </li>
//             <li>
//               The calibration results in this certificate refer to the date of
//               calibration and should the instrument be modified or damaged in
//               anyway, or develop inconsistent readings, the results may not be
//               valid.
//             </li>
//             <li>
//               A positive correction is to be added to the unit under test (UUT)
//               reading and a negative correction is to be subtracted to the UUT
//               reading to give the true value.
//             </li>
//             <li>
//               The results of this certificate refers only to the instrument
//               calibrated.
//             </li>
//           </ol>

//           <div className="cdm-sign">
//             <div>
//               <strong>{certificate.oicName}</strong>
//               <br />
//               <span>Calibrated by</span>
//             </div>
//             <div>
//               <strong>{certificate.signerName}</strong>
//               <br />
//               <span>Approved signatory</span>
//             </div>
//           </div>
//           <div className="cdm-pageno">Page 2 of 2</div>
//         </div>
//       </div>
//     </div>
//   );

//   return createPortal(
//     <div className="cdm-overlay" onClick={onCancel}>
//       <div className="cdm-wrapper" onClick={(e) => e.stopPropagation()}>
//         <div className="cdm-no-print">
//           <CdmsModalHeader
//             title={`CALIBRATION DATA — ${job.calibrationProcedure || ""}`}
//             subtitleBottom={`${job.jobNumber}${job.companyName ? " · " + job.companyName : ""}`}
//             onClose={onCancel}
//           />
//         </div>

//         <div className="cdm-tabs cdm-no-print">
//           {TABS.map((t) => (
//             <button
//               key={t.id}
//               type="button"
//               className={tab === t.id ? "active" : ""}
//               onClick={() => setTab(t.id)}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>

//         <div className="cdm-body">
//           {tab === "setup" && setupTab}
//           {tab === "readings" && readingsTab}
//           {tab === "uncertainty" && uncertaintyTab}
//           {tab === "certificate" && certificateTab}
//         </div>

//         <div className="cdm-footer cdm-no-print">
//           <div className="cdm-footer-msg">
//             {showErrors && problems.length > 0 && (
//               <ul>
//                 {problems.map((p) => (
//                   <li key={p}>{p}</li>
//                 ))}
//               </ul>
//             )}
//             {TEMPLATE_QUIRKS.digitalDivisorFromType === false &&
//               calc.isDigital && (
//                 <span className="cdm-hint">
//                   Digital type selected: matching the workbook, the divisor
//                   stays 1.732 (see TEMPLATE_QUIRKS in calibrationEngine.js).
//                 </span>
//               )}
//           </div>
//           <div className="cdm-footer-btns">
//             <button type="button" className="cdm-save" onClick={handleSave}>
//               Save Calibration Data
//             </button>
//             <button type="button" onClick={onCancel}>
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default CalibrationDataModal;
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./CalibrationDataModal.css";
import CdmsModalHeader from "./CdmsModalHeader";
import {
  NOMINAL_FRACTIONS,
  TEMPLATE_QUIRKS,
  buildCertificateData,
  computeCalibration,
  defaultInputs,
  resolveSignerName,
  toNum,
} from "./calibrationEngine";

const API = import.meta.env.VITE_API_URL;

const TABS = [
  { id: "setup", label: "1. Setup" },
  { id: "readings", label: "2. Readings" },
  { id: "uncertainty", label: "3. Uncertainty" },
  { id: "certificate", label: "4. Certificate" },
];

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // dateRec is free text in this app
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Inline so the signature looks right (and prints) without needing any
// change to CalibrationDataModal.css.
const SIGNATURE_IMG_STYLE = {
  display: "block",
  maxHeight: 56,
  maxWidth: 180,
  marginBottom: 4,
};

/**
 * CalibrationDataModal
 *
 * In-app replacement for the SSS-CP-020.xlsx "download, fill in, re-upload" flow.
 * Every input cell of the workbook's `ws` sheet is a field here, and every
 * formula (expected value, correction, uncertainty budget, k-factor, RH range,
 * signer lookup) runs live through calibrationEngine.js. The "Certificate" tab
 * renders what the workbook's Front Page and Calib Data 1 sheets showed.
 *
 * Props
 *  job          the form object from IncomingCalibDetailsModal (job no., company, brand ...)
 *  standards    form.calibrationStandards (the 5x3 grid of standard codes)
 *  accounts     eligible signer accounts [{ username, name }] - used to resolve OIC / SIG names
 *  initialData  previously saved calibrationData (to re-open and edit)
 *  onSave(data) called with { inputs, standards, certificate, complete, savedAt }
 *  onCancel()
 *
 * Draft saving
 *  allowIncompleteSave  when true (Incoming Calibration), the data can be
 *                 saved even if nothing has been filled in yet. It is saved
 *                 with complete: false so later stages can tell a draft from
 *                 finished data. When false (On-Going Calibration onward),
 *                 the old validation applies and saving is blocked until
 *                 all 6 points are filled in.
 *
 * Review mode (used by For Checking OIC's "Check and Sign Report")
 *  readOnly       opens straight on the Certificate tab, hides the editing
 *                 tabs and the Save button
 *  signatures     { oic, sig } image URLs; when set, the signature is drawn
 *                 above the matching name on both certificate pages
 *  onConfirm()    called when the reviewer clicks the confirm button
 *  confirmLabel   text of that button (default "Confirm")
 */
const CalibrationDataModal = ({
  job,
  standards: standardGrid,
  accounts = [],
  initialData,
  onSave,
  onCancel,
  readOnly = false,
  signatures = {},
  onConfirm,
  confirmLabel = "Confirm",
  autoPrint = false,
  allowIncompleteSave = false,
}) => {
  const [tab, setTab] = useState(readOnly ? "certificate" : "setup");
  const [inputs, setInputs] = useState(() => ({
    ...defaultInputs(),
    ...(initialData?.inputs || {}),
  }));
  const [showErrors, setShowErrors] = useState(false);

  // ---- Reference standards (CDMS!B17:G32 in the workbook) ---------------
  const codes = useMemo(
    () =>
      (standardGrid || [])
        .flatMap((row) => [row.item1, row.item2, row.item3])
        .map((c) => (c || "").trim())
        .filter(Boolean),
    [standardGrid],
  );

  const [standards, setStandards] = useState(
    () => initialData?.standards || [],
  );
  const [standardsLoading, setStandardsLoading] = useState(false);

  useEffect(() => {
    // Keep rows the user already edited; only add rows for codes we don't have yet.
    let cancelled = false;
    const missing = codes.filter((c) => !standards.some((s) => s.code === c));
    const stale = standards.filter((s) => !codes.includes(s.code));
    if (missing.length === 0 && stale.length === 0) return;

    (async () => {
      let registry = [];
      if (missing.length) {
        setStandardsLoading(true);
        try {
          const res = await fetch(`${API}/api/standards`);
          const data = await res.json();
          registry = Array.isArray(data) ? data : [];
        } catch (err) {
          console.error("Failed to load standards for certificate:", err);
        }
      }
      if (cancelled) return;
      setStandards((prev) => {
        const kept = prev.filter((s) => codes.includes(s.code));
        const added = missing.map((code) => {
          const hit =
            registry.find((r) => (r.code || r.standardId) === code) || {};
          return {
            code,
            name: hit.description || "",
            serialNo: hit.serialNo || "",
            certNo: hit.certNo || hit.certificateNo || hit.certNumber || "",
            dueDate: hit.dateDue || "",
          };
        });
        return codes.map(
          (c) =>
            kept.find((s) => s.code === c) || added.find((s) => s.code === c),
        );
      });
      setStandardsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codes]);

  const setField = (name, value) => setInputs((p) => ({ ...p, [name]: value }));
  const setPoint = (idx, name, value) =>
    setInputs((p) => ({
      ...p,
      points: p.points.map((pt, i) =>
        i === idx ? { ...pt, [name]: value } : pt,
      ),
    }));
  const setStandardField = (idx, name, value) =>
    setStandards((p) =>
      p.map((s, i) => (i === idx ? { ...s, [name]: value } : s)),
    );

  // ---- Live calculation ----------------------------------------------------
  const calc = useMemo(() => computeCalibration(inputs), [inputs]);

  const signerName = resolveSignerName(job.sig, accounts);
  const oicName = resolveSignerName(job.oicBy, accounts);

  const certificate = useMemo(
    () => buildCertificateData({ inputs, standards, job, signerName, oicName }),
    [inputs, standards, job, signerName, oicName],
  );

  const problems = [
    ...calc.errors,
    ...(calc.complete
      ? []
      : ["Fill in the applied value and indicated value for all 6 points."]),
  ];

  const handleSave = () => {
    // Strict mode (On-Going Calibration onward): block until complete.
    if (!allowIncompleteSave && problems.length) {
      setShowErrors(true);
      setTab(calc.errors.length && tab === "certificate" ? "setup" : tab);
      return;
    }
    // Draft mode (Incoming Calibration): save whatever is there and flag
    // whether it's finished so later stages can tell the difference.
    onSave?.({
      inputs,
      standards,
      certificate,
      complete: problems.length === 0,
      savedAt: new Date().toISOString(),
    });
  };

  const field = (label, name, extra = {}) => (
    <div className="cdm-field">
      <label>{label}</label>
      <input
        type={extra.type || "text"}
        value={inputs[name]}
        placeholder={extra.placeholder}
        step={extra.step}
        onChange={(e) => setField(name, e.target.value)}
      />
      {extra.hint && <span className="cdm-hint">{extra.hint}</span>}
    </div>
  );

  // =========================================================================
  // Tabs
  // =========================================================================
  const setupTab = (
    <div className="cdm-grid">
      <section className="cdm-card">
        <h4>Instrument &amp; environment</h4>
        {field("Test heading", "heading")}
        <div className="cdm-field">
          <label>Type</label>
          <select
            value={inputs.type}
            onChange={(e) => setField("type", e.target.value)}
          >
            <option>ANALOG</option>
            <option>DIGITAL</option>
          </select>
        </div>
        <div className="cdm-field">
          <label>Examined at</label>
          <select
            value={inputs.examinedAt}
            onChange={(e) => setField("examinedAt", e.target.value)}
          >
            <option>LAB</option>
            <option>ON SITE</option>
          </select>
        </div>
        {field("Temperature (°C)", "temp", { type: "number", step: "0.1" })}
        {field("Relative humidity (%)", "rh", { type: "number", step: "0.1" })}
        <div className="cdm-computed">
          RH range on certificate: <strong>{calc.rhLabel}</strong>
          {calc.rhLabel === "CONTACT ADMIN" && inputs.rh !== "" && (
            <span className="cdm-warn">
              {" "}
              — outside the allowed ranges (25–45, 45–65, 85–90 %)
            </span>
          )}
        </div>
      </section>

      <section className="cdm-card">
        <h4>Range of the unit under test</h4>
        {field("Lower", "lower", { type: "number", step: "any" })}
        {field("Upper", "upper", { type: "number", step: "any" })}
        {field("Resolution (per division)", "rsln", {
          type: "number",
          step: "any",
        })}
        {field("Read (UUT reading resolution)", "read", {
          type: "number",
          step: "any",
          hint: "Drives the type-B uncertainty term.",
        })}
        {field("Unit", "unit")}
        {field("UUT decimals (0–7)", "uutDecimals", {
          type: "number",
          step: "1",
        })}
        <div className="cdm-computed">
          Range on certificate: <strong>{calc.range}</strong>
        </div>
      </section>

      <section className="cdm-card">
        <h4>Ratio &amp; calibrator</h4>
        {field("Ratio — UUT side", "ratioUut", { type: "number", step: "any" })}
        {field("Ratio — STD side", "ratioStd", { type: "number", step: "any" })}
        {field("STD unit", "stdUnit")}
        {field("Applied-value decimals", "appliedDecimals", {
          type: "number",
          step: "1",
        })}
        {field("Calibrator uncertainty (STD side)", "calStdUnc", {
          type: "number",
          step: "any",
        })}
        {field("Calibrator divisor", "calDivisor", {
          type: "number",
          step: "any",
        })}
        <div className="cdm-computed">
          Ratio on certificate: <strong>{calc.ratio}</strong>
        </div>
      </section>

      <section className="cdm-card cdm-card-wide">
        <h4>Reference standards {standardsLoading && <em>(loading…)</em>}</h4>
        {standards.length === 0 ? (
          <div className="cdm-empty">
            No calibration standards selected on the job yet. Pick them in the
            Calibration Standard grid, then re-open this window.
          </div>
        ) : (
          <table className="cdm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Asset name</th>
                <th>Serial no.</th>
                <th>Cert no.</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {standards.map((s, i) => (
                <tr key={s.code}>
                  <td>{i + 1}</td>
                  <td>{s.code}</td>
                  <td>
                    <input
                      value={s.name}
                      onChange={(e) =>
                        setStandardField(i, "name", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={s.serialNo}
                      onChange={(e) =>
                        setStandardField(i, "serialNo", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={s.certNo}
                      onChange={(e) =>
                        setStandardField(i, "certNo", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={s.dueDate}
                      onChange={(e) =>
                        setStandardField(i, "dueDate", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );

  const readingsTab = (
    <div>
      <div className="cdm-computed">
        Row 1's applied value is the baseline for the interpolation (it is
        usually 0). Expected = lower + (upper − lower) × (applied − applied₁) ÷
        (STD ratio − applied₁).
      </div>
      <div className="cdm-table-scroll">
        <table className="cdm-table cdm-readings">
          <thead>
            <tr>
              <th>#</th>
              <th>Suggested UUT point</th>
              <th>Applied ({inputs.stdUnit}) STD</th>
              <th>Indicated ({inputs.unit}) UUT</th>
              <th>CMC</th>
              <th className="cdm-out">Expected</th>
              <th className="cdm-out">Correction</th>
              <th className="cdm-out">± U</th>
              <th className="cdm-out">k</th>
            </tr>
          </thead>
          <tbody>
            {inputs.points.map((p, i) => {
              const r = calc.rows[i];
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="cdm-muted">
                    {Number.isFinite(toNum(inputs.upper))
                      ? +(toNum(inputs.upper) * NOMINAL_FRACTIONS[i]).toFixed(6)
                      : "—"}
                  </td>
                  <td>
                    <input
                      type="number"
                      step="any"
                      value={p.applied}
                      onChange={(e) => setPoint(i, "applied", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="any"
                      value={p.indicated}
                      onChange={(e) => setPoint(i, "indicated", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="any"
                      value={p.cmc}
                      onChange={(e) => setPoint(i, "cmc", e.target.value)}
                    />
                  </td>
                  <td className="cdm-out">{r.expectedFmt || "—"}</td>
                  <td className="cdm-out">{r.correctionFmt || "—"}</td>
                  <td className="cdm-out">{r.uncertaintyFmt || "—"}</td>
                  <td className="cdm-out">{r.kFmt || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const fmt = (n, d = 6) =>
    Number.isFinite(n) ? (n === Infinity ? "∞" : +n.toFixed(d)) : "—";
  const uncertaintyTab = (
    <div>
      <div className="cdm-computed">
        Type A is 0 (no repeat readings in this procedure). Effective degrees of
        freedom use only the UUT-resolution term, exactly as in the workbook. If
        veff &lt; 11, k = 2; otherwise k comes from the t-table. The reported ±
        U is never below the row's CMC.
      </div>
      <div className="cdm-table-scroll">
        <table className="cdm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Calibrator U</th>
              <th>÷ divisor</th>
              <th>u(cal)</th>
              <th>dof(cal)</th>
              <th>Read</th>
              <th>÷ divisor</th>
              <th>u(read)</th>
              <th>dof(read)</th>
              <th>uc</th>
              <th>veff</th>
              <th>k</th>
              <th>k·uc</th>
              <th>CMC</th>
              <th>Reported ± U</th>
            </tr>
          </thead>
          <tbody>
            {calc.rows.map((r) => {
              const b = r.budget;
              return (
                <tr key={r.index}>
                  <td>{r.index}</td>
                  {b ? (
                    <>
                      <td>{fmt(b.calibratorU)}</td>
                      <td>{fmt(b.calDivisor, 4)}</td>
                      <td>{fmt(b.u12, 8)}</td>
                      <td>{fmt(b.calDof, 0)}</td>
                      <td>{fmt(b.read)}</td>
                      <td>{fmt(b.readDivisor, 4)}</td>
                      <td>{fmt(b.u13, 8)}</td>
                      <td>{fmt(b.readDof, 1)}</td>
                      <td>{fmt(b.uc, 7)}</td>
                      <td>{fmt(b.veff, 2)}</td>
                      <td>{fmt(b.k, 3)}</td>
                      <td>{fmt(b.expanded, 2)}</td>
                      <td>{fmt(b.cmc, 3)}</td>
                      <td className="cdm-out">
                        {r.uncertaintyFmt}
                        {b.cmcApplied && (
                          <span title="CMC is larger than the computed uncertainty, so the CMC is reported">
                            {" "}
                            *
                          </span>
                        )}
                      </td>
                    </>
                  ) : (
                    <td colSpan={14} className="cdm-muted">
                      Enter readings for this point
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="cdm-hint">
        * CMC reported because it is greater than the computed uncertainty.
      </div>
    </div>
  );

  // Opens the browser's print dialog for the certificate pages (the
  // .cdm-no-print parts are hidden by the print stylesheet). "Save as
  // PDF" in that dialog produces the PDF; the page title is swapped for
  // the duration so the saved file is named after the job number
  // instead of the app's page title.
  const printCertificate = () => {
    const previousTitle = document.title;
    const safeJob = (job.jobNumber || "Certificate").replace(/[\\/]/g, "-");
    document.title = `${safeJob} - Certificate`;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };
    window.addEventListener("afterprint", restoreTitle);
    window.print();
  };

  // autoPrint (used by Print Final): open the print dialog as soon as the
  // certificate is on screen — after any signature images have loaded,
  // so they're not missing from the printout.
  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;

    const images = Array.from(document.querySelectorAll(".cdm-page img"));
    Promise.all(
      images.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    ).then(() => {
      setTimeout(() => {
        if (!cancelled) printCertificate();
      }, 300);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unit = inputs.unit;

  // "Calibrated by" (OIC) / "Approved signatory" (SIG) block, shown at the
  // bottom of both certificate pages. When a signature image URL is
  // supplied (review mode), it is drawn directly above the matching name.
  const signBlock = (
    <div className="cdm-sign">
      <div>
        {signatures.oic && (
          <img
            src={signatures.oic}
            alt="OIC signature"
            style={SIGNATURE_IMG_STYLE}
          />
        )}
        <strong>{certificate.oicName}</strong>
        <br />
        <span>Calibrated by</span>
      </div>
      <div>
        {signatures.sig && (
          <img
            src={signatures.sig}
            alt="Approved signatory signature"
            style={SIGNATURE_IMG_STYLE}
          />
        )}
        <strong>{certificate.signerName}</strong>
        <br />
        <span>Approved signatory</span>
      </div>
    </div>
  );

  const certificateTab = (
    <div>
      <div className="cdm-cert-toolbar cdm-no-print">
        <button type="button" onClick={printCertificate}>
          🖨 Print / Save as PDF
        </button>
        <span className="cdm-hint">
          Page 1 = Front Page, Page 2 = Calibration Data (same content as the
          workbook's two certificate sheets).
        </span>
      </div>

      <div className="cdm-cert-pages">
        {/* ---------------- PAGE 1 : FRONT PAGE ---------------- */}
        <div className="cdm-page">
          <div className="cdm-page-head">
            <div className="cdm-org">SCIENTIFIC STANDARDS SERVICES</div>
            {certificate.accreditationLogo !== "none" && (
              <div className="cdm-logo">PAB ACCREDITED</div>
            )}
          </div>
          <h2 className="cdm-title">CERTIFICATE OF CALIBRATION</h2>
          <div className="cdm-certno">{certificate.jobNumber}</div>
          <div className="cdm-note">
            (This Certificate shall not be reproduced without the written
            approval of the laboratory)
          </div>

          <dl className="cdm-dl">
            <dt>Submitted By</dt>
            <dd>
              {certificate.company}
              <br />
              {certificate.address}
            </dd>
            <dt>Attention</dt>
            <dd>{certificate.attention}</dd>
            <dt>Instrument</dt>
            <dd>{certificate.instrument}</dd>
            <dt>Manufacturer</dt>
            <dd>{certificate.manufacturer}</dd>
            <dt>Model</dt>
            <dd>{certificate.model}</dd>
            <dt>Serial Number</dt>
            <dd>{certificate.serialNo}</dd>
            <dt>Ambient Temperature</dt>
            <dd>{certificate.ambientTemp}</dd>
            <dt>Relative Humidity</dt>
            <dd>{certificate.relativeHumidity}</dd>
            <dt>Date Calibrated</dt>
            <dd>{formatDate(certificate.dateCalibrated)}</dd>
            <dt>Recommended Due Date</dt>
            <dd>{formatDate(certificate.dueDate)}</dd>
            <dt>Date Received</dt>
            <dd>{formatDate(certificate.dateReceived)}</dd>
          </dl>

          <p>
            The Scientific Standards Services certifies that this instrument was
            calibrated under the environmental conditions stated above using
            reference standard traceable to SI Units as maintained by{" "}
            {certificate.traceability}.
          </p>

          <h5>Method of Calibration</h5>
          <p>
            The instrument was calibrated according to the established SSS
            Standard Calibration Procedure {certificate.procedureNumber} by
            direct comparison to the range stated on the calibration data at the
            time of calibration.
          </p>

          <h5>Reference Standard(s) Used During Calibration</h5>
          <table className="cdm-table cdm-cert-table">
            <thead>
              <tr>
                <th>Standard</th>
                <th>Serial No.</th>
                <th>Certificate No.</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {certificate.standards.map((s, i) => (
                <tr key={s.code}>
                  <td>
                    {i + 1}.{" "}
                    {(s.name || s.code)
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </td>
                  <td>{s.serialNo}</td>
                  <td>{s.certNo}</td>
                  <td>{formatDate(s.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5>Results of Calibration</h5>
          <p>
            The results of calibration are given on the attached calibration
            data. The estimated uncertainty of measurement associated in this
            calibration was determined in accordance with ISO Guide to the
            expression of uncertainty in measurement (GUM) and is within 95%
            level of confidence.
          </p>

          {signBlock}
          <div className="cdm-pageno">Page 1 of 2</div>
        </div>

        {/* ---------------- PAGE 2 : CALIB DATA ---------------- */}
        <div className="cdm-page">
          <div className="cdm-page-head">
            <div className="cdm-org">SCIENTIFIC STANDARDS SERVICES</div>
            {certificate.accreditationLogo !== "none" && (
              <div className="cdm-logo">PAB ACCREDITED</div>
            )}
          </div>
          <div className="cdm-certno">{certificate.jobNumber}</div>
          <h2 className="cdm-title">CALIBRATION DATA</h2>

          <dl className="cdm-dl">
            <dt>Temperature</dt>
            <dd>{inputs.temp}°C</dd>
            <dt>Relative Humidity</dt>
            <dd>{inputs.rh}% RH</dd>
            <dt>Examined At</dt>
            <dd>{inputs.examinedAt}</dd>
            <dt>Range</dt>
            <dd>{calc.range}</dd>
            <dt>Type</dt>
            <dd>{inputs.type}</dd>
            <dt>Ratio</dt>
            <dd>{calc.ratio}</dd>
          </dl>

          <h5>{inputs.heading}</h5>
          <table className="cdm-table cdm-cert-table cdm-center">
            <thead>
              <tr>
                <th>
                  APPLIED VALUE
                  <br />
                  (STD)
                </th>
                <th>
                  EXPECTED VALUE
                  <br />
                  (STD)
                </th>
                <th>
                  INDICATED VALUE
                  <br />
                  (UUT)
                </th>
                <th>CORRECTION</th>
                <th>UNCERTAINTY OF MEASUREMENT</th>
                <th>COVERAGE FACTOR</th>
              </tr>
              <tr className="cdm-units">
                <th>({inputs.stdUnit})</th>
                <th>({unit})</th>
                <th>({unit})</th>
                <th>({unit})</th>
                <th>(± {unit})</th>
                <th>(k)</th>
              </tr>
            </thead>
            <tbody>
              {calc.rows.map((r) => (
                <tr key={r.index}>
                  <td>{r.appliedFmt}</td>
                  <td>{r.expectedFmt}</td>
                  <td>{r.indicatedFmt}</td>
                  <td>{r.correctionFmt}</td>
                  <td>{r.uncertaintyFmt}</td>
                  <td>{r.kFmt}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5>REMARKS:</h5>
          <ol className="cdm-remarks">
            <li>
              The user should determine the suitability of the instrument for
              its intended use.
            </li>
            <li>
              Certain factors may cause the calibration item to drift out of
              calibration before the recommended interval has expired.
            </li>
            <li>
              The calibration results in this certificate refer to the date of
              calibration and should the instrument be modified or damaged in
              anyway, or develop inconsistent readings, the results may not be
              valid.
            </li>
            <li>
              A positive correction is to be added to the unit under test (UUT)
              reading and a negative correction is to be subtracted to the UUT
              reading to give the true value.
            </li>
            <li>
              The results of this certificate refers only to the instrument
              calibrated.
            </li>
          </ol>

          {signBlock}
          <div className="cdm-pageno">Page 2 of 2</div>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div className="cdm-overlay" onClick={onCancel}>
      <div className="cdm-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="cdm-no-print">
          <CdmsModalHeader
            title={
              readOnly
                ? `CERTIFICATE FOR CHECKING — ${job.calibrationProcedure || ""}`
                : `CALIBRATION DATA — ${job.calibrationProcedure || ""}`
            }
            subtitleBottom={`${job.jobNumber}${job.companyName ? " · " + job.companyName : ""}`}
            onClose={onCancel}
          />
        </div>

        {/* Editing tabs are hidden in review mode — the reviewer only sees
            the finished certificate. */}
        {!readOnly && (
          <div className="cdm-tabs cdm-no-print">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? "active" : ""}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="cdm-body">
          {tab === "setup" && setupTab}
          {tab === "readings" && readingsTab}
          {tab === "uncertainty" && uncertaintyTab}
          {tab === "certificate" && certificateTab}
        </div>

        <div className="cdm-footer cdm-no-print">
          <div className="cdm-footer-msg">
            {!readOnly && (
              <span
                className={`cdm-status ${
                  problems.length ? "cdm-status-draft" : "cdm-status-complete"
                }`}
              >
                {problems.length ? "Draft" : "Complete"}
              </span>
            )}
            {!readOnly &&
              problems.length > 0 &&
              (showErrors || allowIncompleteSave) && (
                <ul>
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            {!readOnly &&
              TEMPLATE_QUIRKS.digitalDivisorFromType === false &&
              calc.isDigital && (
                <span className="cdm-hint">
                  Digital type selected: matching the workbook, the divisor
                  stays 1.732 (see TEMPLATE_QUIRKS in calibrationEngine.js).
                </span>
              )}
          </div>
          <div className="cdm-footer-btns">
            {readOnly ? (
              <>
                <button type="button" className="cdm-save" onClick={onConfirm}>
                  {confirmLabel}
                </button>
                <button type="button" onClick={onCancel}>
                  Close
                </button>
              </>
            ) : (
              <>
                <button type="button" className="cdm-save" onClick={handleSave}>
                  Save Calibration Data
                </button>
                <button type="button" onClick={onCancel}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CalibrationDataModal;
