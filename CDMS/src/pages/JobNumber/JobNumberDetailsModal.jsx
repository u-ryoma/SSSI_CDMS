// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path as needed
// import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
// import "./JobNumberDetailsModal.css";

// // Determine MOR (mode of receipt / "Reception") based on tagging status
// const getMOR = (job) => {
//   if (job.tagged === true) return "In House";
//   if (job.tagged === false) return "On-Site";
//   return "Waiting for Update";
// };

// // Determine job status label based on the most advanced flag set to true
// const getJobStatus = (job) => {
//   if (job.unitDelivered && job.certificateDelivered)
//     return "Job Number Finished";
//   if (job.forPrintFinalTagged) return "Print Final Certificate";
//   if (job.forCheckingSigTagged) return "For Checking SIG";
//   if (job.forCheckingOICTagged) return "For Checking OIC";
//   if (job.forTypingTagged) return "For Typing";
//   if (job.ongoingTagged) return "On-Going Calibration";
//   if (job.tagged && job.concernTagged) return "Incoming Concern";
//   if (job.tagged) return "Incoming Calibration";
//   return "Waiting for Update";
// };

// const formatTimestamp = (iso) => {
//   if (!iso) return "";
//   const d = new Date(iso);
//   if (isNaN(d.getTime())) return iso;
//   return d.toLocaleString();
// };

// const JobNumberDetailsModal = ({
//   job,
//   onClose,
//   onUpdate,
//   onShowCalibrationDetails,
// }) => {
//   const [form, setForm] = useState(job || {});
//   const [saving, setSaving] = useState(false);

//   // FIELD LOCK — opens locked every time; a correct admin password
//   // unlocks editing for the rest of this modal session. Resets to
//   // locked whenever a different job is opened.
//   const [locked, setLocked] = useState(true);
//   const [showAdminPrompt, setShowAdminPrompt] = useState(false);

//   useEffect(() => {
//     setForm(job || {});
//     setLocked(true);
//   }, [job]);

//   if (!job) return null;

//   const handleChange = (field) => (e) => {
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleAdminVerified = () => {
//     setShowAdminPrompt(false);
//     setLocked(false);
//   };

//   const handleUpdateClick = async () => {
//     if (!onUpdate) return;
//     setSaving(true);
//     try {
//       // Only send fields that are confirmed to exist on the jobnumbers
//       // collection today. Joined/read-only fields (companyName,
//       // customerID, companyAddress, contactInfo, contactRec, dateRec,
//       // evalBy, evalOut, DO Unit/Cert info) are intentionally excluded
//       // — they're sourced from receipts/delivery receipts, not
//       // editable here.
//       await onUpdate({
//         jobNumber: job.jobNumber,
//         description: form.description,
//         brand: form.brand,
//         model: form.model,
//         serialNo: form.serialNo,
//         range: form.range,
//         uncertainty: form.uncertainty,
//         remarks: form.remarks,
//         concern: form.concern,
//         contactCert: form.contactCert,
//         frequency: form.frequency,
//         eta: form.eta,
//         priority: form.priority,
//         voltage: form.voltage,
//         dateCal: form.dateCal,
//         dateDue: form.dateDue,
//         sig: form.sig,
//         typedBy: form.typedBy,
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return ReactDOM.createPortal(
//     <div className="jnd-modal-overlay" onClick={onClose}>
//       <div className="jnd-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader title="JOB NUMBER DETAILS" onClose={onClose} />

//         {locked && (
//           <div className="jnd-lock-banner">
//             🔒 Fields are locked. Click anywhere below to enter the admin
//             password and enable editing.
//           </div>
//         )}

//         <div className="jnd-modal-body" style={{ position: "relative" }}>
//           {locked && (
//             <div
//               className="jnd-lock-overlay"
//               onClick={() => setShowAdminPrompt(true)}
//               title="Click to unlock editing (admin password required)"
//             />
//           )}

//           <div className="jnd-grid">
//             {/* LEFT COLUMN */}
//             <div className="jnd-col">
//               <div className="jnd-box">
//                 <div className="jnd-field">
//                   <label>Description</label>
//                   <textarea
//                     rows={3}
//                     value={form.description || ""}
//                     onChange={handleChange("description")}
//                     disabled={locked}
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Brand</label>
//                   <input
//                     type="text"
//                     value={form.brand || ""}
//                     onChange={handleChange("brand")}
//                     disabled={locked}
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Model</label>
//                   <input
//                     type="text"
//                     value={form.model || ""}
//                     onChange={handleChange("model")}
//                     disabled={locked}
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Serial No.</label>
//                   <input
//                     type="text"
//                     value={form.serialNo || ""}
//                     onChange={handleChange("serialNo")}
//                     disabled={locked}
//                   />
//                 </div>
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     {/* GUESS — no confirmed field for Unit Price yet */}
//                     <label>Unit Price</label>
//                     <input
//                       type="text"
//                       value={form.unitPrice || ""}
//                       onChange={handleChange("unitPrice")}
//                       disabled={locked}
//                     />
//                   </div>
//                   <div className="jnd-field">
//                     <label>Freq</label>
//                     <select
//                       value={form.frequency || "1 Year"}
//                       onChange={handleChange("frequency")}
//                       disabled={locked}
//                     >
//                       <option>6 Months</option>
//                       <option>1 Year</option>
//                       <option>2 Years</option>
//                       <option>3 Years</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     {/* Joined — whoever prepared the parent job receipt */}
//                     <label>Eval By</label>
//                     <input type="text" value={job.evalBy || ""} disabled />
//                   </div>
//                   <div className="jnd-field">
//                     <label>ETA</label>
//                     <input
//                       type="date"
//                       value={form.eta || ""}
//                       onChange={handleChange("eta")}
//                       disabled={locked}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* EVAL OUT / DO SECTION — boxed group, fills the space
//                   beneath the job detail box above */}
//               <div className="jnd-box">
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>Eval Out</label>
//                     <input type="text" value={job.evalOut || ""} disabled />
//                   </div>
//                 </div>
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>DO Unit No</label>
//                     <input type="text" value={job.doUnitNo || ""} disabled />
//                   </div>
//                   <div className="jnd-field">
//                     <label>DO Cert No</label>
//                     <input type="text" value={job.doCertNo || ""} disabled />
//                   </div>
//                 </div>
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>DO Unit Date</label>
//                     <input type="text" value={job.doUnitDate || ""} disabled />
//                   </div>
//                   <div className="jnd-field">
//                     <label>DO Cert Date</label>
//                     <input type="text" value={job.doCertDate || ""} disabled />
//                   </div>
//                 </div>
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>DO Unit By</label>
//                     <input type="text" value={job.doUnitBy || ""} disabled />
//                   </div>
//                   <div className="jnd-field">
//                     <label>DO Cert By</label>
//                     <input type="text" value={job.doCertBy || ""} disabled />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* MIDDLE COLUMN */}
//             <div className="jnd-col">
//               <div className="jnd-box">
//                 <div className="jnd-field">
//                   <label>Range</label>
//                   <textarea
//                     rows={2}
//                     value={form.range || ""}
//                     onChange={handleChange("range")}
//                     disabled={locked}
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Std Uncert</label>
//                   <input
//                     type="text"
//                     value={form.uncertainty || ""}
//                     onChange={handleChange("uncertainty")}
//                     disabled={locked}
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Remarks</label>
//                   <textarea
//                     rows={2}
//                     value={form.remarks || ""}
//                     onChange={handleChange("remarks")}
//                     disabled={locked}
//                   />
//                 </div>
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>Date Cal</label>
//                     <input
//                       type="date"
//                       value={form.dateCal || ""}
//                       onChange={handleChange("dateCal")}
//                       disabled={locked}
//                     />
//                   </div>
//                   <div className="jnd-field">
//                     <label>Date Due</label>
//                     <input
//                       type="date"
//                       value={form.dateDue || ""}
//                       onChange={handleChange("dateDue")}
//                       disabled={locked}
//                     />
//                   </div>
//                 </div>

//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>OIC</label>

//                     <input
//                       type="text"
//                       value={job.oicCheckedBy || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="jnd-field">
//                     <label>SIG</label>
//                     <input
//                       type="text"
//                       value={form.sig || ""}
//                       onChange={handleChange("sig")}
//                       disabled={locked}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* REPORT TRACKING SECTION — its own box */}
//               <div className="jnd-box">
//                 <div className="jnd-field">
//                   <label>Report Typed By</label>
//                   <input type="text" value={form.typedBy || ""} disabled />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Draft Report Typed</label>
//                   <input
//                     type="text"
//                     value={formatTimestamp(job.draftReportTypedAt)}
//                     disabled
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Draft Checked OIC by</label>

//                   <input type="text" value={job.oicCheckedBy || ""} disabled />
//                   <label>Draft Checked OIC Date</label>
//                   <input
//                     type="text"
//                     value={formatTimestamp(job.draftCheckedOICAt)}
//                     disabled
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Cert Checked OIC</label>
//                   <input
//                     type="text"
//                     value={formatTimestamp(job.certCheckedOICAt)}
//                     disabled
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Draft Check Signatory by</label>
//                   <input type="text" value={job.sigCheckedBy || ""} disabled />
//                   <label>Draft Check Date</label>
//                   <input
//                     type="text"
//                     value={formatTimestamp(job.draftCheckedSIGAt)}
//                     disabled
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Cert Checked SIG</label>
//                   <input
//                     type="text"
//                     value={formatTimestamp(job.certCheckedSIGAt)}
//                     disabled
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Printed By</label>
//                   <input
//                     type="text"
//                     value={job.finalCertPrintedBy || ""}
//                     disabled
//                   />
//                   <label>Final Cert Printed</label>
//                   <input
//                     type="text"
//                     value={formatTimestamp(job.finalCertPrintedAt)}
//                     disabled
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT COLUMN */}
//             <div className="jnd-col jnd-col-right">
//               <div className="jnd-box">
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>JR ID</label>
//                     <input
//                       type="text"
//                       value={job.jobReceiptID || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="jnd-field">
//                     <label>Job Number</label>
//                     <input type="text" value={job.jobNumber || ""} disabled />
//                   </div>
//                 </div>
//                 <div className="jnd-field-row">
//                   {/* GUESS — no confirmed field for SC ID yet */}
//                   <div className="jnd-field">
//                     <label>SC ID</label>
//                     <input type="text" value={form.scId || ""} disabled />
//                   </div>
//                   <div className="jnd-field">
//                     <label>Date Rec</label>
//                     <input type="text" value={job.dateRec || ""} disabled />
//                   </div>
//                 </div>
//                 <div className="jnd-field-row">
//                   {/* GUESS — no confirmed field for Rec By yet */}
//                   <div className="jnd-field">
//                     <label>Rec By</label>
//                     <input type="text" value={form.recBy || ""} disabled />
//                   </div>
//                   <div className="jnd-field">
//                     <label>Reception</label>
//                     <input type="text" value={getMOR(job)} disabled />
//                   </div>
//                 </div>
//               </div>

//               <div className="jnd-box">
//                 {/* Joined from the parent job receipt (see JobNumber.jsx
//                     fetchJobs) — read-only here since editing wouldn't
//                     update the source receipt. */}
//                 <div className="jnd-field">
//                   <label>CustomerID</label>
//                   <input type="text" value={job.customerID || ""} disabled />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Company Name</label>
//                   <textarea rows={2} value={job.companyName || ""} disabled />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Address</label>
//                   <textarea
//                     rows={2}
//                     value={job.companyAddress || ""}
//                     disabled
//                   />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Contact Info</label>
//                   <textarea rows={2} value={job.contactInfo || ""} disabled />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Contact Rec</label>
//                   <input type="text" value={job.contactRec || ""} disabled />
//                 </div>
//                 <div className="jnd-field">
//                   <label>Contact Cert</label>
//                   <input
//                     type="text"
//                     value={form.contactCert || ""}
//                     onChange={handleChange("contactCert")}
//                     disabled={locked}
//                   />
//                 </div>
//               </div>

//               <div className="jnd-box">
//                 {/* GUESS — SI ID / OR ID not confirmed yet */}
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>SI ID</label>
//                     <input type="text" value={form.siId || ""} disabled />
//                   </div>
//                   <div className="jnd-field">
//                     <label>Tag</label>
//                     <input
//                       type="text"
//                       value={formatTimestamp(job.taggedAt)}
//                       disabled
//                     />
//                   </div>
//                 </div>
//                 <div className="jnd-field-row">
//                   <div className="jnd-field">
//                     <label>OR ID</label>
//                     <input type="text" value={form.orId || ""} disabled />
//                   </div>
//                   <div className="jnd-field">
//                     <label>Priority</label>
//                     <select
//                       value={form.priority || "Normal"}
//                       onChange={handleChange("priority")}
//                       disabled={locked}
//                     >
//                       <option>Normal</option>
//                       <option>Rush</option>
//                       <option>On Hold</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="jnd-field">
//             <label>Remarks Re...</label>
//             <textarea
//               rows={2}
//               value={form.remarksRe || ""}
//               onChange={handleChange("remarksRe")}
//               disabled={locked}
//             />
//           </div>

//           {/* JOB CONCERNS + STATUS */}

//           <div className="jnd-bottom-row">
//             <div className="jnd-field jnd-field-concerns">
//               <label>Job Concerns</label>
//               <textarea
//                 rows={3}
//                 className="jnd-concerns-box"
//                 value={form.concern || ""}
//                 onChange={handleChange("concern")}
//                 disabled={locked}
//               />
//             </div>
//             {onShowCalibrationDetails && (
//               <button
//                 className="jnd-btn"
//                 onClick={() => onShowCalibrationDetails(job)}
//               >
//                 Show Calibration Details
//               </button>
//             )}
//           </div>

//           <div className="jnd-status-row">
//             <input type="text" value={getJobStatus(job)} disabled />
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="jnd-modal-footer">
//           <button className="jnd-btn" disabled>
//             Modification History
//           </button>
//           <button className="jnd-btn">Mark Job Number as PRIORITY</button>
//           <div className="jnd-footer-spacer" />
//           <button className="jnd-btn">Print Tag</button>
//           <button className="jnd-btn">Open Folder</button>
//           <button className="jnd-btn">Open Camera</button>
//           <button className="jnd-btn">Print Folder</button>
//           <button className="jnd-btn">Open Report</button>
//           <button
//             className="jnd-btn jnd-btn-primary"
//             onClick={handleUpdateClick}
//             disabled={saving || locked}
//           >
//             {saving ? "Updating..." : "Update"}
//           </button>
//           <button className="jnd-btn" onClick={onClose}>
//             Exit
//           </button>
//         </div>
//       </div>

//       {/* ADMIN PASSWORD PROMPT — unlocks all fields for this session on success */}
//       {showAdminPrompt && (
//         <AdminPasswordModal
//           onClose={() => setShowAdminPrompt(false)}
//           onVerified={handleAdminVerified}
//         />
//       )}
//     </div>,
//     document.body,
//   );
// };

// export default JobNumberDetailsModal;
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path as needed
import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
import "./JobNumberDetailsModal.css";

// Determine MOR (mode of receipt / "Reception") based on tagging status
const getMOR = (job) => {
  if (job.tagged === true) return "In House";
  if (job.tagged === false) return "On-Site";
  return "Waiting for Update";
};

// Determine job status label based on the most advanced flag set to true
const getJobStatus = (job) => {
  if (job.unitDelivered && job.certificateDelivered)
    return "Job Number Finished";
  if (job.forPrintFinalTagged) return "Print Final Certificate";
  if (job.forCheckingSigTagged) return "For Checking SIG";
  if (job.forCheckingOICTagged) return "For Checking OIC";
  if (job.forTypingTagged) return "For Typing";
  if (job.ongoingTagged) return "On-Going Calibration";
  if (job.tagged && job.concernTagged) return "Incoming Concern";
  if (job.tagged) return "Incoming Calibration";
  return "Waiting for Update";
};

const formatTimestamp = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

const JobNumberDetailsModal = ({
  job,
  onClose,
  onUpdate,
  onShowCalibrationDetails,
}) => {
  const [form, setForm] = useState(job || {});
  const [saving, setSaving] = useState(false);

  // FIELD LOCK — opens locked every time; a correct admin password
  // unlocks editing for the rest of this modal session. Resets to
  // locked whenever a different job is opened.
  const [locked, setLocked] = useState(true);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  useEffect(() => {
    setForm(job || {});
    setLocked(true);
  }, [job]);

  if (!job) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAdminVerified = () => {
    setShowAdminPrompt(false);
    setLocked(false);
  };

  const handleUpdateClick = async () => {
    if (!onUpdate) return;
    setSaving(true);
    try {
      // Only send fields that are confirmed to exist on the jobnumbers
      // collection today. Joined/read-only fields (companyName,
      // customerID, companyAddress, contactInfo, contactRec, dateRec,
      // evalBy, evalOut, DO Unit/Cert info, oicBy, oicCheckedBy) are
      // intentionally excluded — they're sourced from receipts/delivery
      // receipts/earlier pipeline stages, not editable here.
      await onUpdate({
        jobNumber: job.jobNumber,
        description: form.description,
        brand: form.brand,
        model: form.model,
        serialNo: form.serialNo,
        range: form.range,
        uncertainty: form.uncertainty,
        remarks: form.remarks,
        concern: form.concern,
        contactCert: form.contactCert,
        frequency: form.frequency,
        eta: form.eta,
        priority: form.priority,
        voltage: form.voltage,
        dateCal: form.dateCal,
        dateDue: form.dateDue,
        sig: form.sig,
        typedBy: form.typedBy,
      });
    } finally {
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="jnd-modal-overlay" onClick={onClose}>
      <div className="jnd-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader title="JOB NUMBER DETAILS" onClose={onClose} />

        {locked && (
          <div className="jnd-lock-banner">
            🔒 Fields are locked. Click anywhere below to enter the admin
            password and enable editing.
          </div>
        )}

        <div className="jnd-modal-body" style={{ position: "relative" }}>
          {locked && (
            <div
              className="jnd-lock-overlay"
              onClick={() => setShowAdminPrompt(true)}
              title="Click to unlock editing (admin password required)"
            />
          )}

          <div className="jnd-grid">
            {/* LEFT COLUMN */}
            <div className="jnd-col">
              <div className="jnd-box">
                <div className="jnd-field">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={form.description || ""}
                    onChange={handleChange("description")}
                    disabled={locked}
                  />
                </div>
                <div className="jnd-field">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={form.brand || ""}
                    onChange={handleChange("brand")}
                    disabled={locked}
                  />
                </div>
                <div className="jnd-field">
                  <label>Model</label>
                  <input
                    type="text"
                    value={form.model || ""}
                    onChange={handleChange("model")}
                    disabled={locked}
                  />
                </div>
                <div className="jnd-field">
                  <label>Serial No.</label>
                  <input
                    type="text"
                    value={form.serialNo || ""}
                    onChange={handleChange("serialNo")}
                    disabled={locked}
                  />
                </div>
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    {/* GUESS — no confirmed field for Unit Price yet */}
                    <label>Unit Price</label>
                    <input
                      type="text"
                      value={form.unitPrice || ""}
                      onChange={handleChange("unitPrice")}
                      disabled={locked}
                    />
                  </div>
                  <div className="jnd-field">
                    <label>Freq</label>
                    <select
                      value={form.frequency || "1 Year"}
                      onChange={handleChange("frequency")}
                      disabled={locked}
                    >
                      <option>6 Months</option>
                      <option>1 Year</option>
                      <option>2 Years</option>
                      <option>3 Years</option>
                    </select>
                  </div>
                </div>
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    {/* Joined — whoever prepared the parent job receipt */}
                    <label>Eval By</label>
                    <input type="text" value={job.evalBy || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>ETA</label>
                    <input
                      type="date"
                      value={form.eta || ""}
                      onChange={handleChange("eta")}
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* EVAL OUT / DO SECTION — boxed group, fills the space
                  beneath the job detail box above */}
              <div className="jnd-box">
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    <label>Eval Out</label>
                    <input type="text" value={job.evalOut || ""} disabled />
                  </div>
                </div>
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    <label>DO Unit No</label>
                    <input type="text" value={job.doUnitNo || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>DO Cert No</label>
                    <input type="text" value={job.doCertNo || ""} disabled />
                  </div>
                </div>
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    <label>DO Unit Date</label>
                    <input type="text" value={job.doUnitDate || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>DO Cert Date</label>
                    <input type="text" value={job.doCertDate || ""} disabled />
                  </div>
                </div>
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    <label>DO Unit By</label>
                    <input type="text" value={job.doUnitBy || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>DO Cert By</label>
                    <input type="text" value={job.doCertBy || ""} disabled />
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE COLUMN */}
            <div className="jnd-col">
              <div className="jnd-box">
                <div className="jnd-field">
                  <label>Range</label>
                  <textarea
                    rows={2}
                    value={form.range || ""}
                    onChange={handleChange("range")}
                    disabled={locked}
                  />
                </div>
                <div className="jnd-field">
                  <label>Std Uncert</label>
                  <input
                    type="text"
                    value={form.uncertainty || ""}
                    onChange={handleChange("uncertainty")}
                    disabled={locked}
                  />
                </div>
                <div className="jnd-field">
                  <label>Remarks</label>
                  <textarea
                    rows={2}
                    value={form.remarks || ""}
                    onChange={handleChange("remarks")}
                    disabled={locked}
                  />
                </div>
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    <label>Date Cal</label>
                    <input
                      type="date"
                      value={form.dateCal || ""}
                      onChange={handleChange("dateCal")}
                      disabled={locked}
                    />
                  </div>
                  <div className="jnd-field">
                    <label>Date Due</label>
                    <input
                      type="date"
                      value={form.dateDue || ""}
                      onChange={handleChange("dateDue")}
                      disabled={locked}
                    />
                  </div>
                </div>

                <div className="jnd-field-row">
                  <div className="jnd-field">
                    {/* OIC — the assigned OIC who processed Incoming/
                        On-Going Calibration (oicBy). NOT oicCheckedBy,
                        which is who later reviewed the report — that's
                        shown separately below under "Draft Checked OIC
                        by". */}
                    <label>OIC</label>
                    <input type="text" value={job.oicBy || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>SIG</label>
                    <input
                      type="text"
                      value={form.sig || ""}
                      onChange={handleChange("sig")}
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* REPORT TRACKING SECTION — its own box */}
              <div className="jnd-box">
                <div className="jnd-field">
                  <label>Report Typed By</label>
                  <input type="text" value={form.typedBy || ""} disabled />
                </div>
                <div className="jnd-field">
                  <label>Draft Report Typed</label>
                  <input
                    type="text"
                    value={formatTimestamp(job.draftReportTypedAt)}
                    disabled
                  />
                </div>
                <div className="jnd-field">
                  <label>Draft Checked OIC by</label>

                  <input type="text" value={job.oicCheckedBy || ""} disabled />
                  <label>Draft Checked OIC Date</label>
                  <input
                    type="text"
                    value={formatTimestamp(job.draftCheckedOICAt)}
                    disabled
                  />
                </div>
                <div className="jnd-field">
                  <label>Cert Checked OIC</label>
                  <input
                    type="text"
                    value={formatTimestamp(job.certCheckedOICAt)}
                    disabled
                  />
                </div>
                <div className="jnd-field">
                  <label>Draft Check Signatory by</label>
                  <input type="text" value={job.sigCheckedBy || ""} disabled />
                  <label>Draft Check Date</label>
                  <input
                    type="text"
                    value={formatTimestamp(job.draftCheckedSIGAt)}
                    disabled
                  />
                </div>
                <div className="jnd-field">
                  <label>Cert Checked SIG</label>
                  <input
                    type="text"
                    value={formatTimestamp(job.certCheckedSIGAt)}
                    disabled
                  />
                </div>
                <div className="jnd-field">
                  <label>Printed By</label>
                  <input
                    type="text"
                    value={job.finalCertPrintedBy || ""}
                    disabled
                  />
                  <label>Final Cert Printed</label>
                  <input
                    type="text"
                    value={formatTimestamp(job.finalCertPrintedAt)}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="jnd-col jnd-col-right">
              <div className="jnd-box">
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    <label>JR ID</label>
                    <input
                      type="text"
                      value={job.jobReceiptID || ""}
                      disabled
                    />
                  </div>
                  <div className="jnd-field">
                    <label>Job Number</label>
                    <input type="text" value={job.jobNumber || ""} disabled />
                  </div>
                </div>
                <div className="jnd-field-row">
                  {/* GUESS — no confirmed field for SC ID yet */}
                  <div className="jnd-field">
                    <label>SC ID</label>
                    <input type="text" value={form.scId || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>Date Rec</label>
                    <input type="text" value={job.dateRec || ""} disabled />
                  </div>
                </div>
                <div className="jnd-field-row">
                  {/* GUESS — no confirmed field for Rec By yet */}
                  <div className="jnd-field">
                    <label>Rec By</label>
                    <input type="text" value={form.recBy || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>Reception</label>
                    <input type="text" value={getMOR(job)} disabled />
                  </div>
                </div>
              </div>

              <div className="jnd-box">
                {/* Joined from the parent job receipt (see JobNumber.jsx
                    fetchJobs) — read-only here since editing wouldn't
                    update the source receipt. */}
                <div className="jnd-field">
                  <label>CustomerID</label>
                  <input type="text" value={job.customerID || ""} disabled />
                </div>
                <div className="jnd-field">
                  <label>Company Name</label>
                  <textarea rows={2} value={job.companyName || ""} disabled />
                </div>
                <div className="jnd-field">
                  <label>Address</label>
                  <textarea
                    rows={2}
                    value={job.companyAddress || ""}
                    disabled
                  />
                </div>
                <div className="jnd-field">
                  <label>Contact Info</label>
                  <textarea rows={2} value={job.contactInfo || ""} disabled />
                </div>
                <div className="jnd-field">
                  <label>Contact Rec</label>
                  <input type="text" value={job.contactRec || ""} disabled />
                </div>
                <div className="jnd-field">
                  <label>Contact Cert</label>
                  <input
                    type="text"
                    value={form.contactCert || ""}
                    onChange={handleChange("contactCert")}
                    disabled={locked}
                  />
                </div>
              </div>

              <div className="jnd-box">
                {/* GUESS — SI ID / OR ID not confirmed yet */}
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    <label>SI ID</label>
                    <input type="text" value={form.siId || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>Tag</label>
                    <input
                      type="text"
                      value={formatTimestamp(job.taggedAt)}
                      disabled
                    />
                  </div>
                </div>
                <div className="jnd-field-row">
                  <div className="jnd-field">
                    <label>OR ID</label>
                    <input type="text" value={form.orId || ""} disabled />
                  </div>
                  <div className="jnd-field">
                    <label>Priority</label>
                    <select
                      value={form.priority || "Normal"}
                      onChange={handleChange("priority")}
                      disabled={locked}
                    >
                      <option>Normal</option>
                      <option>Rush</option>
                      <option>On Hold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="jnd-field">
            <label>Remarks Re...</label>
            <textarea
              rows={2}
              value={form.remarksRe || ""}
              onChange={handleChange("remarksRe")}
              disabled={locked}
            />
          </div>

          {/* JOB CONCERNS + STATUS */}

          <div className="jnd-bottom-row">
            <div className="jnd-field jnd-field-concerns">
              <label>Job Concerns</label>
              <textarea
                rows={3}
                className="jnd-concerns-box"
                value={form.concern || ""}
                onChange={handleChange("concern")}
                disabled={locked}
              />
            </div>
            {onShowCalibrationDetails && (
              <button
                className="jnd-btn"
                onClick={() => onShowCalibrationDetails(job)}
              >
                Show Calibration Details
              </button>
            )}
          </div>

          <div className="jnd-status-row">
            <input type="text" value={getJobStatus(job)} disabled />
          </div>
        </div>

        {/* FOOTER */}
        <div className="jnd-modal-footer">
          <button className="jnd-btn" disabled>
            Modification History
          </button>
          <button className="jnd-btn">Mark Job Number as PRIORITY</button>
          <div className="jnd-footer-spacer" />
          <button className="jnd-btn">Print Tag</button>
          <button className="jnd-btn">Open Folder</button>
          <button className="jnd-btn">Open Camera</button>
          <button className="jnd-btn">Print Folder</button>
          <button className="jnd-btn">Open Report</button>
          <button
            className="jnd-btn jnd-btn-primary"
            onClick={handleUpdateClick}
            disabled={saving || locked}
          >
            {saving ? "Updating..." : "Update"}
          </button>
          <button className="jnd-btn" onClick={onClose}>
            Exit
          </button>
        </div>
      </div>

      {/* ADMIN PASSWORD PROMPT — unlocks all fields for this session on success */}
      {showAdminPrompt && (
        <AdminPasswordModal
          onClose={() => setShowAdminPrompt(false)}
          onVerified={handleAdminVerified}
        />
      )}
    </div>,
    document.body,
  );
};

export default JobNumberDetailsModal;
