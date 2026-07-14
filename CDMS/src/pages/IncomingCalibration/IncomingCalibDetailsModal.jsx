// import React, { useState, useEffect } from "react";
// import { createPortal } from "react-dom";
// import "./IncomingCalibDetailsModal.css";
// import CdmsModalHeader from "./CdmsModalHeader";
// import CalibrationStandardLookupModal from "./CalibrationStandardLookupModal";
// import ConfirmDialog from "../../components/ConfirmDialog";

// // Rows for the "Calibration Standard" grid (3 item columns x N rows,
// // matching the screenshot). Adjust ROW_COUNT if you need more/less rows.
// const ROW_COUNT = 5;

// const emptyStandardRow = () => ({ item1: "", item2: "", item3: "" });

// // TODO: replace with your real list of certified contacts, or fetch
// // from an API the same way OIC/SIG could be.
// const CONTACT_CERT_OPTIONS = ["SA", "JPR", "MCJ"];

// // Used to auto-calculate Date Due from Date Cal + Frequency.
// const FREQUENCY_MONTHS = {
//   "6 Months": 6,
//   "1 Year": 12,
//   "2 Years": 24,
//   "3 Years": 36,
// };

// const toISODate = (date) => {
//   const d = new Date(date);
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// };

// const addMonths = (isoDateStr, months) => {
//   const d = new Date(isoDateStr);
//   d.setMonth(d.getMonth() + months);
//   return toISODate(d);
// };

// /**
//  * IncomingCalibDetailsModal
//  *
//  * View/process modal for a row clicked in the Incoming Calibration OR
//  * On-Going Calibration table. This is intentionally separate from
//  * JobNumberModal (which is for creating/editing a Job Number record)
//  * because this screen has its own fields: SIG, Date Cal / Date Due,
//  * Accreditation Logo, Calibration Procedure (+ template loading),
//  * Calibration Standard grid, and an image viewer for a photo of the unit.
//  *
//  * The `title` prop lets callers reuse this same modal at different
//  * workflow stages (e.g. "INCOMING CALIBRATION DETAILS" vs
//  * "ON-GOING CALIBRATION DETAILS") without duplicating the component.
//  *
//  * NOTE: sig, dateCal, dateDue, calibrationProcedure, accreditationLogo,
//  * calibrationStandards, and photoUrl are NOT part of the record shape
//  * produced by IncomingCalib.jsx today. They're initialized here from
//  * jobForm if present, otherwise default empty, so you can start wiring
//  * up the backend fields incrementally without this component crashing.
//  */
// const IncomingCalibDetailsModal = ({
//   jobForm,
//   onClose,
//   onUpdate, // (updatedRecord) => void
//   onOpenCamera, // should resolve to an image URL/dataURL
//   onOpenFolder, // should resolve to an image URL/dataURL
//   onLoadTemplate,
//   onLoadAndConnect,
//   onOpenCalProcedureLookup,
//   onOpenCalStandardLookup, // (rowIndex, columnKey) => void
//   title = "INCOMING CALIBRATION DETAILS",
// }) => {
//   const [form, setForm] = useState(() => ({
//     // existing fields already produced by IncomingCalib.jsx
//     jobNumber: jobForm.jobNumber || "",
//     dateRec: jobForm.dateRec || "",
//     companyName: jobForm.companyName || "",
//     description: jobForm.description || "",
//     brand: jobForm.brand || "",
//     model: jobForm.model || "",
//     serialNo: jobForm.serialNo || "",
//     remarks: jobForm.remarks || "",
//     concern: jobForm.concern || "",
//     range: jobForm.range || "",
//     uncertainty: jobForm.uncertainty || "",
//     contactCert: jobForm.contactCert || "",
//     frequency: jobForm.frequency || "1 Year",
//     priority: jobForm.priority || "Normal",
//     evalBy: jobForm.evalBy || "", // shown as "OIC"

//     // new fields this screen introduces
//     sig: jobForm.sig || "",
//     // Date Cal defaults to today if the record doesn't already have one
//     dateCal: jobForm.dateCal || toISODate(new Date()),
//     dateDue: jobForm.dateDue || "",
//     accreditationLogo: jobForm.accreditationLogo || "with", // "with" | "none"
//     calibrationProcedure: jobForm.calibrationProcedure || "",
//     calibrationStandards:
//       jobForm.calibrationStandards?.length === ROW_COUNT
//         ? jobForm.calibrationStandards
//         : Array.from({ length: ROW_COUNT }, emptyStandardRow),
//     photoUrl: jobForm.photoUrl || "",
//   }));

//   // Keep Date Due in sync with Date Cal + Frequency (1 year after Date Cal
//   // by default, or whatever the selected frequency implies).
//   useEffect(() => {
//     if (!form.dateCal) return;
//     const months = FREQUENCY_MONTHS[form.frequency] ?? 12;
//     const computedDue = addMonths(form.dateCal, months);
//     setForm((prev) =>
//       prev.dateDue === computedDue ? prev : { ...prev, dateDue: computedDue },
//     );
//   }, [form.dateCal, form.frequency]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleStandardChange = (rowIndex, columnKey, value) => {
//     setForm((prev) => {
//       const next = [...prev.calibrationStandards];
//       next[rowIndex] = { ...next[rowIndex], [columnKey]: value };
//       return { ...prev, calibrationStandards: next };
//     });
//   };

//   // ---- Confirm dialog (same pattern as JobNumberModal) ----
//   const [dialog, setDialog] = useState({
//     show: false,
//     title: "",
//     message: "",
//     onConfirm: null,
//     onCancel: null,
//     confirmLabel: "Confirm",
//     cancelLabel: "Cancel",
//     type: "default",
//   });

//   const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

//   const showConfirm = (title, message, onConfirm, type = "default") => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm,
//       onCancel: hideDialog,
//       confirmLabel: "Confirm",
//       cancelLabel: "Cancel",
//       type,
//     });
//   };

//   const handleUpdateClick = () => {
//     console.log("Update clicked");
//     showConfirm(
//       "Confirm Update",
//       `Are you sure you want to update Job Number ${form.jobNumber}? This will save the calibration details you've entered.`,
//       () => {
//         hideDialog();
//         onUpdate?.(form);
//       },
//       "default",
//     );
//   };

//   const handleExitClick = () => {
//     showConfirm(
//       "Confirm Exit",
//       "Are you sure you want to exit? Any unsaved changes will be lost.",
//       () => {
//         hideDialog();
//         onClose();
//       },
//     );
//   };

//   // Which Calibration Standard cell (if any) the lookup modal is currently
//   // open for. null = closed.
//   const [standardLookupTarget, setStandardLookupTarget] = useState(null);

//   const openStandardLookup = (rowIndex, columnKey) => {
//     setStandardLookupTarget({ rowIndex, columnKey });
//     onOpenCalStandardLookup?.(rowIndex, columnKey);
//   };

//   const handleUseStandard = (standardRecord) => {
//     if (!standardLookupTarget) return;
//     handleStandardChange(
//       standardLookupTarget.rowIndex,
//       standardLookupTarget.columnKey,
//       standardRecord.code,
//     );
//     setStandardLookupTarget(null);
//   };

//   // Wrap the camera/folder handlers so this component can display
//   // whatever image URL they resolve to, without forcing a particular
//   // implementation on the caller.
//   const handleOpenCamera = async () => {
//     const result = await onOpenCamera?.();
//     if (result) setForm((prev) => ({ ...prev, photoUrl: result }));
//   };

//   const handleOpenFolder = async () => {
//     const result = await onOpenFolder?.();
//     if (result) setForm((prev) => ({ ...prev, photoUrl: result }));
//   };

//   // Contact Cert options: make sure the record's existing value (if any)
//   // still shows up even if it's not in the hardcoded list above.
//   const contactCertOptions = CONTACT_CERT_OPTIONS.includes(form.contactCert)
//     ? CONTACT_CERT_OPTIONS
//     : [form.contactCert, ...CONTACT_CERT_OPTIONS].filter(Boolean);

//   return createPortal(
//     <div className="icd-modal-overlay" onClick={handleExitClick}>
//       <div className="icd-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader
//           title={title}
//           subtitleBottom={form.companyName}
//           onClose={handleExitClick}
//         />

//         <div className="icd-modal-scroll">
//           <div className="icd-body">
//             {/* LEFT COLUMN */}
//             <div className="icd-col icd-col-left">
//               <div className="icd-field">
//                 <label>Company</label>
//                 <textarea
//                   name="companyName"
//                   value={form.companyName}
//                   onChange={handleChange}
//                   rows={3}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Description</label>
//                 <div className="icd-input-with-btn">
//                   <textarea
//                     name="description"
//                     value={form.description}
//                     onChange={handleChange}
//                     rows={3}
//                   />
//                   <button type="button" className="icd-lookup-btn">
//                     🔍
//                   </button>
//                 </div>
//               </div>

//               <div className="icd-field">
//                 <label>Brand</label>
//                 <input
//                   type="text"
//                   name="brand"
//                   value={form.brand}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Model</label>
//                 <input
//                   type="text"
//                   name="model"
//                   value={form.model}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Serial No.</label>
//                 <input
//                   type="text"
//                   name="serialNo"
//                   value={form.serialNo}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Remarks</label>
//                 <textarea
//                   name="remarks"
//                   value={form.remarks}
//                   onChange={handleChange}
//                   rows={2}
//                 />
//               </div>
//             </div>

//             {/* MIDDLE COLUMN */}
//             <div className="icd-col icd-col-mid">
//               <div className="icd-inline-field">
//                 <label>OIC</label>
//                 <select
//                   name="evalBy"
//                   value={form.evalBy}
//                   onChange={handleChange}
//                 >
//                   <option value="">-- Select --</option>
//                   <option>CPGP</option>
//                   <option>SSSI</option>
//                 </select>
//               </div>

//               <div className="icd-inline-field">
//                 <label>SIG</label>
//                 <select name="sig" value={form.sig} onChange={handleChange}>
//                   <option value="">-- Select --</option>
//                   <option>MCJ</option>
//                 </select>
//               </div>

//               <div className="icd-inline-field">
//                 <label>Frequency</label>
//                 <select
//                   name="frequency"
//                   value={form.frequency}
//                   onChange={handleChange}
//                 >
//                   <option>6 Months</option>
//                   <option>1 Year</option>
//                   <option>2 Years</option>
//                   <option>3 Years</option>
//                 </select>
//               </div>

//               <div className="icd-inline-field">
//                 <label>Con Cert</label>
//                 <select
//                   name="contactCert"
//                   value={form.contactCert}
//                   onChange={handleChange}
//                 >
//                   <option value="">-- Select --</option>
//                   {contactCertOptions.map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="icd-field">
//                 <label>Uncertainty</label>
//                 <textarea
//                   name="uncertainty"
//                   value={form.uncertainty}
//                   onChange={handleChange}
//                   rows={2}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Range</label>
//                 <textarea
//                   name="range"
//                   value={form.range}
//                   onChange={handleChange}
//                   rows={3}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Concern</label>
//                 <textarea
//                   name="concern"
//                   value={form.concern}
//                   onChange={handleChange}
//                   rows={3}
//                 />
//               </div>
//             </div>

//             {/* DATE / PRIORITY COLUMN */}
//             <div className="icd-col icd-col-dates">
//               <div className="icd-inline-field">
//                 <label>Date Cal</label>
//                 <input
//                   type="date"
//                   name="dateCal"
//                   value={form.dateCal}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-inline-field">
//                 <label>Date Duc</label>
//                 <input
//                   type="date"
//                   name="dateDue"
//                   value={form.dateDue}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-inline-field">
//                 <label>Priority</label>
//                 <select
//                   name="priority"
//                   value={form.priority}
//                   onChange={handleChange}
//                 >
//                   <option>Normal</option>
//                   <option>Rush</option>
//                   <option>On Hold</option>
//                 </select>
//               </div>
//             </div>

//             {/* IMAGE VIEWER COLUMN */}
//             <div className="icd-col icd-col-image">
//               <div className="icd-meta-row">
//                 <label>Job Number</label>
//                 <input type="text" value={form.jobNumber} disabled />
//               </div>
//               <div className="icd-meta-row">
//                 <label>Date Recevec</label>
//                 <input
//                   type="text"
//                   name="dateRec"
//                   value={form.dateRec}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-image-viewer">
//                 {form.photoUrl ? (
//                   <img src={form.photoUrl} alt="Unit" />
//                 ) : (
//                   <div className="icd-image-placeholder">No Image</div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* ACCREDITATION LOGO + CALIBRATION PROCEDURE */}
//           <div className="icd-mid-section">
//             <div className="icd-accreditation-box">
//               <div className="icd-box-title">Accreditation Logo</div>
//               <label className="icd-radio-label">
//                 <input
//                   type="radio"
//                   name="accreditationLogo"
//                   value="with"
//                   checked={form.accreditationLogo === "with"}
//                   onChange={handleChange}
//                 />{" "}
//                 With PAB Logo
//               </label>
//               <label className="icd-radio-label">
//                 <input
//                   type="radio"
//                   name="accreditationLogo"
//                   value="none"
//                   checked={form.accreditationLogo === "none"}
//                   onChange={handleChange}
//                 />{" "}
//                 No PAB Logo
//               </label>
//             </div>

//             <div className="icd-procedure-box">
//               <div className="icd-box-title">Calibration Procedure :</div>
//               <div className="icd-input-with-btn">
//                 <input
//                   type="text"
//                   name="calibrationProcedure"
//                   value={form.calibrationProcedure}
//                   onChange={handleChange}
//                 />
//                 <button
//                   type="button"
//                   className="icd-lookup-btn"
//                   onClick={onOpenCalProcedureLookup}
//                 >
//                   🔍
//                 </button>
//               </div>
//               <div className="icd-procedure-actions">
//                 <button type="button" onClick={onLoadTemplate}>
//                   LoadTemplate
//                 </button>
//                 <button
//                   type="button"
//                   className="icd-primary-btn"
//                   onClick={onLoadAndConnect}
//                 >
//                   Load & Connect!
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* CALIBRATION STANDARD GRID */}
//           <div className="icd-standard-section">
//             <div className="icd-box-title">Calibration Standard</div>
//             <div className="icd-standard-grid">
//               {(() => {
//                 const columns = ["item1", "item2", "item3"];
//                 // Flatten all cells (row0.item1, row0.item2, row0.item3,
//                 // row1.item1, ...) into one continuous sequence so the
//                 // next textbox anywhere in the grid only unlocks once the
//                 // one immediately before it (in this flattened order) has
//                 // content.
//                 const flatValues = form.calibrationStandards.flatMap((row) =>
//                   columns.map((col) => row[col]),
//                 );

//                 return form.calibrationStandards.map((row, idx) => (
//                   <div className="icd-standard-row" key={idx}>
//                     {columns.map((col, colIdx) => {
//                       const flatIndex = idx * columns.length + colIdx;
//                       const isLocked =
//                         flatIndex > 0 && !flatValues[flatIndex - 1]?.trim();
//                       return (
//                         <div className="icd-standard-cell" key={col}>
//                           <input
//                             type="text"
//                             value={row[col]}
//                             disabled={isLocked}
//                             onChange={(e) =>
//                               handleStandardChange(idx, col, e.target.value)
//                             }
//                           />
//                           <button
//                             type="button"
//                             className="icd-lookup-btn"
//                             disabled={isLocked}
//                             onClick={() => openStandardLookup(idx, col)}
//                           >
//                             🔍
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ));
//               })()}
//             </div>
//           </div>

//           {/* FOOTER ACTIONS */}
//           <div className="icd-footer">
//             <div className="icd-footer-left">
//               <button type="button" onClick={handleOpenCamera}>
//                 Open Camera
//               </button>
//               <button type="button" onClick={handleOpenFolder}>
//                 Open Folder
//               </button>
//             </div>
//             <div className="icd-footer-right">
//               <button type="button">Job Number With Concern</button>
//               <button
//                 type="button"
//                 className="icd-update-btn"
//                 onClick={handleUpdateClick}
//               >
//                 Update
//               </button>
//               <button type="button" onClick={handleExitClick}>
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {standardLookupTarget && (
//         <CalibrationStandardLookupModal
//           onCancel={() => setStandardLookupTarget(null)}
//           onUseStandard={handleUseStandard}
//         />
//       )}
//       {console.log("dialog.show is:", dialog.show)}
//       {dialog.show && (
//         <ConfirmDialog
//           title={dialog.title}
//           message={dialog.message}
//           onConfirm={dialog.onConfirm}
//           onCancel={dialog.onCancel}
//           confirmLabel={dialog.confirmLabel}
//           cancelLabel={dialog.cancelLabel}
//           type={dialog.type}
//         />
//       )}
//     </div>,
//     document.body,
//   );
// };

// export default IncomingCalibDetailsModal;
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./IncomingCalibDetailsModal.css";
import CdmsModalHeader from "./CdmsModalHeader";
import CalibrationStandardLookupModal from "./CalibrationStandardLookUpModal";
import ConfirmDialog from "../../components/ConfirmDialog";

// Rows for the "Calibration Standard" grid (3 item columns x N rows,
// matching the screenshot). Adjust ROW_COUNT if you need more/less rows.
const ROW_COUNT = 5;

const emptyStandardRow = () => ({ item1: "", item2: "", item3: "" });

// TODO: replace with your real list of certified contacts, or fetch
// from an API the same way OIC/SIG could be.
const CONTACT_CERT_OPTIONS = ["SA", "JPR", "MCJ"];

// Used to auto-calculate Date Due from Date Cal + Frequency.
const FREQUENCY_MONTHS = {
  "6 Months": 6,
  "1 Year": 12,
  "2 Years": 24,
  "3 Years": 36,
};

const toISODate = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addMonths = (isoDateStr, months) => {
  const d = new Date(isoDateStr);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
};

/**
 * IncomingCalibDetailsModal
 *
 * View/process modal for a row clicked in the Incoming Calibration OR
 * On-Going Calibration table. This is intentionally separate from
 * JobNumberModal (which is for creating/editing a Job Number record)
 * because this screen has its own fields: SIG, Date Cal / Date Due,
 * Accreditation Logo, Calibration Procedure (+ template loading),
 * Calibration Standard grid, and an image viewer for a photo of the unit.
 *
 * The `title` prop lets callers reuse this same modal at different
 * workflow stages (e.g. "INCOMING CALIBRATION DETAILS" vs
 * "ON-GOING CALIBRATION DETAILS") without duplicating the component.
 *
 * OIC is always the currently logged-in user (from sessionStorage), not
 * a manually-picked value — it reflects whoever is actually processing
 * the job right now.
 *
 * NOTE: sig, dateCal, dateDue, calibrationProcedure, accreditationLogo,
 * calibrationStandards, and photoUrl are NOT part of the record shape
 * produced by IncomingCalib.jsx today. They're initialized here from
 * jobForm if present, otherwise default empty, so you can start wiring
 * up the backend fields incrementally without this component crashing.
 */
const IncomingCalibDetailsModal = ({
  jobForm,
  onClose,
  onUpdate, // (updatedRecord) => void
  onOpenCamera, // should resolve to an image URL/dataURL
  onOpenFolder, // should resolve to an image URL/dataURL
  onLoadTemplate,
  onLoadAndConnect,
  onOpenCalProcedureLookup,
  onOpenCalStandardLookup, // (rowIndex, columnKey) => void
  title = "INCOMING CALIBRATION DETAILS",
}) => {
  const [form, setForm] = useState(() => ({
    // existing fields already produced by IncomingCalib.jsx
    jobNumber: jobForm.jobNumber || "",
    dateRec: jobForm.dateRec || "",
    companyName: jobForm.companyName || "",
    description: jobForm.description || "",
    brand: jobForm.brand || "",
    model: jobForm.model || "",
    serialNo: jobForm.serialNo || "",
    remarks: jobForm.remarks || "",
    concern: jobForm.concern || "",
    range: jobForm.range || "",
    uncertainty: jobForm.uncertainty || "",
    contactCert: jobForm.contactCert || "",
    frequency: jobForm.frequency || "1 Year",
    priority: jobForm.priority || "Normal",
    // OIC is always the logged-in user processing this job right now,
    // not a value carried over from the record or manually picked.
    evalBy: sessionStorage.getItem("name") || "",

    // new fields this screen introduces
    sig: jobForm.sig || "",
    // Date Cal defaults to today if the record doesn't already have one
    dateCal: jobForm.dateCal || toISODate(new Date()),
    dateDue: jobForm.dateDue || "",
    accreditationLogo: jobForm.accreditationLogo || "with", // "with" | "none"
    calibrationProcedure: jobForm.calibrationProcedure || "",
    calibrationStandards:
      jobForm.calibrationStandards?.length === ROW_COUNT
        ? jobForm.calibrationStandards
        : Array.from({ length: ROW_COUNT }, emptyStandardRow),
    photoUrl: jobForm.photoUrl || "",
  }));

  // Keep Date Due in sync with Date Cal + Frequency (1 year after Date Cal
  // by default, or whatever the selected frequency implies).
  useEffect(() => {
    if (!form.dateCal) return;
    const months = FREQUENCY_MONTHS[form.frequency] ?? 12;
    const computedDue = addMonths(form.dateCal, months);
    setForm((prev) =>
      prev.dateDue === computedDue ? prev : { ...prev, dateDue: computedDue },
    );
  }, [form.dateCal, form.frequency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStandardChange = (rowIndex, columnKey, value) => {
    setForm((prev) => {
      const next = [...prev.calibrationStandards];
      next[rowIndex] = { ...next[rowIndex], [columnKey]: value };
      return { ...prev, calibrationStandards: next };
    });
  };

  // ---- Confirm dialog (same pattern as JobNumberModal) ----
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    type: "default",
  });

  const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

  const showConfirm = (title, message, onConfirm, type = "default") => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm,
      onCancel: hideDialog,
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      type,
    });
  };

  const handleUpdateClick = () => {
    console.log("Update clicked");
    showConfirm(
      "Confirm Update",
      `Are you sure you want to update Job Number ${form.jobNumber}? This will save the calibration details you've entered.`,
      () => {
        hideDialog();
        onUpdate?.(form);
      },
      "default",
    );
  };

  const handleExitClick = () => {
    showConfirm(
      "Confirm Exit",
      "Are you sure you want to exit? Any unsaved changes will be lost.",
      () => {
        hideDialog();
        onClose();
      },
    );
  };

  // Which Calibration Standard cell (if any) the lookup modal is currently
  // open for. null = closed.
  const [standardLookupTarget, setStandardLookupTarget] = useState(null);

  const openStandardLookup = (rowIndex, columnKey) => {
    setStandardLookupTarget({ rowIndex, columnKey });
    onOpenCalStandardLookup?.(rowIndex, columnKey);
  };

  const handleUseStandard = (standardRecord) => {
    if (!standardLookupTarget) return;
    handleStandardChange(
      standardLookupTarget.rowIndex,
      standardLookupTarget.columnKey,
      standardRecord.code,
    );
    setStandardLookupTarget(null);
  };

  // Wrap the camera/folder handlers so this component can display
  // whatever image URL they resolve to, without forcing a particular
  // implementation on the caller.
  const handleOpenCamera = async () => {
    const result = await onOpenCamera?.();
    if (result) setForm((prev) => ({ ...prev, photoUrl: result }));
  };

  const handleOpenFolder = async () => {
    const result = await onOpenFolder?.();
    if (result) setForm((prev) => ({ ...prev, photoUrl: result }));
  };

  // Contact Cert options: make sure the record's existing value (if any)
  // still shows up even if it's not in the hardcoded list above.
  const contactCertOptions = CONTACT_CERT_OPTIONS.includes(form.contactCert)
    ? CONTACT_CERT_OPTIONS
    : [form.contactCert, ...CONTACT_CERT_OPTIONS].filter(Boolean);

  return createPortal(
    <div className="icd-modal-overlay" onClick={handleExitClick}>
      <div className="icd-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title={title}
          subtitleBottom={form.companyName}
          onClose={handleExitClick}
        />

        <div className="icd-modal-scroll">
          <div className="icd-body">
            {/* LEFT COLUMN */}
            <div className="icd-col icd-col-left">
              <div className="icd-field">
                <label>Company</label>
                <textarea
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="icd-field">
                <label>Description</label>
                <div className="icd-input-with-btn">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                  <button type="button" className="icd-lookup-btn">
                    🔍
                  </button>
                </div>
              </div>

              <div className="icd-field">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-field">
                <label>Model</label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-field">
                <label>Serial No.</label>
                <input
                  type="text"
                  name="serialNo"
                  value={form.serialNo}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-field">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* MIDDLE COLUMN */}
            <div className="icd-col icd-col-mid">
              <div className="icd-inline-field">
                <label>OIC</label>
                <input type="text" value={form.evalBy} disabled />
              </div>

              <div className="icd-inline-field">
                <label>SIG</label>
                <select name="sig" value={form.sig} onChange={handleChange}>
                  <option value="">-- Select --</option>
                  <option>MCJ</option>
                </select>
              </div>

              <div className="icd-inline-field">
                <label>Frequency</label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                >
                  <option>6 Months</option>
                  <option>1 Year</option>
                  <option>2 Years</option>
                  <option>3 Years</option>
                </select>
              </div>

              <div className="icd-inline-field">
                <label>Con Cert</label>
                <select
                  name="contactCert"
                  value={form.contactCert}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {contactCertOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="icd-field">
                <label>Uncertainty</label>
                <textarea
                  name="uncertainty"
                  value={form.uncertainty}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div className="icd-field">
                <label>Range</label>
                <textarea
                  name="range"
                  value={form.range}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="icd-field">
                <label>Concern</label>
                <textarea
                  name="concern"
                  value={form.concern}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            {/* DATE / PRIORITY COLUMN */}
            <div className="icd-col icd-col-dates">
              <div className="icd-inline-field">
                <label>Date Cal</label>
                <input
                  type="date"
                  name="dateCal"
                  value={form.dateCal}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-inline-field">
                <label>Date Duc</label>
                <input
                  type="date"
                  name="dateDue"
                  value={form.dateDue}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-inline-field">
                <label>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option>Normal</option>
                  <option>Rush</option>
                  <option>On Hold</option>
                </select>
              </div>
            </div>

            {/* IMAGE VIEWER COLUMN */}
            <div className="icd-col icd-col-image">
              <div className="icd-meta-row">
                <label>Job Number</label>
                <input type="text" value={form.jobNumber} disabled />
              </div>
              <div className="icd-meta-row">
                <label>Date Recevec</label>
                <input
                  type="text"
                  name="dateRec"
                  value={form.dateRec}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-image-viewer">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Unit" />
                ) : (
                  <div className="icd-image-placeholder">No Image</div>
                )}
              </div>
            </div>
          </div>

          {/* ACCREDITATION LOGO + CALIBRATION PROCEDURE */}
          <div className="icd-mid-section">
            <div className="icd-accreditation-box">
              <div className="icd-box-title">Accreditation Logo</div>
              <label className="icd-radio-label">
                <input
                  type="radio"
                  name="accreditationLogo"
                  value="with"
                  checked={form.accreditationLogo === "with"}
                  onChange={handleChange}
                />{" "}
                With PAB Logo
              </label>
              <label className="icd-radio-label">
                <input
                  type="radio"
                  name="accreditationLogo"
                  value="none"
                  checked={form.accreditationLogo === "none"}
                  onChange={handleChange}
                />{" "}
                No PAB Logo
              </label>
            </div>

            <div className="icd-procedure-box">
              <div className="icd-box-title">Calibration Procedure :</div>
              <div className="icd-input-with-btn">
                <input
                  type="text"
                  name="calibrationProcedure"
                  value={form.calibrationProcedure}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="icd-lookup-btn"
                  onClick={onOpenCalProcedureLookup}
                >
                  🔍
                </button>
              </div>
              <div className="icd-procedure-actions">
                <button type="button" onClick={onLoadTemplate}>
                  LoadTemplate
                </button>
                <button
                  type="button"
                  className="icd-primary-btn"
                  onClick={onLoadAndConnect}
                >
                  Load & Connect!
                </button>
              </div>
            </div>
          </div>

          {/* CALIBRATION STANDARD GRID */}
          <div className="icd-standard-section">
            <div className="icd-box-title">Calibration Standard</div>
            <div className="icd-standard-grid">
              {(() => {
                const columns = ["item1", "item2", "item3"];
                // Flatten all cells (row0.item1, row0.item2, row0.item3,
                // row1.item1, ...) into one continuous sequence so the
                // next textbox anywhere in the grid only unlocks once the
                // one immediately before it (in this flattened order) has
                // content.
                const flatValues = form.calibrationStandards.flatMap((row) =>
                  columns.map((col) => row[col]),
                );

                return form.calibrationStandards.map((row, idx) => (
                  <div className="icd-standard-row" key={idx}>
                    {columns.map((col, colIdx) => {
                      const flatIndex = idx * columns.length + colIdx;
                      const isLocked =
                        flatIndex > 0 && !flatValues[flatIndex - 1]?.trim();
                      return (
                        <div className="icd-standard-cell" key={col}>
                          <input
                            type="text"
                            value={row[col]}
                            disabled={isLocked}
                            onChange={(e) =>
                              handleStandardChange(idx, col, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="icd-lookup-btn"
                            disabled={isLocked}
                            onClick={() => openStandardLookup(idx, col)}
                          >
                            🔍
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="icd-footer">
            <div className="icd-footer-left">
              <button type="button" onClick={handleOpenCamera}>
                Open Camera
              </button>
              <button type="button" onClick={handleOpenFolder}>
                Open Folder
              </button>
            </div>
            <div className="icd-footer-right">
              <button type="button">Job Number With Concern</button>
              <button
                type="button"
                className="icd-update-btn"
                onClick={handleUpdateClick}
              >
                Update
              </button>
              <button type="button" onClick={handleExitClick}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {standardLookupTarget && (
        <CalibrationStandardLookupModal
          onCancel={() => setStandardLookupTarget(null)}
          onUseStandard={handleUseStandard}
        />
      )}
      {dialog.show && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          type={dialog.type}
        />
      )}
    </div>,
    document.body,
  );
};

export default IncomingCalibDetailsModal;
