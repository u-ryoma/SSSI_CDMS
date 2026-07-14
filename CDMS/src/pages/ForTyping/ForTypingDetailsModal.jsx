// import React from "react";
// import { createPortal } from "react-dom";
// import "./ForTypingDetailsModal.css";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";

// const STANDARD_COLUMNS = ["item1", "item2"];
// const STANDARD_ROW_COUNT = 5;

// const emptyStandardRow = () => ({ item1: "", item2: "" });

// /**
//  * ForTypingDetailsModal
//  *
//  * Read-only "draft report" review screen shown when a row is clicked in
//  * ForTyping.jsx. Unlike IncomingCalibDetailsModal, this is not an edit
//  * form — it's a snapshot of the job's finalized calibration details for
//  * review before generating/typing the report, so all fields are
//  * disabled. Calibration Standard is shown as a compact 2-column list
//  * (already-assigned codes) instead of the editable sequential-unlock
//  * grid used earlier in the workflow.
//  */
// const ForTypingDetailsModal = ({
//   jobForm,
//   onClose,
//   onOpenCamera,
//   onOpenFolder,
//   onOpenAndUpdateReport,
//   onSaveAndAutoBackup,
//   onOpenCalStandardLookup, // (rowIndex, columnKey) => void
//   onOpenCalProcedureLookup,
// }) => {
//   const calibrationStandards =
//     jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
//       ? jobForm.calibrationStandards
//       : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

//   return createPortal(
//     <div className="ftd-modal-overlay" onClick={onClose}>
//       <div className="ftd-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader
//           title="DRAFT REPORT FOR TYPING"
//           subtitleBottom={jobForm.companyName}
//           onClose={onClose}
//         />

//         <div className="ftd-modal-scroll">
//           <div className="ftd-top-meta">
//             <div className="ftd-meta-row">
//               <label>Job Number</label>
//               <input type="text" value={jobForm.jobNumber || ""} disabled />
//             </div>
//             <div className="ftd-meta-row">
//               <label>Date Received</label>
//               <input type="text" value={jobForm.dateRec || ""} disabled />
//             </div>
//           </div>

//           <div className="ftd-body">
//             {/* LEFT COLUMN */}
//             <div className="ftd-col ftd-col-left">
//               <div className="ftd-field">
//                 <label>Company</label>
//                 <textarea value={jobForm.companyName || ""} rows={2} disabled />
//               </div>
//               <div className="ftd-field">
//                 <label>Description</label>
//                 <div className="ftd-input-with-btn">
//                   <textarea
//                     value={jobForm.description || ""}
//                     rows={2}
//                     disabled
//                   />
//                   <button type="button" className="ftd-lookup-btn" disabled>
//                     🔍
//                   </button>
//                 </div>
//               </div>
//               <div className="ftd-field">
//                 <label>Brand</label>
//                 <input type="text" value={jobForm.brand || ""} disabled />
//               </div>
//               <div className="ftd-field">
//                 <label>Model</label>
//                 <input type="text" value={jobForm.model || ""} disabled />
//               </div>
//               <div className="ftd-field">
//                 <label>Serial No</label>
//                 <input type="text" value={jobForm.serialNo || ""} disabled />
//               </div>
//               <div className="ftd-field">
//                 <label>Remarks</label>
//                 <textarea value={jobForm.remarks || ""} rows={2} disabled />
//               </div>
//             </div>

//             {/* MIDDLE COLUMN */}
//             <div className="ftd-col ftd-col-mid">
//               <div className="ftd-inline-field">
//                 <label>OIC</label>
//                 <input type="text" value={jobForm.evalBy || ""} disabled />
//               </div>
//               <div className="ftd-inline-field">
//                 <label>SIG</label>
//                 <input type="text" value={jobForm.sig || ""} disabled />
//               </div>
//               <div className="ftd-inline-field">
//                 <label>Frequency</label>
//                 <input type="text" value={jobForm.frequency || ""} disabled />
//               </div>
//               <div className="ftd-field">
//                 <label>Con Cert</label>
//                 <div className="ftd-input-with-btn">
//                   <input
//                     type="text"
//                     value={jobForm.contactCert || ""}
//                     disabled
//                   />
//                   <button type="button" className="ftd-lookup-btn" disabled>
//                     🔍
//                   </button>
//                 </div>
//               </div>
//               <div className="ftd-field">
//                 <label>Uncertainty</label>
//                 <textarea value={jobForm.uncertainty || ""} rows={2} disabled />
//               </div>
//               <div className="ftd-field">
//                 <label>Range</label>
//                 <textarea value={jobForm.range || ""} rows={2} disabled />
//               </div>
//               <div className="ftd-field">
//                 <label>Concern</label>
//                 <textarea value={jobForm.concern || ""} rows={2} disabled />
//               </div>
//             </div>

//             {/* DATE / PRIORITY COLUMN */}
//             <div className="ftd-col ftd-col-dates">
//               <div className="ftd-inline-field">
//                 <label>Date Cal</label>
//                 <input type="text" value={jobForm.dateCal || ""} disabled />
//               </div>
//               <div className="ftd-inline-field">
//                 <label>Date Due</label>
//                 <input type="text" value={jobForm.dateDue || ""} disabled />
//               </div>
//               <div className="ftd-inline-field">
//                 <label>Priority</label>
//                 <input type="text" value={jobForm.priority || ""} disabled />
//               </div>
//             </div>

//             {/* CALIBRATION STANDARD (top-right, instead of an image viewer) */}
//             <div className="ftd-col ftd-col-standard">
//               <div className="ftd-box-title">Calibration Standard</div>
//               <div className="ftd-standard-grid">
//                 {calibrationStandards.map((row, idx) => (
//                   <div className="ftd-standard-row" key={idx}>
//                     {STANDARD_COLUMNS.map((col) => (
//                       <div className="ftd-standard-cell" key={col}>
//                         <input type="text" value={row[col] || "-"} disabled />
//                         <button
//                           type="button"
//                           className="ftd-lookup-btn"
//                           onClick={() => onOpenCalStandardLookup?.(idx, col)}
//                         >
//                           🔍
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </div>

//               <div className="ftd-camera-actions">
//                 <button type="button" onClick={onOpenCamera}>
//                   Open Camera
//                 </button>
//                 <button type="button" onClick={onOpenFolder}>
//                   Open Folder
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* ACCREDITATION LOGO + CALIBRATION PROCEDURE */}
//           <div className="ftd-mid-section">
//             <div className="ftd-accreditation-box">
//               <div className="ftd-box-title">Accreditation Logo</div>
//               <label className="ftd-radio-label">
//                 <input
//                   type="radio"
//                   checked={jobForm.accreditationLogo === "with"}
//                   disabled
//                   readOnly
//                 />{" "}
//                 With PAB Logo
//               </label>
//               <label className="ftd-radio-label">
//                 <input
//                   type="radio"
//                   checked={jobForm.accreditationLogo === "none"}
//                   disabled
//                   readOnly
//                 />{" "}
//                 No PAB Logo
//               </label>
//             </div>

//             <div className="ftd-procedure-box">
//               <div className="ftd-box-title">Calibration Procedure :</div>
//               <div className="ftd-input-with-btn">
//                 <input
//                   type="text"
//                   value={jobForm.calibrationProcedure || ""}
//                   disabled
//                 />
//                 <button
//                   type="button"
//                   className="ftd-lookup-btn"
//                   onClick={onOpenCalProcedureLookup}
//                 >
//                   🔍
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* FOOTER ACTIONS */}
//           <div className="ftd-footer">
//             <button
//               type="button"
//               className="ftd-primary-btn"
//               onClick={onOpenAndUpdateReport}
//             >
//               Download and Update Report
//             </button>
//             <div className="ftd-footer-right">
//               <button type="button" onClick={onSaveAndAutoBackup}>
//                 Upload and Auto Backup
//               </button>
//               <button type="button" onClick={onClose}>
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default ForTypingDetailsModal;
import React from "react";
import { createPortal } from "react-dom";
import "./ForTypingDetailsModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";

const STANDARD_COLUMNS = ["item1", "item2"];
const STANDARD_ROW_COUNT = 5;

const emptyStandardRow = () => ({ item1: "", item2: "" });

/**
 * ForTypingDetailsModal
 *
 * Read-only "draft report" review screen. Originally built for
 * ForTyping.jsx, but reused across other post-calibration report stages
 * (e.g. ForCheckingOIC.jsx) via the `title` / button-label props below,
 * since the layout (read-only snapshot of a job's calibration details,
 * plus Calibration Standard grid) is identical at each stage — only the
 * header title and footer action labels change.
 */
const ForTypingDetailsModal = ({
  jobForm,
  onClose,
  onOpenCamera,
  onOpenFolder,
  onOpenAndUpdateReport,
  onSaveAndAutoBackup,
  onOpenCalStandardLookup,
  onOpenCalProcedureLookup,
  title = "DRAFT REPORT FOR TYPING",
  primaryButtonLabel = "Download and Update Report",
  secondaryButtonLabel = "Upload and Auto Backup",
}) => {
  const calibrationStandards =
    jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
      ? jobForm.calibrationStandards
      : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

  return createPortal(
    <div className="ftd-modal-overlay" onClick={onClose}>
      <div className="ftd-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title={title}
          subtitleBottom={jobForm.companyName}
          onClose={onClose}
        />

        <div className="ftd-modal-scroll">
          <div className="ftd-top-meta">
            <div className="ftd-meta-row">
              <label>Job Number</label>
              <input type="text" value={jobForm.jobNumber || ""} disabled />
            </div>
            <div className="ftd-meta-row">
              <label>Date Received</label>
              <input type="text" value={jobForm.dateRec || ""} disabled />
            </div>
          </div>

          <div className="ftd-body">
            {/* LEFT COLUMN */}
            <div className="ftd-col ftd-col-left">
              <div className="ftd-field">
                <label>Company</label>
                <textarea value={jobForm.companyName || ""} rows={2} disabled />
              </div>
              <div className="ftd-field">
                <label>Description</label>
                <div className="ftd-input-with-btn">
                  <textarea
                    value={jobForm.description || ""}
                    rows={2}
                    disabled
                  />
                  <button type="button" className="ftd-lookup-btn" disabled>
                    🔍
                  </button>
                </div>
              </div>
              <div className="ftd-field">
                <label>Brand</label>
                <input type="text" value={jobForm.brand || ""} disabled />
              </div>
              <div className="ftd-field">
                <label>Model</label>
                <input type="text" value={jobForm.model || ""} disabled />
              </div>
              <div className="ftd-field">
                <label>Serial No</label>
                <input type="text" value={jobForm.serialNo || ""} disabled />
              </div>
              <div className="ftd-field">
                <label>Remarks</label>
                <textarea value={jobForm.remarks || ""} rows={2} disabled />
              </div>
            </div>

            {/* MIDDLE COLUMN */}
            <div className="ftd-col ftd-col-mid">
              <div className="ftd-inline-field">
                <label>OIC</label>
                <input type="text" value={jobForm.evalBy || ""} disabled />
              </div>
              <div className="ftd-inline-field">
                <label>SIG</label>
                <input type="text" value={jobForm.sig || ""} disabled />
              </div>
              <div className="ftd-inline-field">
                <label>Frequency</label>
                <input type="text" value={jobForm.frequency || ""} disabled />
              </div>
              <div className="ftd-field">
                <label>Con Cert</label>
                <div className="ftd-input-with-btn">
                  <input
                    type="text"
                    value={jobForm.contactCert || ""}
                    disabled
                  />
                  <button type="button" className="ftd-lookup-btn" disabled>
                    🔍
                  </button>
                </div>
              </div>
              <div className="ftd-field">
                <label>Uncertainty</label>
                <textarea value={jobForm.uncertainty || ""} rows={2} disabled />
              </div>
              <div className="ftd-field">
                <label>Range</label>
                <textarea value={jobForm.range || ""} rows={2} disabled />
              </div>
              <div className="ftd-field">
                <label>Concern</label>
                <textarea value={jobForm.concern || ""} rows={2} disabled />
              </div>
            </div>

            {/* DATE / PRIORITY COLUMN */}
            <div className="ftd-col ftd-col-dates">
              <div className="ftd-inline-field">
                <label>Date Cal</label>
                <input type="text" value={jobForm.dateCal || ""} disabled />
              </div>
              <div className="ftd-inline-field">
                <label>Date Due</label>
                <input type="text" value={jobForm.dateDue || ""} disabled />
              </div>
              <div className="ftd-inline-field">
                <label>Priority</label>
                <input type="text" value={jobForm.priority || ""} disabled />
              </div>
            </div>

            {/* CALIBRATION STANDARD */}
            <div className="ftd-col ftd-col-standard">
              <div className="ftd-box-title">Calibration Standard</div>
              <div className="ftd-standard-grid">
                {calibrationStandards.map((row, idx) => (
                  <div className="ftd-standard-row" key={idx}>
                    {STANDARD_COLUMNS.map((col) => (
                      <div className="ftd-standard-cell" key={col}>
                        <input type="text" value={row[col] || "-"} disabled />
                        <button
                          type="button"
                          className="ftd-lookup-btn"
                          onClick={() => onOpenCalStandardLookup?.(idx, col)}
                        >
                          🔍
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="ftd-camera-actions">
                <button type="button" onClick={onOpenCamera}>
                  Open Camera
                </button>
                <button type="button" onClick={onOpenFolder}>
                  Open Folder
                </button>
              </div>
            </div>
          </div>

          {/* ACCREDITATION LOGO + CALIBRATION PROCEDURE */}
          <div className="ftd-mid-section">
            <div className="ftd-accreditation-box">
              <div className="ftd-box-title">Accreditation Logo</div>
              <label className="ftd-radio-label">
                <input
                  type="radio"
                  checked={jobForm.accreditationLogo === "with"}
                  disabled
                  readOnly
                />{" "}
                With PAB Logo
              </label>
              <label className="ftd-radio-label">
                <input
                  type="radio"
                  checked={jobForm.accreditationLogo === "none"}
                  disabled
                  readOnly
                />{" "}
                No PAB Logo
              </label>
            </div>

            <div className="ftd-procedure-box">
              <div className="ftd-box-title">Calibration Procedure :</div>
              <div className="ftd-input-with-btn">
                <input
                  type="text"
                  value={jobForm.calibrationProcedure || ""}
                  disabled
                />
                <button
                  type="button"
                  className="ftd-lookup-btn"
                  onClick={onOpenCalProcedureLookup}
                >
                  🔍
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="ftd-footer">
            <button
              type="button"
              className="ftd-primary-btn"
              onClick={onOpenAndUpdateReport}
            >
              {primaryButtonLabel}
            </button>
            <div className="ftd-footer-right">
              <button type="button" onClick={onSaveAndAutoBackup}>
                {secondaryButtonLabel}
              </button>
              <button type="button" onClick={onClose}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ForTypingDetailsModal;
