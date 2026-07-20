// import React, { useState } from "react";
// import { createPortal } from "react-dom";
// import "./ForCheckingOICDetailsModal.css";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import ConfirmDialog from "../../components/ConfirmDialog";

// const STANDARD_COLUMNS = ["item1", "item2"];
// const STANDARD_ROW_COUNT = 5;

// const emptyStandardRow = () => ({ item1: "", item2: "" });

// /**
//  * ForCheckingOICDetailsModal
//  *
//  * Read-only "draft report" review screen shown when a row is clicked in
//  * ForCheckingOIC.jsx. Dedicated component (not shared with
//  * ForTypingDetailsModal) so this stage's specific actions — e.g.
//  * approving the report, flagging a concern back to the typist, etc. —
//  * can evolve independently without affecting the ForTyping screen.
//  */
// const ForCheckingOICDetailsModal = ({
//   jobForm,
//   onClose,
//   onOpenCamera,
//   onOpenFolder,
//   onCheckAndSignReport,
//   onUpdate,
//   onLogForRetyping,
//   onOpenCalStandardLookup, // (rowIndex, columnKey) => void
//   onOpenCalProcedureLookup,
//   isUpdateEnabled = false,
// }) => {
//   const calibrationStandards =
//     jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
//       ? jobForm.calibrationStandards
//       : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

//   // ---- Confirm dialog (same pattern as IncomingCalibDetailsModal) ----
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

//   const handleCheckAndSignReportClick = () => {
//     showConfirm(
//       "Check and Sign Report",
//       `Are you sure you want to check and sign the report for Job Number ${jobForm.jobNumber}?`,
//       () => {
//         hideDialog();
//         onCheckAndSignReport?.();
//       },
//       "default",
//     );
//   };

//   const handleUpdateClick = () => {
//     showConfirm(
//       "Confirm Update",
//       `Are you sure you want to update Job Number ${jobForm.jobNumber}?`,
//       () => {
//         hideDialog();
//         onUpdate?.();
//       },
//       "default",
//     );
//   };

//   const handleLogForRetypingClick = () => {
//     showConfirm(
//       "Log for Re-Typing",
//       `Are you sure you want to send Job Number ${jobForm.jobNumber} back for re-typing? This will return it to the typist.`,
//       () => {
//         hideDialog();
//         onLogForRetyping?.();
//       },
//       "danger",
//     );
//   };

//   const handleExitClick = () => {
//     showConfirm(
//       "Confirm Exit",
//       "Are you sure you want to exit this report?",
//       () => {
//         hideDialog();
//         onClose();
//       },
//     );
//   };

//   return createPortal(
//     <div className="foc-modal-overlay" onClick={handleExitClick}>
//       <div className="foc-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader
//           title="DRAFT REPORT FOR CHECKING OIC"
//           subtitleBottom={jobForm.companyName}
//           onClose={handleExitClick}
//         />

//         <div className="foc-modal-scroll">
//           <div className="foc-top-meta">
//             <div className="foc-meta-row">
//               <label>Job Number</label>
//               <input type="text" value={jobForm.jobNumber || ""} disabled />
//             </div>
//             <div className="foc-meta-row">
//               <label>Date Received</label>
//               <input type="text" value={jobForm.dateRec || ""} disabled />
//             </div>
//           </div>

//           <div className="foc-body">
//             {/* LEFT COLUMN */}
//             <div className="foc-col foc-col-left">
//               <div className="foc-field">
//                 <label>Company</label>
//                 <textarea value={jobForm.companyName || ""} rows={2} disabled />
//               </div>
//               <div className="foc-field">
//                 <label>Description</label>
//                 <div className="foc-input-with-btn">
//                   <textarea
//                     value={jobForm.description || ""}
//                     rows={2}
//                     disabled
//                   />
//                   <button type="button" className="foc-lookup-btn" disabled>
//                     🔍
//                   </button>
//                 </div>
//               </div>
//               <div className="foc-field">
//                 <label>Brand</label>
//                 <input type="text" value={jobForm.brand || ""} disabled />
//               </div>
//               <div className="foc-field">
//                 <label>Model</label>
//                 <input type="text" value={jobForm.model || ""} disabled />
//               </div>
//               <div className="foc-field">
//                 <label>Serial No</label>
//                 <input type="text" value={jobForm.serialNo || ""} disabled />
//               </div>
//               <div className="foc-field">
//                 <label>Remarks</label>
//                 <textarea value={jobForm.remarks || ""} rows={2} disabled />
//               </div>
//             </div>

//             {/* MIDDLE COLUMN */}
//             <div className="foc-col foc-col-mid">
//               <div className="foc-inline-field">
//                 <label>OIC</label>
//                 <input type="text" value={jobForm.evalBy || ""} disabled />
//               </div>
//               <div className="foc-inline-field">
//                 <label>SIG</label>
//                 <input type="text" value={jobForm.sig || ""} disabled />
//               </div>
//               <div className="foc-inline-field">
//                 <label>Frequency</label>
//                 <input type="text" value={jobForm.frequency || ""} disabled />
//               </div>
//               <div className="foc-field">
//                 <label>Con Cert</label>
//                 <div className="foc-input-with-btn">
//                   <input
//                     type="text"
//                     value={jobForm.contactCert || ""}
//                     disabled
//                   />
//                   <button type="button" className="foc-lookup-btn" disabled>
//                     🔍
//                   </button>
//                 </div>
//               </div>
//               <div className="foc-field">
//                 <label>Uncertainty</label>
//                 <textarea value={jobForm.uncertainty || ""} rows={2} disabled />
//               </div>
//               <div className="foc-field">
//                 <label>Range</label>
//                 <textarea value={jobForm.range || ""} rows={2} disabled />
//               </div>
//               <div className="foc-field">
//                 <label>Concern</label>
//                 <textarea value={jobForm.concern || ""} rows={2} disabled />
//               </div>
//             </div>

//             {/* DATE / PRIORITY COLUMN */}
//             <div className="foc-col foc-col-dates">
//               <div className="foc-inline-field">
//                 <label>Date Cal</label>
//                 <input type="text" value={jobForm.dateCal || ""} disabled />
//               </div>
//               <div className="foc-inline-field">
//                 <label>Date Due</label>
//                 <input type="text" value={jobForm.dateDue || ""} disabled />
//               </div>
//               <div className="foc-inline-field">
//                 <label>Priority</label>
//                 <input type="text" value={jobForm.priority || ""} disabled />
//               </div>
//             </div>

//             {/* CALIBRATION STANDARD */}
//             <div className="foc-col foc-col-standard">
//               <div className="foc-box-title">Calibration Standard</div>
//               <div className="foc-standard-grid">
//                 {calibrationStandards.map((row, idx) => (
//                   <div className="foc-standard-row" key={idx}>
//                     {STANDARD_COLUMNS.map((col) => (
//                       <div className="foc-standard-cell" key={col}>
//                         <input type="text" value={row[col] || "-"} disabled />
//                         <button
//                           type="button"
//                           className="foc-lookup-btn"
//                           onClick={() => onOpenCalStandardLookup?.(idx, col)}
//                         >
//                           🔍
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </div>

//               <div className="foc-camera-actions">
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
//           <div className="foc-mid-section">
//             <div className="foc-accreditation-box">
//               <div className="foc-box-title">Accreditation Logo</div>
//               <label className="foc-radio-label">
//                 <input
//                   type="radio"
//                   checked={jobForm.accreditationLogo === "with"}
//                   disabled
//                   readOnly
//                 />{" "}
//                 With PAB Logo
//               </label>
//               <label className="foc-radio-label">
//                 <input
//                   type="radio"
//                   checked={jobForm.accreditationLogo === "none"}
//                   disabled
//                   readOnly
//                 />{" "}
//                 No PAB Logo
//               </label>
//             </div>

//             <div className="foc-procedure-box">
//               <div className="foc-box-title">Calibration Procedure :</div>
//               <div className="foc-input-with-btn">
//                 <input
//                   type="text"
//                   value={jobForm.calibrationProcedure || ""}
//                   disabled
//                 />
//                 <button
//                   type="button"
//                   className="foc-lookup-btn"
//                   onClick={onOpenCalProcedureLookup}
//                 >
//                   🔍
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* FOOTER ACTIONS */}
//           <div className="foc-footer">
//             <div className="foc-footer-row">
//               <button
//                 type="button"
//                 className="foc-primary-btn"
//                 onClick={handleCheckAndSignReportClick}
//               >
//                 Check and Sign Report
//               </button>
//               <button
//                 type="button"
//                 onClick={handleUpdateClick}
//                 disabled={!isUpdateEnabled}
//               >
//                 Update
//               </button>
//               <button type="button" onClick={handleExitClick}>
//                 Exit
//               </button>
//             </div>
//             <div className="foc-footer-row foc-footer-row-secondary">
//               <button type="button" onClick={handleLogForRetypingClick}>
//                 Log for Re-Typing
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

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

// export default ForCheckingOICDetailsModal;
import React, { useState } from "react";
import { createPortal } from "react-dom";
import "./ForCheckingOICDetailsModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import ConfirmDialog from "../../components/ConfirmDialog";

const STANDARD_COLUMNS = ["item1", "item2"];
const STANDARD_ROW_COUNT = 5;

const emptyStandardRow = () => ({ item1: "", item2: "" });

/**
 * ForCheckingOICDetailsModal
 *
 * Read-only "draft report" review screen shown when a row is clicked in
 * ForCheckingOIC.jsx. Dedicated component (not shared with
 * ForTypingDetailsModal) so this stage's specific actions — e.g.
 * approving the report, flagging a concern back to the typist, etc. —
 * can evolve independently without affecting the ForTyping screen.
 */
const ForCheckingOICDetailsModal = ({
  jobForm,
  onClose,
  onOpenCamera,
  onOpenFolder,
  onCheckAndSignReport,
  onUpdate,
  onLogForRetyping,
  onOpenCalStandardLookup, // (rowIndex, columnKey) => void
  onOpenCalProcedureLookup,
  isUpdateEnabled = false,
}) => {
  const calibrationStandards =
    jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
      ? jobForm.calibrationStandards
      : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

  // ---- Confirm dialog (same pattern as IncomingCalibDetailsModal) ----
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

  const handleCheckAndSignReportClick = () => {
    showConfirm(
      "Check and Sign Report",
      `Are you sure you want to check and sign the report for Job Number ${jobForm.jobNumber}?`,
      () => {
        hideDialog();
        onCheckAndSignReport?.();
      },
      "default",
    );
  };

  const handleUpdateClick = () => {
    showConfirm(
      "Confirm Update",
      `Are you sure you want to update Job Number ${jobForm.jobNumber}?`,
      () => {
        hideDialog();
        onUpdate?.();
      },
      "default",
    );
  };

  const handleLogForRetypingClick = () => {
    showConfirm(
      "Log for Re-Typing",
      `Are you sure you want to send Job Number ${jobForm.jobNumber} back for re-typing? This will return it to the typist.`,
      () => {
        hideDialog();
        onLogForRetyping?.();
      },
      "danger",
    );
  };

  const handleExitClick = () => {
    showConfirm(
      "Confirm Exit",
      "Are you sure you want to exit this report?",
      () => {
        hideDialog();
        onClose();
      },
    );
  };

  return createPortal(
    <div className="foc-modal-overlay" onClick={handleExitClick}>
      <div className="foc-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title="DRAFT REPORT FOR CHECKING OIC"
          subtitleBottom={jobForm.companyName}
          onClose={handleExitClick}
        />

        <div className="foc-modal-scroll">
          <div className="foc-top-meta">
            <div className="foc-meta-row">
              <label>Job Number</label>
              <input type="text" value={jobForm.jobNumber || ""} disabled />
            </div>
            <div className="foc-meta-row">
              <label>Date Received</label>
              <input type="text" value={jobForm.dateRec || ""} disabled />
            </div>
          </div>

          <div className="foc-body">
            {/* LEFT COLUMN */}
            <div className="foc-col foc-col-left">
              <div className="foc-field">
                <label>Company</label>
                <textarea value={jobForm.companyName || ""} rows={2} disabled />
              </div>
              <div className="foc-field">
                <label>Description</label>
                <div className="foc-input-with-btn">
                  <textarea
                    value={jobForm.description || ""}
                    rows={2}
                    disabled
                  />
                  <button type="button" className="foc-lookup-btn" disabled>
                    🔍
                  </button>
                </div>
              </div>
              <div className="foc-field">
                <label>Brand</label>
                <input type="text" value={jobForm.brand || ""} disabled />
              </div>
              <div className="foc-field">
                <label>Model</label>
                <input type="text" value={jobForm.model || ""} disabled />
              </div>
              <div className="foc-field">
                <label>Serial No</label>
                <input type="text" value={jobForm.serialNo || ""} disabled />
              </div>
              <div className="foc-field">
                <label>Remarks</label>
                <textarea value={jobForm.remarks || ""} rows={2} disabled />
              </div>
            </div>

            {/* MIDDLE COLUMN */}
            <div className="foc-col foc-col-mid">
              <div className="foc-inline-field">
                <label>OIC</label>
                <input type="text" value={jobForm.oicBy || ""} disabled />
              </div>
              <div className="foc-inline-field">
                <label>SIG</label>
                <input type="text" value={jobForm.sig || ""} disabled />
              </div>
              <div className="foc-inline-field">
                <label>Frequency</label>
                <input type="text" value={jobForm.frequency || ""} disabled />
              </div>
              <div className="foc-field">
                <label>Con Cert</label>
                <div className="foc-input-with-btn">
                  <input
                    type="text"
                    value={jobForm.contactCert || ""}
                    disabled
                  />
                  <button type="button" className="foc-lookup-btn" disabled>
                    🔍
                  </button>
                </div>
              </div>
              <div className="foc-field">
                <label>Uncertainty</label>
                <textarea value={jobForm.uncertainty || ""} rows={2} disabled />
              </div>
              <div className="foc-field">
                <label>Range</label>
                <textarea value={jobForm.range || ""} rows={2} disabled />
              </div>
              <div className="foc-field">
                <label>Concern</label>
                <textarea value={jobForm.concern || ""} rows={2} disabled />
              </div>
            </div>

            {/* DATE / PRIORITY COLUMN */}
            <div className="foc-col foc-col-dates">
              <div className="foc-inline-field">
                <label>Date Cal</label>
                <input type="text" value={jobForm.dateCal || ""} disabled />
              </div>
              <div className="foc-inline-field">
                <label>Date Due</label>
                <input type="text" value={jobForm.dateDue || ""} disabled />
              </div>
              <div className="foc-inline-field">
                <label>Priority</label>
                <input type="text" value={jobForm.priority || ""} disabled />
              </div>
            </div>

            {/* CALIBRATION STANDARD */}
            <div className="foc-col foc-col-standard">
              <div className="foc-box-title">Calibration Standard</div>
              <div className="foc-standard-grid">
                {calibrationStandards.map((row, idx) => (
                  <div className="foc-standard-row" key={idx}>
                    {STANDARD_COLUMNS.map((col) => (
                      <div className="foc-standard-cell" key={col}>
                        <input type="text" value={row[col] || "-"} disabled />
                        <button
                          type="button"
                          className="foc-lookup-btn"
                          onClick={() => onOpenCalStandardLookup?.(idx, col)}
                        >
                          🔍
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="foc-camera-actions">
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
          <div className="foc-mid-section">
            <div className="foc-accreditation-box">
              <div className="foc-box-title">Accreditation Logo</div>
              <label className="foc-radio-label">
                <input
                  type="radio"
                  checked={jobForm.accreditationLogo === "with"}
                  disabled
                  readOnly
                />{" "}
                With PAB Logo
              </label>
              <label className="foc-radio-label">
                <input
                  type="radio"
                  checked={jobForm.accreditationLogo === "none"}
                  disabled
                  readOnly
                />{" "}
                No PAB Logo
              </label>
            </div>

            <div className="foc-procedure-box">
              <div className="foc-box-title">Calibration Procedure :</div>
              <div className="foc-input-with-btn">
                <input
                  type="text"
                  value={jobForm.calibrationProcedure || ""}
                  disabled
                />
                <button
                  type="button"
                  className="foc-lookup-btn"
                  onClick={onOpenCalProcedureLookup}
                >
                  🔍
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="foc-footer">
            <div className="foc-footer-row">
              <button
                type="button"
                className="foc-primary-btn"
                onClick={handleCheckAndSignReportClick}
              >
                Check and Sign Report
              </button>
              <button
                type="button"
                onClick={handleUpdateClick}
                disabled={!isUpdateEnabled}
              >
                Update
              </button>
              <button type="button" onClick={handleExitClick}>
                Exit
              </button>
            </div>
            <div className="foc-footer-row foc-footer-row-secondary">
              <button type="button" onClick={handleLogForRetypingClick}>
                Log for Re-Typing
              </button>
            </div>
          </div>
        </div>
      </div>

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

export default ForCheckingOICDetailsModal;
