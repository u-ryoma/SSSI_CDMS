// import React, { useState } from "react";
// import { createPortal } from "react-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";

// const JobNumberModal = ({
//   onClose,
//   onSave,
//   onCancel,
//   jobForm,
//   onJobChange,
//   onJobTypeChange,
//   jobReceiptID,
//   onOpenInstrumentList,
//   onOpenRecall,
//   isEditing,
// }) => {
//   const [errors, setErrors] = useState({});
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
//   const emptyJobForm = {
//     // ...other fields
//     type: "", // not "mechanical"
//   };
//   const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

//   const showConfirm = (title, message, onConfirm, type = "danger") => {
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

//   const showSuccess = (title, message, onConfirm) => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm: onConfirm || hideDialog,
//       onCancel: null,
//       confirmLabel: "OK",
//       cancelLabel: null,
//       type: "default",
//     });
//   };

//   // VALIDATE JOB NUMBER FIELDS
//   const validate = () => {
//     const newErrors = {};

//     if (!jobForm.description?.trim())
//       newErrors.description = "Description is required.";
//     if (!jobForm.brand?.trim()) newErrors.brand = "Brand is required.";
//     if (!jobForm.model?.trim()) newErrors.model = "Model is required.";
//     if (!jobForm.serialNo?.trim())
//       newErrors.serialNo = "Serial No. is required.";
//     if (!jobForm.range?.trim()) newErrors.range = "Range is required.";
//     if (!jobForm.eta?.trim()) newErrors.eta = "ETA is required.";
//     else {
//       const today = new Date().toISOString().split("T")[0];
//       if (jobForm.eta < today)
//         newErrors.eta = "ETA must be today or a future date.";
//     }
//     if (!jobForm.evalBy?.trim()) newErrors.evalBy = "Eval By is required.";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveClick = () => {
//     if (!validate()) {
//       showSuccess(
//         "Incomplete Form",
//         "Please fill in all required fields before saving.",
//         hideDialog,
//       );
//       return;
//     }
//     showConfirm(
//       "Confirm Save",
//       `Are you sure you want to save Job Number ${jobForm.jobNumber}?`,
//       () => {
//         hideDialog();
//         onSave();
//       },
//       "default",
//     );
//   };

//   const handleCancelClick = () => {
//     showConfirm(
//       "Cancel Job Number",
//       `Are you sure you want to cancel/remove Job Number ${jobForm.jobNumber}? This cannot be undone.`,
//       () => {
//         hideDialog();
//         onCancel();
//       },
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

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={handleExitClick}>
//       <div className="jn-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         {/* FIXED HEADER */}
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">JOB NUMBER DETAILS</span>
//               <span className="jr-modal-title-sub">{jobForm.jobNumber}</span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={handleExitClick}>
//             ✕
//           </button>
//         </div>

//         {/* SCROLLABLE CONTENT */}
//         <div className="jn-modal-scroll">
//           <div className="jn-top-row">
//             <div className="jn-top-right">
//               <div className="jn-info-row">
//                 <label>Job Number</label>
//                 <input
//                   type="text"
//                   value={jobForm.jobNumber}
//                   disabled
//                   className="jr-input-auto"
//                 />
//               </div>
//               <div className="jn-info-row">
//                 <label>Job Receipt ID</label>
//                 <input
//                   type="text"
//                   value={jobReceiptID}
//                   disabled
//                   className="jr-input-auto"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="jn-form-body">
//             <div className="jn-form-left">
//               <div className="jr-field-row">
//                 <label>
//                   Description{" "}
//                   {errors.description && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <div
//                   className="jr-input-with-btn"
//                   style={{ flex: 1, minWidth: 0 }}
//                 >
//                   <textarea
//                     name="description"
//                     value={jobForm.description}
//                     onChange={onJobChange}
//                     style={{ flex: 1, minHeight: "60px", minWidth: 0 }}
//                     className={errors.description ? "jr-input-error" : ""}
//                   />
//                   <button
//                     className="jr-lookup-btn"
//                     title="Instrument List"
//                     onClick={onOpenInstrumentList}
//                   >
//                     📋
//                   </button>
//                 </div>
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Brand{" "}
//                   {errors.brand && <span className="jr-error">*required</span>}
//                 </label>
//                 <input
//                   type="text"
//                   name="brand"
//                   value={jobForm.brand}
//                   onChange={onJobChange}
//                   className={errors.brand ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Model{" "}
//                   {errors.model && <span className="jr-error">*required</span>}
//                 </label>
//                 <input
//                   type="text"
//                   name="model"
//                   value={jobForm.model}
//                   onChange={onJobChange}
//                   className={errors.model ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Serial No.{" "}
//                   {errors.serialNo && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <input
//                   type="text"
//                   name="serialNo"
//                   value={jobForm.serialNo}
//                   onChange={onJobChange}
//                   className={errors.serialNo ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Remarks</label>
//                 <textarea
//                   name="remarks"
//                   value={jobForm.remarks}
//                   onChange={onJobChange}
//                   style={{ minHeight: "50px" }}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Concern</label>
//                 <textarea
//                   name="concern"
//                   value={jobForm.concern}
//                   onChange={onJobChange}
//                   style={{ minHeight: "50px" }}
//                 />
//               </div>
//             </div>

//             <div className="jn-form-right">
//               <div className="jr-field-row">
//                 <label>
//                   Range{" "}
//                   {errors.range && <span className="jr-error">*required</span>}
//                 </label>
//                 <textarea
//                   name="range"
//                   value={jobForm.range}
//                   onChange={onJobChange}
//                   style={{ minHeight: "60px" }}
//                   className={errors.range ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Uncertainty</label>
//                 <input
//                   type="text"
//                   name="uncertainty"
//                   value={jobForm.uncertainty}
//                   onChange={onJobChange}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Contact Cert</label>
//                 <div
//                   className="jr-input-with-btn"
//                   style={{ flex: 1, minWidth: 0 }}
//                 >
//                   <input
//                     type="text"
//                     name="contactCert"
//                     value={jobForm.contactCert}
//                     onChange={onJobChange}
//                     style={{ flex: 1 }}
//                   />
//                   <button className="jr-lookup-btn">📋</button>
//                 </div>
//               </div>
//               <div className="jn-inline-row">
//                 <label>Frequency</label>
//                 <select
//                   name="frequency"
//                   value={jobForm.frequency}
//                   onChange={onJobChange}
//                 >
//                   <option>6 Months</option>
//                   <option>1 Year</option>
//                   <option>2 Years</option>
//                   <option>3 Years</option>
//                 </select>
//                 <label>
//                   ETA{" "}
//                   {errors.eta && (
//                     <span className="jr-error">*{errors.eta}</span>
//                   )}
//                 </label>
//                 <input
//                   type="date"
//                   name="eta"
//                   value={jobForm.eta}
//                   onChange={onJobChange}
//                   className={errors.eta ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jn-inline-row">
//                 <label>
//                   Eval By{" "}
//                   {errors.evalBy && <span className="jr-error">*required</span>}
//                 </label>
//                 <select
//                   name="evalBy"
//                   value={jobForm.evalBy}
//                   onChange={onJobChange}
//                   className={errors.evalBy ? "jr-input-error" : ""}
//                 >
//                   <option value="">-- Select --</option>
//                   <option>CPGP</option>
//                   <option>SSSI</option>
//                 </select>
//                 <label>Priority</label>
//                 <select
//                   name="priority"
//                   value={jobForm.priority}
//                   onChange={onJobChange}
//                 >
//                   <option>Normal</option>
//                   <option>Rush</option>
//                   <option>On Hold</option>
//                 </select>
//               </div>
//               <div className="jn-inline-row">
//                 <label>Voltage</label>
//                 <select
//                   name="voltage"
//                   value={jobForm.voltage}
//                   onChange={onJobChange}
//                 >
//                   <option>-</option>
//                   <option>110V</option>
//                   <option>220V</option>
//                 </select>
//               </div>
//               {/* TYPE SELECTOR */}
//               <div className="jn-type-row">
//                 <label className="jr-radio-label">
//                   <input
//                     type="radio"
//                     name="jobType"
//                     value="mechanical"
//                     checked={jobForm.type === "mechanical"}
//                     onChange={onJobTypeChange}
//                   />{" "}
//                   Mechanical (SSS)
//                 </label>
//                 <label className="jr-radio-label">
//                   <input
//                     type="radio"
//                     name="jobType"
//                     value="electrical"
//                     checked={jobForm.type === "electrical"}
//                     onChange={onJobTypeChange}
//                   />{" "}
//                   Electrical (SSE)
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="jn-modal-actions">
//             <div className="jr-modal-actions-left">
//               <button className="jr-action-btn">Open Camera</button>
//               <button className="jr-action-btn">Open Folder</button>
//             </div>
//             <div className="jr-modal-actions-right">
//               <button className="jr-action-btn" onClick={onOpenRecall}>
//                 Recall Job Number
//               </button>
//               <button
//                 className="jr-action-btn"
//                 onClick={isEditing ? handleCancelClick : undefined}
//                 disabled={!isEditing}
//                 style={
//                   !isEditing ? { opacity: 0.5, cursor: "not-allowed" } : {}
//                 }
//               >
//                 Cancel Job Number
//               </button>
//               <button className="jr-save-btn" onClick={handleSaveClick}>
//                 Save
//               </button>
//               <button className="jr-action-btn" onClick={handleExitClick}>
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CONFIRM DIALOG */}
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

// export default JobNumberModal;
import React, { useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../../components/ConfirmDialog";

const JobNumberModal = ({
  onClose,
  onSave,
  onCancel,
  jobForm,
  onJobChange,
  onJobTypeChange,
  jobReceiptID,
  onOpenInstrumentList,
  onOpenRecall,
  isEditing,
  reservingNumber,
}) => {
  const [errors, setErrors] = useState({});
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

  const showConfirm = (title, message, onConfirm, type = "danger") => {
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

  const showSuccess = (title, message, onConfirm) => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm: onConfirm || hideDialog,
      onCancel: null,
      confirmLabel: "OK",
      cancelLabel: null,
      type: "default",
    });
  };

  // VALIDATE JOB NUMBER FIELDS
  const validate = () => {
    const newErrors = {};

    if (!jobForm.type)
      newErrors.type = "Please select Mechanical or Electrical.";
    if (!jobForm.description?.trim())
      newErrors.description = "Description is required.";
    if (!jobForm.brand?.trim()) newErrors.brand = "Brand is required.";
    if (!jobForm.model?.trim()) newErrors.model = "Model is required.";
    if (!jobForm.serialNo?.trim())
      newErrors.serialNo = "Serial No. is required.";
    if (!jobForm.range?.trim()) newErrors.range = "Range is required.";
    if (!jobForm.eta?.trim()) newErrors.eta = "ETA is required.";
    else {
      const today = new Date().toISOString().split("T")[0];
      if (jobForm.eta < today)
        newErrors.eta = "ETA must be today or a future date.";
    }
    if (!jobForm.evalBy?.trim()) newErrors.evalBy = "Eval By is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (!validate()) {
      showSuccess(
        "Incomplete Form",
        "Please fill in all required fields before saving.",
        hideDialog,
      );
      return;
    }
    showConfirm(
      "Confirm Save",
      `Are you sure you want to save Job Number ${jobForm.jobNumber}?`,
      () => {
        hideDialog();
        onSave();
      },
      "default",
    );
  };

  const handleCancelClick = () => {
    showConfirm(
      "Cancel Job Number",
      `Are you sure you want to cancel/remove Job Number ${jobForm.jobNumber}? This cannot be undone.`,
      () => {
        hideDialog();
        onCancel();
      },
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

  return createPortal(
    <div className="jr-modal-overlay" onClick={handleExitClick}>
      <div className="jn-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* FIXED HEADER */}
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">JOB NUMBER DETAILS</span>
              <span className="jr-modal-title-sub">
                {jobForm.jobNumber || "Select a type to assign a number"}
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={handleExitClick}>
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="jn-modal-scroll">
          <div className="jn-top-row">
            <div className="jn-top-right">
              <div className="jn-info-row">
                <label>Job Number</label>
                <input
                  type="text"
                  value={
                    reservingNumber ? "Reserving..." : jobForm.jobNumber || ""
                  }
                  disabled
                  className="jr-input-auto"
                />
              </div>
              <div className="jn-info-row">
                <label>Job Receipt ID</label>
                <input
                  type="text"
                  value={jobReceiptID}
                  disabled
                  className="jr-input-auto"
                />
              </div>
            </div>
          </div>

          <div className="jn-form-body">
            <div className="jn-form-left">
              <div className="jr-field-row">
                <label>
                  Description{" "}
                  {errors.description && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <div
                  className="jr-input-with-btn"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <textarea
                    name="description"
                    value={jobForm.description}
                    onChange={onJobChange}
                    style={{ flex: 1, minHeight: "60px", minWidth: 0 }}
                    className={errors.description ? "jr-input-error" : ""}
                  />
                  <button
                    className="jr-lookup-btn"
                    title="Instrument List"
                    onClick={onOpenInstrumentList}
                  >
                    📋
                  </button>
                </div>
              </div>
              <div className="jr-field-row">
                <label>
                  Brand{" "}
                  {errors.brand && <span className="jr-error">*required</span>}
                </label>
                <input
                  type="text"
                  name="brand"
                  value={jobForm.brand}
                  onChange={onJobChange}
                  className={errors.brand ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>
                  Model{" "}
                  {errors.model && <span className="jr-error">*required</span>}
                </label>
                <input
                  type="text"
                  name="model"
                  value={jobForm.model}
                  onChange={onJobChange}
                  className={errors.model ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>
                  Serial No.{" "}
                  {errors.serialNo && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <input
                  type="text"
                  name="serialNo"
                  value={jobForm.serialNo}
                  onChange={onJobChange}
                  className={errors.serialNo ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={jobForm.remarks}
                  onChange={onJobChange}
                  style={{ minHeight: "50px" }}
                />
              </div>
              <div className="jr-field-row">
                <label>Concern</label>
                <textarea
                  name="concern"
                  value={jobForm.concern}
                  onChange={onJobChange}
                  style={{ minHeight: "50px" }}
                />
              </div>
            </div>

            <div className="jn-form-right">
              <div className="jr-field-row">
                <label>
                  Range{" "}
                  {errors.range && <span className="jr-error">*required</span>}
                </label>
                <textarea
                  name="range"
                  value={jobForm.range}
                  onChange={onJobChange}
                  style={{ minHeight: "60px" }}
                  className={errors.range ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>Uncertainty</label>
                <input
                  type="text"
                  name="uncertainty"
                  value={jobForm.uncertainty}
                  onChange={onJobChange}
                />
              </div>
              <div className="jr-field-row">
                <label>Contact Cert</label>
                <div
                  className="jr-input-with-btn"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <input
                    type="text"
                    name="contactCert"
                    value={jobForm.contactCert}
                    onChange={onJobChange}
                    style={{ flex: 1 }}
                  />
                  <button className="jr-lookup-btn">📋</button>
                </div>
              </div>
              <div className="jn-inline-row">
                <label>Frequency</label>
                <select
                  name="frequency"
                  value={jobForm.frequency}
                  onChange={onJobChange}
                >
                  <option>6 Months</option>
                  <option>1 Year</option>
                  <option>2 Years</option>
                  <option>3 Years</option>
                </select>
                <label>
                  ETA{" "}
                  {errors.eta && (
                    <span className="jr-error">*{errors.eta}</span>
                  )}
                </label>
                <input
                  type="date"
                  name="eta"
                  value={jobForm.eta}
                  onChange={onJobChange}
                  className={errors.eta ? "jr-input-error" : ""}
                />
              </div>
              <div className="jn-inline-row">
                <label>
                  Eval By{" "}
                  {errors.evalBy && <span className="jr-error">*required</span>}
                </label>
                <select
                  name="evalBy"
                  value={jobForm.evalBy}
                  onChange={onJobChange}
                  className={errors.evalBy ? "jr-input-error" : ""}
                >
                  <option value="">-- Select --</option>
                  <option>CPGP</option>
                  <option>SSSI</option>
                </select>
                <label>Priority</label>
                <select
                  name="priority"
                  value={jobForm.priority}
                  onChange={onJobChange}
                >
                  <option>Normal</option>
                  <option>Rush</option>
                  <option>On Hold</option>
                </select>
              </div>
              <div className="jn-inline-row">
                <label>Voltage</label>
                <select
                  name="voltage"
                  value={jobForm.voltage}
                  onChange={onJobChange}
                >
                  <option>-</option>
                  <option>110V</option>
                  <option>220V</option>
                </select>
              </div>
              {/* TYPE SELECTOR */}
              <div className="jn-type-row">
                <label className="jr-radio-label">
                  <input
                    type="radio"
                    name="jobType"
                    value="mechanical"
                    checked={jobForm.type === "mechanical"}
                    onChange={onJobTypeChange}
                    disabled={reservingNumber}
                  />{" "}
                  Mechanical (SSS)
                </label>
                <label className="jr-radio-label">
                  <input
                    type="radio"
                    name="jobType"
                    value="electrical"
                    checked={jobForm.type === "electrical"}
                    onChange={onJobTypeChange}
                    disabled={reservingNumber}
                  />{" "}
                  Electrical (SSE)
                </label>
                {errors.type && (
                  <span className="jr-error">*{errors.type}</span>
                )}
              </div>
            </div>
          </div>

          <div className="jn-modal-actions">
            <div className="jr-modal-actions-left">
              <button className="jr-action-btn">Open Camera</button>
              <button className="jr-action-btn">Open Folder</button>
            </div>
            <div className="jr-modal-actions-right">
              <button className="jr-action-btn" onClick={onOpenRecall}>
                Recall Job Number
              </button>
              <button
                className="jr-action-btn"
                onClick={isEditing ? handleCancelClick : undefined}
                disabled={!isEditing}
                style={
                  !isEditing ? { opacity: 0.5, cursor: "not-allowed" } : {}
                }
              >
                Cancel Job Number
              </button>
              <button className="jr-save-btn" onClick={handleSaveClick}>
                Save
              </button>
              <button className="jr-action-btn" onClick={handleExitClick}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DIALOG */}
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

export default JobNumberModal;
