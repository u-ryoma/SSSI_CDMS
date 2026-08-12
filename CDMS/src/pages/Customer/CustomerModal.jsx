// import React, { useState } from "react";
// import { createPortal } from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import "./CustomerModal.css";

// // Job Number + Equipment + current process/stage, per the simplified
// // table design. Data comes from GET /api/customers/:customerID/jobs,
// // fetched by the parent (Customer.jsx) and passed down as `jobs`.
// const CustomerJobsTable = ({ jobs, loading }) => (
//   <div className="cm-jobs-section">
//     {loading ? (
//       <p className="cm-jobs-loading">Loading jobs...</p>
//     ) : jobs.length === 0 ? (
//       <p className="cm-jobs-empty">No jobs found for this customer.</p>
//     ) : (
//       <div className="cm-jobs-table-wrapper">
//         <table className="cm-jobs-table">
//           <thead>
//             <tr>
//               <th>Job Number</th>
//               <th>Equipment</th>
//               <th>Serial No.</th>
//               <th>Model</th>
//               <th>Job Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {jobs.map((job) => (
//               <tr key={job.jobNumber}>
//                 <td>{job.jobNumber}</td>
//                 <td>{job.equipmentName || "—"}</td>
//                 <td>{job.serialNumber || "—"}</td>
//                 <td>{job.model || "—"}</td>
//                 <td>
//                   <span
//                     className={`cm-stage-badge cm-stage-${job.stage
//                       .replace(/\s+/g, "-")
//                       .toLowerCase()}`}
//                   >
//                     {job.stage}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     )}
//   </div>
// );
// const CustomerModal = ({
//   selectedCustomer,
//   formData,
//   jobs,
//   jobsLoading,
//   onClose,
//   onSubmit,
//   onDelete,
//   onChangeField,
//   onContactChange,
//   onAddContact,
//   onRemoveContact,
// }) => {
//   const [activeContactIndex, setActiveContactIndex] = useState(0);
//   const [manageContactsOpen, setManageContactsOpen] = useState(false);

//   const contactNames = formData.contactNames?.length
//     ? formData.contactNames
//     : [""];

//   return createPortal(
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="cm-box" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader
//           title="EDIT CUSTOMER"
//           subtitleBottom={
//             selectedCustomer?.customerID
//               ? `Customer ID: ${selectedCustomer.customerID}`
//               : undefined
//           }
//           onClose={onClose}
//         />

//         <div className="cm-content">
//           <form onSubmit={onSubmit}>
//             <div className="cm-grid">
//               {/* LEFT COLUMN */}
//               <div className="cm-col">
//                 <div className="cm-field">
//                   <label>Company Name</label>
//                   <input
//                     type="text"
//                     name="companyName"
//                     value={formData.companyName}
//                     onChange={onChangeField}
//                     required
//                   />
//                 </div>

//                 <div className="cm-field">
//                   <label>Address</label>
//                   <textarea
//                     name="companyAddress"
//                     value={formData.companyAddress}
//                     onChange={onChangeField}
//                     required
//                   />
//                 </div>

//                 <div className="cm-field">
//                   <label>Contact Info</label>
//                   <input
//                     type="text"
//                     name="phoneNumber"
//                     value={formData.phoneNumber}
//                     onChange={onChangeField}
//                   />
//                 </div>

//                 <div className="cm-field">
//                   <label>VAT</label>
//                   <input
//                     type="text"
//                     name="vat"
//                     value={formData.vat}
//                     onChange={onChangeField}
//                   />
//                 </div>

//                 <div className="cm-field">
//                   <label>Contact Name</label>
//                   <div className="cm-contact-row">
//                     <select
//                       value={activeContactIndex}
//                       onChange={(e) =>
//                         setActiveContactIndex(Number(e.target.value))
//                       }
//                     >
//                       {contactNames.map((name, i) => (
//                         <option key={i} value={i}>
//                           {name || `Contact ${i + 1}`}
//                         </option>
//                       ))}
//                     </select>
//                     <button
//                       type="button"
//                       className="cm-manage-contacts-btn"
//                       title="Manage contacts"
//                       onClick={() => setManageContactsOpen((v) => !v)}
//                     >
//                       ✎
//                     </button>
//                   </div>

//                   {manageContactsOpen && (
//                     <div className="cm-contact-editor">
//                       {contactNames.map((contact, index) => (
//                         <div key={index} className="cm-contact-editor-row">
//                           <input
//                             type="text"
//                             placeholder={`Contact Name ${index + 1}`}
//                             value={contact}
//                             onChange={(e) =>
//                               onContactChange(index, e.target.value)
//                             }
//                           />
//                           {contactNames.length > 1 && (
//                             <button
//                               type="button"
//                               className="cm-remove-contact-btn"
//                               onClick={() => {
//                                 onRemoveContact(index);
//                                 if (
//                                   activeContactIndex >= index &&
//                                   activeContactIndex > 0
//                                 ) {
//                                   setActiveContactIndex(activeContactIndex - 1);
//                                 }
//                               }}
//                             >
//                               ✕
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         className="cm-add-contact-btn"
//                         onClick={onAddContact}
//                       >
//                         + Add Contact
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* RIGHT COLUMN */}
//               <div className="cm-col">
//                 <div className="cm-field">
//                   <label>Email</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={onChangeField}
//                   />
//                 </div>

//                 <div className="cm-field">
//                   <label>Fax Number</label>
//                   <input
//                     type="text"
//                     name="faxNumber"
//                     value={formData.faxNumber}
//                     onChange={onChangeField}
//                   />
//                 </div>

//                 <div className="cm-field cm-field-grow">
//                   <label>Remarks</label>
//                   <textarea
//                     name="remarks"
//                     value={formData.remarks}
//                     onChange={onChangeField}
//                     className="cm-remarks-textarea"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* ACTION ROW */}
//             <div className="cm-actions">
//               <button
//                 type="button"
//                 className="cm-delete-btn"
//                 onClick={onDelete}
//               >
//                 Delete Customer
//               </button>
//               <button type="submit" className="cm-update-btn">
//                 Update
//               </button>
//             </div>
//           </form>

//           {/* JOBS TABLE */}
//           <CustomerJobsTable jobs={jobs} loading={jobsLoading} />
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default CustomerModal;
import React, { useState } from "react";
import { createPortal } from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import "./CustomerModal.css";

// Turns an arbitrary stage label (e.g. "For Typing & Beyond") into a
// safe, valid CSS class suffix (e.g. "for-typing-beyond"). Collapses
// any run of non-alphanumeric characters into a single dash and trims
// leading/trailing dashes.
const toStageClass = (stage) =>
  (stage || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Job Number + Equipment + current process/stage, per the simplified
// table design. Data comes from GET /api/customers/:customerID/jobs,
// fetched by the parent (Customer.jsx) and passed down as `jobs`.
const CustomerJobsTable = ({ jobs, loading }) => (
  <div className="cm-jobs-section">
    {loading ? (
      <p className="cm-jobs-loading">Loading jobs...</p>
    ) : jobs.length === 0 ? (
      <p className="cm-jobs-empty">No jobs found for this customer.</p>
    ) : (
      <div className="cm-jobs-table-wrapper">
        <table className="cm-jobs-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Equipment</th>
              <th>Serial No.</th>
              <th>Model</th>
              <th>Job Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.jobNumber}>
                <td>{job.jobNumber}</td>
                <td>{job.equipmentName || "—"}</td>
                <td>{job.serialNumber || "—"}</td>
                <td>{job.model || "—"}</td>
                <td>
                  <span
                    className={`cm-stage-badge cm-stage-${toStageClass(
                      job.stage,
                    )}`}
                  >
                    {job.stage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
const CustomerModal = ({
  selectedCustomer,
  formData,
  jobs,
  jobsLoading,
  onClose,
  onSubmit,
  onDelete,
  onChangeField,
  onContactChange,
  onAddContact,
  onRemoveContact,
}) => {
  const [activeContactIndex, setActiveContactIndex] = useState(0);
  const [manageContactsOpen, setManageContactsOpen] = useState(false);

  const contactNames = formData.contactNames?.length
    ? formData.contactNames
    : [""];

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="cm-box" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title="EDIT CUSTOMER"
          subtitleBottom={
            selectedCustomer?.customerID
              ? `Customer ID: ${selectedCustomer.customerID}`
              : undefined
          }
          onClose={onClose}
        />

        <div className="cm-content">
          <form onSubmit={onSubmit}>
            <div className="cm-grid">
              {/* LEFT COLUMN */}
              <div className="cm-col">
                <div className="cm-field">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={onChangeField}
                    required
                  />
                </div>

                <div className="cm-field">
                  <label>Address</label>
                  <textarea
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={onChangeField}
                    required
                  />
                </div>

                <div className="cm-field">
                  <label>Contact Info</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={onChangeField}
                  />
                </div>

                <div className="cm-field">
                  <label>VAT</label>
                  <input
                    type="text"
                    name="vat"
                    value={formData.vat}
                    onChange={onChangeField}
                  />
                </div>

                <div className="cm-field">
                  <label>Contact Name</label>
                  <div className="cm-contact-row">
                    <select
                      value={activeContactIndex}
                      onChange={(e) =>
                        setActiveContactIndex(Number(e.target.value))
                      }
                    >
                      {contactNames.map((name, i) => (
                        <option key={i} value={i}>
                          {name || `Contact ${i + 1}`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="cm-manage-contacts-btn"
                      title="Manage contacts"
                      onClick={() => setManageContactsOpen((v) => !v)}
                    >
                      ✎
                    </button>
                  </div>

                  {manageContactsOpen && (
                    <div className="cm-contact-editor">
                      {contactNames.map((contact, index) => (
                        <div key={index} className="cm-contact-editor-row">
                          <input
                            type="text"
                            placeholder={`Contact Name ${index + 1}`}
                            value={contact}
                            onChange={(e) =>
                              onContactChange(index, e.target.value)
                            }
                          />
                          {contactNames.length > 1 && (
                            <button
                              type="button"
                              className="cm-remove-contact-btn"
                              onClick={() => {
                                onRemoveContact(index);
                                if (
                                  activeContactIndex >= index &&
                                  activeContactIndex > 0
                                ) {
                                  setActiveContactIndex(activeContactIndex - 1);
                                }
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="cm-add-contact-btn"
                        onClick={onAddContact}
                      >
                        + Add Contact
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="cm-col">
                <div className="cm-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChangeField}
                  />
                </div>

                <div className="cm-field">
                  <label>Fax Number</label>
                  <input
                    type="text"
                    name="faxNumber"
                    value={formData.faxNumber}
                    onChange={onChangeField}
                  />
                </div>

                <div className="cm-field cm-field-grow">
                  <label>Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={onChangeField}
                    className="cm-remarks-textarea"
                  />
                </div>
              </div>
            </div>

            {/* ACTION ROW */}
            <div className="cm-actions">
              <button
                type="button"
                className="cm-delete-btn"
                onClick={onDelete}
              >
                Delete Customer
              </button>
              <button type="submit" className="cm-update-btn">
                Update
              </button>
            </div>
          </form>

          {/* JOBS TABLE */}
          <CustomerJobsTable jobs={jobs} loading={jobsLoading} />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CustomerModal;
