// import React from "react";
// import { createPortal } from "react-dom";
// import JobTag, { jobTagStyles } from "./JobTag";

// /**
//  * PrintReceiptModal
//  * Read-only, printable view of a saved Job Receipt + its Job Numbers,
//  * followed by SSS's Conditions of Calibration on a separate printed page.
//  *
//  * Reuses the app's existing jr-modal-* classes (from jobreceipt.css) for the
//  * chrome so it looks consistent with AddReceiptModal / JobNumberModal, and
//  * defines its own scoped print rules so only the tags/terms/receipt sheets
//  * are printed (each on its own page).
//  *
//  * LOGO: pass `logoUrl` with the path to your logo image (e.g. an asset in
//  * /public, like "/logo-sss.png"). If omitted, a placeholder circle with the
//  * company initials is shown instead so the layout still looks right.
//  *
//  * Expected `receipt` shape (matches what handleSave in JobReceipt.jsx builds):
//  * {
//  *   jrId, date, customerID, companyName, companyAddress, contactInfo,
//  *   vat, reference, contactName, preparedBy, remarks,
//  *   jobNumbers: [
//  *     { jobNumber, type, description, brand, model, serialNo, eta, priority, ... }
//  *   ]
//  * }
//  */

// const formatDate = (dateInput) => {
//   if (!dateInput) return "---";
//   const d = new Date(dateInput);
//   if (isNaN(d.getTime())) return dateInput;
//   return d.toLocaleDateString("en-PH", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// };

// const val = (v) => (v === null || v === undefined || v === "" ? "---" : v);

// const typeLabel = (type) => {
//   if (type === "electrical") return "Electrical (SSE)";
//   if (type === "mechanical") return "Mechanical (SSS)";
//   return "---";
// };

// // COMPANY LETTERHEAD DETAILS — edit these to match your actual details, or
// // lift them into props if different receipts ever need different branding.
// const COMPANY = {
//   name: "SCIENTIFIC STANDARDS SERVICES",
//   addressLine: "#9 M. Santos St. Tuktukan Taguig City, Philippines (1637)",
//   phoneLine: "Tel. Nos: (02) 642-3695  642-3373  628-2410  628-0177",
//   emailLine: "inquiry@scientificstandards.com.ph  •  stdcalib@yahoo.com",
//   websiteLine: "stdcalib@scientificstandards.com.ph",
//   initials: "SSS",
// };

// // CONDITIONS OF CALIBRATION — flat numbered list, matching the printed
// // company document verbatim. Item 1 bolds "SSS LAB"; item 15 has a blank
// // for the agreed calibration frequency.
// const CONDITIONS_OF_CALIBRATION = [
//   <>
//     That the calibration of the items will be done In – House (
//     <strong>SSS LAB</strong>).
//   </>,
//   "That the customer will ensure that the instruments are in good working condition prior to its calibration.",
//   "That the customer will provide instrument manual and dummy loads if necessary.",
//   "That the pick up and delivery of instruments for In – House calibration will be shouldered by the customer.",
//   "That the customer will provide the necessary safety gadgets required in the plant.",
//   "That the customer will ensure that the site calibration area will be restricted from other personnel while calibration is on-going.",
//   "The calibration of Scientific Standards Services does not include adjustment or repair of the instrument.",
//   "The customer will provide the necessary manpower and other means if adjustment is necessary.",
//   "That the customer agrees to the calibration procedure and traceability of Scientific Standards Services.",
//   "When an equipment for calibration has no Serial Number, Scientific Standards Services will inform the customer that a unique Serial Number or Identification will be engraved to their equipment.",
//   "We at Scientific Standards Services are giving our best to be diligent enough in performing the test and or calibration services but no warranties are given and none may be implied directly or indirectly relating to SSS' test and calibration results and facilities. And no event shall SSS be liable for collateral, special, consequential damage, or damages caused by fortuitous events, any error of judgment, fault or negligence of its officers or employees.",
//   "Scientific Standards Services shall have the right to sell instrument / equipment which were not claimed within a period of one hundred twenty (120) days to cover cost of storage, calibration fees and related costs.",
//   "That the calibration certificate will only be given upon full payment of calibration services.",
//   "The full evaluation of the instrument (UUT) will be done during the scheduled calibration.",
//   <>
//     That as agreed the calibration frequency for these instruments is ({" "}
//     <span className="pr-fillblank" /> ) months/year/s.
//   </>,
//   "Scientific Standards Services will charge 50% of the actual amount of calibration if the instrument was already calibrated and the customer decided to cancel the transaction and pull-out/return without calibration (RWOC) the instrument due to error or discrepancies found during calibration. In this case, SSS can issue a Service Report if applicable.",
//   "The customer shall not allow financial, commercial or other pressure to compromise impartiality and conflict of interest on its activities.",
//   "The customer will not disclose any Scientific Standards Services and/or SSS Customer's information to any third party and that no information will be used by this company or permitted by SSS to be used for other purposes.",
//   "That these conditions of calibration shall constitute the agreement in full of services to be rendered by Scientific Standards Services (SSS) and warranties thereof to client and SSS shall not be made to undertake nor perform any additional act or services or give other warranty not included herein, and that client shall accordingly compensate SSS after compliance herewith.",
// ];

// // LETTERHEAD — logo + company block, reused at the top of the terms page.
// // Pass `logoUrl` (e.g. "/logo-sss.png") to use your real logo; without it,
// // a placeholder circle with the company initials is shown instead.
// const Letterhead = ({ logoUrl }) => (
//   <div className="pr-letterhead">
//     <div className="pr-logo-circle">
//       {logoUrl ? (
//         <img src={pu} alt={`${COMPANY.name} logo`} />
//       ) : (
//         <span className="pr-logo-fallback">{COMPANY.initials}</span>
//       )}
//     </div>
//     <div className="pr-letterhead-text">
//       <div className="pr-letterhead-name">{COMPANY.name}</div>
//       <div className="pr-letterhead-line">{COMPANY.addressLine}</div>
//       <div className="pr-letterhead-line">{COMPANY.phoneLine}</div>
//       <div className="pr-letterhead-line">{COMPANY.emailLine}</div>
//       <div className="pr-letterhead-line">{COMPANY.websiteLine}</div>
//     </div>
//   </div>
// );

// const PrintReceiptModal = ({ receipt, onClose, logoUrl }) => {
//   if (!receipt) return null;

//   const {
//     jrId,
//     date,
//     customerID,
//     companyName,
//     companyAddress,
//     contactInfo,
//     vat,
//     reference,
//     contactName,
//     preparedBy,
//     remarks,
//     jobNumbers = [],
//   } = receipt;

//   const handlePrint = () => window.print();

//   // Pad the table to a minimum row count so the printed slip looks consistent
//   // even on receipts with just one or two job numbers.
//   const MIN_ROWS = 5;
//   const rows = [...jobNumbers];
//   while (rows.length < MIN_ROWS) {
//     rows.push({ _blank: true, _key: `blank-${rows.length}` });
//   }

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <style>{printStyles}</style>

//       <div
//         className="jr-modal-wrapper pr-no-print-bounds"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* HEADER — screen only */}
//         <div className="jr-modal-header pr-no-print">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">
//                 JOB RECEIPT — PRINT COPY
//               </span>
//               <span className="jr-modal-title-sub">
//                 SCIENTIFIC STANDARDS SERVICES
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close pr-no-print" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {/* PRINTABLE AREA */}
//         <div className="pr-scroll">
//           <div id="pr-print-area">
//             {/* PAGE 1 — EQUIPMENT TAGS (one per Job Number) */}
//             {jobNumbers.length > 0 && (
//               <div className="pr-sheet pr-tags-page">
//                 <div className="pr-terms-header">
//                   <div>
//                     <div className="pr-company-name">Equipment Tags</div>
//                     <div className="pr-terms-title">
//                       One tag per Job Number — attach to equipment
//                     </div>
//                   </div>
//                   <div className="pr-header-right">
//                     <div className="pr-doc-title">JOB RECEIPT</div>
//                     <div className="pr-jr-id">{val(jrId)}</div>
//                   </div>
//                 </div>

//                 <div className="pr-divider" />

//                 <div className="jt-tags-grid">
//                   {jobNumbers.map((job, index) => (
//                     <JobTag
//                       key={job._id || job.jobNumber || index}
//                       job={job}
//                       receiptDate={date}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* PAGE 2 — CONDITIONS OF CALIBRATION (letterhead) */}
//             <div className="pr-sheet pr-terms-page">
//               <Letterhead logoUrl={logoUrl} />

//               <div className="pr-letterhead-divider" />

//               <div className="pr-info-bar">
//                 <div className="pr-info-row">
//                   <span className="pr-info-label">Job Receipt Number</span>
//                   <span className="pr-info-value">{val(jrId)}</span>
//                 </div>
//                 <div className="pr-info-row">
//                   <span className="pr-info-label">Company Name</span>
//                   <span className="pr-info-value">{val(companyName)}</span>
//                 </div>
//               </div>

//               <div className="pr-conditions-title">
//                 CONDITIONS OF CALIBRATION
//               </div>
//               <div className="pr-conditions-subtitle">
//                 *The customer agrees whenever applicable*
//               </div>

//               <ol className="pr-conditions-list">
//                 {CONDITIONS_OF_CALIBRATION.map((item, i) => (
//                   <li key={i}>{item}</li>
//                 ))}
//               </ol>

//               <p className="pr-thank-you">Thank you.</p>

//               <div className="pr-conforme-row">
//                 <div className="pr-conforme-block">
//                   <div className="pr-signature-line" />
//                   <div className="pr-conforme-caption">Prepared by:</div>
//                   <div className="pr-conforme-name">{val(preparedBy)}</div>
//                 </div>
//                 <div className="pr-conforme-block">
//                   <div className="pr-signature-line" />
//                   <div className="pr-conforme-caption">CONFORME</div>
//                   <div className="pr-conforme-name">
//                     {contactName ? contactName.toUpperCase() : "---"}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* PAGE 3 — RECEIPT */}
//             <div className="pr-sheet pr-receipt-page">
//               <div className="pr-header">
//                 <div>
//                   <div className="pr-company-name">
//                     Scientific Standard Services Inc.
//                   </div>
//                   <div className="pr-company-sub">Calibration Laboratory</div>
//                 </div>
//                 <div className="pr-header-right">
//                   <div className="pr-doc-title">JOB RECEIPT</div>
//                   <div className="pr-jr-id">{val(jrId)}</div>
//                 </div>
//               </div>

//               <div className="pr-divider" />

//               <div className="pr-meta-row">
//                 <div className="pr-meta-col">
//                   <span className="pr-meta-label">Date</span>
//                   <span className="pr-meta-value">{formatDate(date)}</span>
//                 </div>
//                 <div className="pr-meta-col">
//                   <span className="pr-meta-label">VAT</span>
//                   <span className="pr-meta-value">{val(vat)}</span>
//                 </div>
//                 <div className="pr-meta-col">
//                   <span className="pr-meta-label">Reference</span>
//                   <span className="pr-meta-value">{val(reference)}</span>
//                 </div>
//               </div>

//               <div className="pr-section-title">Customer Information</div>
//               <div className="pr-customer-grid">
//                 <div className="pr-customer-row">
//                   <span className="pr-field-label">Customer ID</span>
//                   <span className="pr-field-value">{val(customerID)}</span>
//                 </div>
//                 <div className="pr-customer-row">
//                   <span className="pr-field-label">Company Name</span>
//                   <span className="pr-field-value">{val(companyName)}</span>
//                 </div>
//                 <div className="pr-customer-row">
//                   <span className="pr-field-label">Address</span>
//                   <span className="pr-field-value">{val(companyAddress)}</span>
//                 </div>
//                 <div className="pr-customer-row">
//                   <span className="pr-field-label">Contact Person</span>
//                   <span className="pr-field-value">{val(contactName)}</span>
//                 </div>
//                 <div className="pr-customer-row">
//                   <span className="pr-field-label">Contact Info</span>
//                   <span className="pr-field-value">{val(contactInfo)}</span>
//                 </div>
//               </div>

//               <div className="pr-section-title">Job Numbers</div>
//               <table className="pr-table">
//                 <thead>
//                   <tr>
//                     <th style={{ width: "6%" }}>No.</th>
//                     <th style={{ width: "14%" }}>Job Number</th>
//                     <th style={{ width: "13%" }}>Type</th>
//                     <th style={{ width: "23%" }}>Description</th>
//                     <th style={{ width: "13%" }}>Brand / Model</th>
//                     <th style={{ width: "13%" }}>Serial No.</th>
//                     <th style={{ width: "9%" }}>Priority</th>
//                     <th style={{ width: "9%" }}>ETA</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rows.map((job, index) =>
//                     job._blank ? (
//                       <tr key={job._key}>
//                         <td>&nbsp;</td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                       </tr>
//                     ) : (
//                       <tr key={job._id || job.jobNumber || index}>
//                         <td>{index + 1}</td>
//                         <td>{val(job.jobNumber)}</td>
//                         <td>{typeLabel(job.type)}</td>
//                         <td>{val(job.description)}</td>
//                         <td>
//                           {val(job.brand)} / {val(job.model)}
//                         </td>
//                         <td>{val(job.serialNo)}</td>
//                         <td>{val(job.priority)}</td>
//                         <td>{job.eta ? formatDate(job.eta) : "---"}</td>
//                       </tr>
//                     ),
//                   )}
//                 </tbody>
//               </table>

//               <div className="pr-section-title">Remarks</div>
//               <div className="pr-remarks-box">{val(remarks)}</div>

//               <div className="pr-signature-row">
//                 <div className="pr-signature-block">
//                   <div className="pr-signature-line" />
//                   <div className="pr-signature-label">
//                     Prepared By: {val(preparedBy)}
//                   </div>
//                 </div>
//                 <div className="pr-signature-block">
//                   <div className="pr-signature-line" />
//                   <div className="pr-signature-label">Received By</div>
//                 </div>
//                 <div className="pr-signature-block">
//                   <div className="pr-signature-line" />
//                   <div className="pr-signature-label">Authorized Signature</div>
//                 </div>
//               </div>

//               <div className="pr-footer">
//                 This receipt serves as proof of item submission for calibration
//                 services. Please present this upon claiming of items. See the
//                 attached Conditions of Calibration.
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ACTIONS — screen only */}
//         <div className="jr-modal-actions pr-no-print">
//           <div className="jr-modal-actions-left" />
//           <div className="jr-modal-actions-right">
//             <button className="jr-action-btn" onClick={onClose}>
//               Close
//             </button>
//             <button className="jr-save-btn" onClick={handlePrint}>
//               Print
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default PrintReceiptModal;

// const printStyles = `
//   .pr-scroll {
//     max-height: 70vh;
//     overflow-y: auto;
//     background: #e9edf1;
//     padding: 24px;
//   }
//   .pr-sheet {
//     max-width: 780px;
//     margin: 0 auto 24px;
//     background: #ffffff;
//     padding: 40px 48px;
//     box-shadow: 0 1px 4px rgba(0,0,0,0.15);
//     color: #1c2530;
//     font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
//   }
//   .pr-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//   }
//   .pr-company-name {
//     font-size: 19px;
//     font-weight: 700;
//   }
//   .pr-company-sub {
//     font-size: 12.5px;
//     color: #5b6672;
//     margin-top: 2px;
//   }
//   .pr-header-right {
//     text-align: right;
//   }
//   .pr-doc-title {
//     font-size: 13px;
//     font-weight: 700;
//     letter-spacing: 1.5px;
//     color: #5b6672;
//   }
//   .pr-jr-id {
//     font-size: 18px;
//     font-weight: 700;
//     margin-top: 4px;
//     color: #1f6feb;
//   }
//   .pr-divider {
//     height: 2px;
//     background: #1c2530;
//     margin: 16px 0 18px;
//   }
//   .pr-meta-row {
//     display: flex;
//     gap: 24px;
//     margin-bottom: 22px;
//   }
//   .pr-meta-col {
//     display: flex;
//     flex-direction: column;
//     gap: 2px;
//   }
//   .pr-meta-label {
//     font-size: 10.5px;
//     text-transform: uppercase;
//     letter-spacing: 0.6px;
//     color: #8892a0;
//   }
//   .pr-meta-value {
//     font-size: 13.5px;
//     font-weight: 600;
//   }
//   .pr-section-title {
//     font-size: 11.5px;
//     font-weight: 700;
//     text-transform: uppercase;
//     letter-spacing: 0.8px;
//     color: #1f6feb;
//     border-bottom: 1px solid #dde2e8;
//     padding-bottom: 5px;
//     margin-top: 22px;
//     margin-bottom: 10px;
//   }
//   .pr-customer-grid {
//     display: flex;
//     flex-direction: column;
//     gap: 6px;
//   }
//   .pr-customer-row {
//     display: flex;
//     font-size: 13px;
//   }
//   .pr-field-label {
//     width: 150px;
//     flex-shrink: 0;
//     color: #5b6672;
//   }
//   .pr-field-value {
//     font-weight: 600;
//     color: #1c2530;
//   }
//   .pr-table {
//     width: 100%;
//     border-collapse: collapse;
//     font-size: 11.5px;
//   }
//   .pr-table th {
//     text-align: left;
//     padding: 6px 6px;
//     background: #f2f4f7;
//     border: 1px solid #d7dce2;
//     font-weight: 700;
//     color: #33404d;
//   }
//   .pr-table td {
//     padding: 8px 6px;
//     border: 1px solid #d7dce2;
//     height: 14px;
//   }
//   .pr-remarks-box {
//     font-size: 13px;
//     min-height: 40px;
//     border: 1px solid #d7dce2;
//     border-radius: 4px;
//     padding: 10px 12px;
//     color: #33404d;
//   }
//   .pr-signature-row {
//     display: flex;
//     justify-content: space-between;
//     margin-top: 48px;
//     gap: 20px;
//   }
//   .pr-signature-block {
//     flex: 1;
//     text-align: center;
//   }
//   .pr-signature-line {
//     border-bottom: 1px solid #1c2530;
//     height: 36px;
//   }
//   .pr-signature-label {
//     font-size: 11.5px;
//     color: #5b6672;
//     margin-top: 6px;
//   }
//   .pr-footer {
//     margin-top: 30px;
//     font-size: 10.5px;
//     color: #8892a0;
//     text-align: center;
//     border-top: 1px solid #eef0f3;
//     padding-top: 10px;
//   }

//   /* TAGS PAGE (reuses pr-terms-header/pr-divider from above) */
//   .pr-terms-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//   }
//   .pr-terms-title {
//     font-size: 13px;
//     font-weight: 700;
//     margin-top: 4px;
//     color: #33404d;
//   }

//   /* ===================================================================
//      CONDITIONS OF CALIBRATION PAGE — letterhead, info bar, numbered list
//      =================================================================== */
//   .pr-terms-page {
//     margin-top: 0;
//   }

//   .pr-letterhead {
//     display: flex;
//     align-items: flex-start;
//     gap: 22px;
//   }
//   .pr-logo-circle {
//     width: 92px;
//     height: 92px;
//     border-radius: 50%;
//     border: 3px solid #17375e;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     overflow: hidden;
//     flex-shrink: 0;
//     background: #fff;
//   }
//   .pr-logo-circle img {
//     width: 100%;
//     height: 100%;
//     object-fit: contain;
//   }
//   .pr-logo-fallback {
//     font-size: 15px;
//     font-weight: 800;
//     letter-spacing: 1px;
//     color: #17375e;
//   }
//   .pr-letterhead-text {
//     flex: 1;
//     text-align: right;
//   }
//   .pr-letterhead-name {
//     font-size: 22px;
//     font-weight: 800;
//     letter-spacing: 0.5px;
//     color: #17375e;
//   }
//   .pr-letterhead-line {
//     font-size: 11.5px;
//     color: #33404d;
//     margin-top: 2px;
//   }
//   .pr-letterhead-divider {
//     height: 2px;
//     background: #17375e;
//     margin: 16px 0 14px;
//   }

//   .pr-info-bar {
//     background: #eceef1;
//     border: 1px solid #d7dce2;
//     border-radius: 3px;
//     padding: 8px 14px;
//     margin-bottom: 18px;
//   }
//   .pr-info-row {
//     display: flex;
//     font-size: 12.5px;
//     padding: 3px 0;
//   }
//   .pr-info-label {
//     width: 180px;
//     flex-shrink: 0;
//     font-weight: 700;
//     color: #1c2530;
//   }
//   .pr-info-value {
//     font-weight: 600;
//     color: #1c2530;
//   }

//   .pr-conditions-title {
//     font-size: 13px;
//     font-weight: 800;
//     letter-spacing: 0.4px;
//     color: #1c2530;
//     margin-top: 4px;
//   }
//   .pr-conditions-subtitle {
//     font-size: 11px;
//     font-style: italic;
//     color: #5b6672;
//     margin-bottom: 12px;
//   }

//   .pr-conditions-list {
//     margin: 0;
//     padding-left: 20px;
//   }
//   .pr-conditions-list li {
//     font-size: 11px;
//     line-height: 1.55;
//     color: #1c2530;
//     margin-bottom: 7px;
//   }
//   .pr-fillblank {
//     display: inline-block;
//     width: 60px;
//     border-bottom: 1px solid #1c2530;
//   }

//   .pr-thank-you {
//     font-size: 12px;
//     margin: 16px 0 34px;
//   }

//   .pr-conforme-row {
//     display: flex;
//     justify-content: space-between;
//     gap: 40px;
//   }
//   .pr-conforme-block {
//     flex: 1;
//     text-align: center;
//   }
//   .pr-conforme-caption {
//     font-size: 11.5px;
//     font-weight: 700;
//     color: #1c2530;
//     margin-top: 6px;
//   }
//   .pr-conforme-name {
//     font-size: 11.5px;
//     color: #33404d;
//     margin-top: 2px;
//   }

//   @media print {
//     /* The modal system (jr-modal-overlay / jr-modal-wrapper) is built for an
//        on-screen popup: fixed/absolute positioning, capped heights, and
//        overflow:auto scroll areas. Left alone, those ancestors clip the
//        print output to whatever fits in the visible scroll box. Strip all of
//        that out for print so the browser can lay out and paginate the full
//        content instead of just what was scrolled into view. */
//     html, body {
//       height: auto !important;
//       overflow: visible !important;
//     }
//     .jr-modal-overlay {
//       position: static !important;
//       display: block !important;
//       overflow: visible !important;
//       height: auto !important;
//       max-height: none !important;
//       background: none !important;
//     }
//     .jr-modal-wrapper {
//       position: static !important;
//       display: block !important;
//       overflow: visible !important;
//       height: auto !important;
//       max-height: none !important;
//       box-shadow: none !important;
//     }
//     .pr-scroll {
//       max-height: none !important;
//       overflow: visible !important;
//       padding: 0 !important;
//       background: none !important;
//     }

//     body * {
//       visibility: hidden;
//     }
//     #pr-print-area, #pr-print-area * {
//       visibility: visible;
//     }
//     #pr-print-area {
//       position: absolute;
//       top: 0;
//       left: 0;
//       width: 100%;
//     }
//     #pr-print-area .pr-sheet {
//       box-shadow: none !important;
//       max-width: 100% !important;
//       padding: 0 !important;
//       margin: 0 !important;
//     }
//     .pr-terms-page {
//       page-break-before: always;
//       break-before: page;
//       padding-top: 0 !important;
//     }
//     .pr-receipt-page {
//       page-break-before: always;
//       break-before: page;
//       padding-top: 0 !important;
//     }
//     @page {
//       size: A4;
//       margin: 12mm;
//     }
//   }

//   ${jobTagStyles}
// `;
import React from "react";
import { createPortal } from "react-dom";
import JobTag, { jobTagStyles } from "./JobTag";

/**
 * PrintReceiptModal
 * Read-only, printable view of a saved Job Receipt + its Job Numbers,
 * followed by SSS's Conditions of Calibration on a separate printed page.
 *
 * Reuses the app's existing jr-modal-* classes (from jobreceipt.css) for the
 * chrome so it looks consistent with AddReceiptModal / JobNumberModal, and
 * defines its own scoped print rules so only the tags/terms/receipt sheets
 * are printed (each on its own page).
 *
 * LOGO: pass `logoUrl` with the path to your logo image (e.g. an asset in
 * /public, like "/logo-sss.png"). If omitted, a placeholder circle with the
 * company initials is shown instead so the layout still looks right.
 *
 * Expected `receipt` shape (matches what handleSave in JobReceipt.jsx builds):
 * {
 *   jrId, date, customerID, companyName, companyAddress, contactInfo,
 *   vat, reference, contactName, preparedBy, remarks,
 *   jobNumbers: [
 *     { jobNumber, type, description, brand, model, serialNo, eta, priority, ... }
 *   ]
 * }
 */

const formatDate = (dateInput) => {
  if (!dateInput) return "---";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const val = (v) => (v === null || v === undefined || v === "" ? "---" : v);

const typeLabel = (type) => {
  if (type === "electrical") return "Electrical (SSE)";
  if (type === "mechanical") return "Mechanical (SSS)";
  return "---";
};

// COMPANY LETTERHEAD DETAILS — edit these to match your actual details, or
// lift them into props if different receipts ever need different branding.
const COMPANY = {
  name: "SCIENTIFIC STANDARDS SERVICES",
  addressLine: "#9 M. Santos St. Tuktukan Taguig City, Philippines (1637)",
  phoneLine: "Tel. Nos: (02) 642-3695  642-3373  628-2410  628-0177",
  emailLine: "inquiry@scientificstandards.com.ph  •  stdcalib@yahoo.com",
  websiteLine: "stdcalib@scientificstandards.com.ph",
  initials: "SSS",
};

// CONDITIONS OF CALIBRATION — flat numbered list, matching the printed
// company document verbatim. Item 1 bolds "SSS LAB"; item 15 has a blank
// for the agreed calibration frequency.
const CONDITIONS_OF_CALIBRATION = [
  <>
    That the calibration of the items will be done In – House (
    <strong>SSS LAB</strong>).
  </>,
  "That the customer will ensure that the instruments are in good working condition prior to its calibration.",
  "That the customer will provide instrument manual and dummy loads if necessary.",
  "That the pick up and delivery of instruments for In – House calibration will be shouldered by the customer.",
  "That the customer will provide the necessary safety gadgets required in the plant.",
  "That the customer will ensure that the site calibration area will be restricted from other personnel while calibration is on-going.",
  "The calibration of Scientific Standards Services does not include adjustment or repair of the instrument.",
  "The customer will provide the necessary manpower and other means if adjustment is necessary.",
  "That the customer agrees to the calibration procedure and traceability of Scientific Standards Services.",
  "When an equipment for calibration has no Serial Number, Scientific Standards Services will inform the customer that a unique Serial Number or Identification will be engraved to their equipment.",
  "We at Scientific Standards Services are giving our best to be diligent enough in performing the test and or calibration services but no warranties are given and none may be implied directly or indirectly relating to SSS' test and calibration results and facilities. And no event shall SSS be liable for collateral, special, consequential damage, or damages caused by fortuitous events, any error of judgment, fault or negligence of its officers or employees.",
  "Scientific Standards Services shall have the right to sell instrument / equipment which were not claimed within a period of one hundred twenty (120) days to cover cost of storage, calibration fees and related costs.",
  "That the calibration certificate will only be given upon full payment of calibration services.",
  "The full evaluation of the instrument (UUT) will be done during the scheduled calibration.",
  <>
    That as agreed the calibration frequency for these instruments is ({" "}
    <span className="pr-fillblank" /> ) months/year/s.
  </>,
  "Scientific Standards Services will charge 50% of the actual amount of calibration if the instrument was already calibrated and the customer decided to cancel the transaction and pull-out/return without calibration (RWOC) the instrument due to error or discrepancies found during calibration. In this case, SSS can issue a Service Report if applicable.",
  "The customer shall not allow financial, commercial or other pressure to compromise impartiality and conflict of interest on its activities.",
  "The customer will not disclose any Scientific Standards Services and/or SSS Customer's information to any third party and that no information will be used by this company or permitted by SSS to be used for other purposes.",
  "That these conditions of calibration shall constitute the agreement in full of services to be rendered by Scientific Standards Services (SSS) and warranties thereof to client and SSS shall not be made to undertake nor perform any additional act or services or give other warranty not included herein, and that client shall accordingly compensate SSS after compliance herewith.",
];

// LETTERHEAD — logo + company block, reused at the top of the terms page.
// Pass `logoUrl` (e.g. "/logo-sss.png") to use your real logo; without it,
// a placeholder circle with the company initials is shown instead.
const Letterhead = ({ logoUrl }) => (
  <div className="pr-letterhead">
    <div className="pr-logo-circle">
      {logoUrl ? (
        <img src={logoUrl} alt={`${COMPANY.name} logo`} />
      ) : (
        <span className="pr-logo-fallback">{COMPANY.initials}</span>
      )}
    </div>
    <div className="pr-letterhead-text">
      <div className="pr-letterhead-name">{COMPANY.name}</div>
      <div className="pr-letterhead-line">{COMPANY.addressLine}</div>
      <div className="pr-letterhead-line">{COMPANY.phoneLine}</div>
      <div className="pr-letterhead-line">{COMPANY.emailLine}</div>
      <div className="pr-letterhead-line">{COMPANY.websiteLine}</div>
    </div>
  </div>
);

const PrintReceiptModal = ({
  receipt,
  onClose,
  logoUrl = "/images/SSSiLogoforFiles.png",
}) => {
  if (!receipt) return null;

  const {
    jrId,
    date,
    customerID,
    companyName,
    companyAddress,
    contactInfo,
    vat,
    reference,
    contactName,
    preparedBy,
    remarks,
    jobNumbers = [],
  } = receipt;

  const handlePrint = () => window.print();

  // Pad the table to a minimum row count so the printed slip looks consistent
  // even on receipts with just one or two job numbers.
  const MIN_ROWS = 5;
  const rows = [...jobNumbers];
  while (rows.length < MIN_ROWS) {
    rows.push({ _blank: true, _key: `blank-${rows.length}` });
  }

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <style>{printStyles}</style>

      <div
        className="jr-modal-wrapper pr-no-print-bounds"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER — screen only */}
        <div className="jr-modal-header pr-no-print">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">
                JOB RECEIPT — PRINT COPY
              </span>
              <span className="jr-modal-title-sub">
                SCIENTIFIC STANDARDS SERVICES
              </span>
            </div>
          </div>
          <button className="jr-modal-close pr-no-print" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* PRINTABLE AREA */}
        <div className="pr-scroll">
          <div id="pr-print-area">
            {/* PAGE 1 — EQUIPMENT TAGS (one per Job Number) */}
            {jobNumbers.length > 0 && (
              <div className="pr-sheet pr-tags-page">
                <div className="pr-terms-header">
                  <div>
                    <div className="pr-company-name">Equipment Tags</div>
                    <div className="pr-terms-title">
                      One tag per Job Number — attach to equipment
                    </div>
                  </div>
                  <div className="pr-header-right">
                    <div className="pr-doc-title">JOB RECEIPT</div>
                    <div className="pr-jr-id">{val(jrId)}</div>
                  </div>
                </div>

                <div className="pr-divider" />

                <div className="jt-tags-grid">
                  {jobNumbers.map((job, index) => (
                    <JobTag
                      key={job._id || job.jobNumber || index}
                      job={job}
                      receiptDate={date}
                      logoUrl={logoUrl}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 2 — CONDITIONS OF CALIBRATION (letterhead) */}
            <div className="pr-sheet pr-terms-page">
              <Letterhead logoUrl={logoUrl} />

              <div className="pr-letterhead-divider" />

              <div className="pr-info-bar">
                <div className="pr-info-row">
                  <span className="pr-info-label">Job Receipt Number</span>
                  <span className="pr-info-value">{val(jrId)}</span>
                </div>
                <div className="pr-info-row">
                  <span className="pr-info-label">Company Name</span>
                  <span className="pr-info-value">{val(companyName)}</span>
                </div>
              </div>

              <div className="pr-conditions-title">
                CONDITIONS OF CALIBRATION
              </div>
              <div className="pr-conditions-subtitle">
                *The customer agrees whenever applicable*
              </div>

              <ol className="pr-conditions-list">
                {CONDITIONS_OF_CALIBRATION.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>

              <p className="pr-thank-you">Thank you.</p>

              <div className="pr-conforme-row">
                <div className="pr-conforme-block">
                  <div className="pr-signature-line" />
                  <div className="pr-conforme-caption">Prepared by:</div>
                  <div className="pr-conforme-name">{val(preparedBy)}</div>
                </div>
                <div className="pr-conforme-block">
                  <div className="pr-signature-line" />
                  <div className="pr-conforme-caption">CONFORME</div>
                  <div className="pr-conforme-name">
                    {contactName ? contactName.toUpperCase() : "---"}
                  </div>
                </div>
              </div>
            </div>

            {/* PAGE 3 — RECEIPT */}
            <div className="pr-sheet pr-receipt-page">
              <div className="pr-header">
                <div>
                  <div className="pr-company-name">
                    Scientific Standard Services Inc.
                  </div>
                  <div className="pr-company-sub">Calibration Laboratory</div>
                </div>
                <div className="pr-header-right">
                  <div className="pr-doc-title">JOB RECEIPT</div>
                  <div className="pr-jr-id">{val(jrId)}</div>
                </div>
              </div>

              <div className="pr-divider" />

              <div className="pr-meta-row">
                <div className="pr-meta-col">
                  <span className="pr-meta-label">Date</span>
                  <span className="pr-meta-value">{formatDate(date)}</span>
                </div>
                <div className="pr-meta-col">
                  <span className="pr-meta-label">VAT</span>
                  <span className="pr-meta-value">{val(vat)}</span>
                </div>
                <div className="pr-meta-col">
                  <span className="pr-meta-label">Reference</span>
                  <span className="pr-meta-value">{val(reference)}</span>
                </div>
              </div>

              <div className="pr-section-title">Customer Information</div>
              <div className="pr-customer-grid">
                <div className="pr-customer-row">
                  <span className="pr-field-label">Customer ID</span>
                  <span className="pr-field-value">{val(customerID)}</span>
                </div>
                <div className="pr-customer-row">
                  <span className="pr-field-label">Company Name</span>
                  <span className="pr-field-value">{val(companyName)}</span>
                </div>
                <div className="pr-customer-row">
                  <span className="pr-field-label">Address</span>
                  <span className="pr-field-value">{val(companyAddress)}</span>
                </div>
                <div className="pr-customer-row">
                  <span className="pr-field-label">Contact Person</span>
                  <span className="pr-field-value">{val(contactName)}</span>
                </div>
                <div className="pr-customer-row">
                  <span className="pr-field-label">Contact Info</span>
                  <span className="pr-field-value">{val(contactInfo)}</span>
                </div>
              </div>

              <div className="pr-section-title">Job Numbers</div>
              <table className="pr-table">
                <thead>
                  <tr>
                    <th style={{ width: "6%" }}>No.</th>
                    <th style={{ width: "14%" }}>Job Number</th>
                    <th style={{ width: "13%" }}>Type</th>
                    <th style={{ width: "23%" }}>Description</th>
                    <th style={{ width: "13%" }}>Brand / Model</th>
                    <th style={{ width: "13%" }}>Serial No.</th>
                    <th style={{ width: "9%" }}>Priority</th>
                    <th style={{ width: "9%" }}>ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((job, index) =>
                    job._blank ? (
                      <tr key={job._key}>
                        <td>&nbsp;</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ) : (
                      <tr key={job._id || job.jobNumber || index}>
                        <td>{index + 1}</td>
                        <td>{val(job.jobNumber)}</td>
                        <td>{typeLabel(job.type)}</td>
                        <td>{val(job.description)}</td>
                        <td>
                          {val(job.brand)} / {val(job.model)}
                        </td>
                        <td>{val(job.serialNo)}</td>
                        <td>{val(job.priority)}</td>
                        <td>{job.eta ? formatDate(job.eta) : "---"}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>

              <div className="pr-section-title">Remarks</div>
              <div className="pr-remarks-box">{val(remarks)}</div>

              <div className="pr-signature-row">
                <div className="pr-signature-block">
                  <div className="pr-signature-line" />
                  <div className="pr-signature-label">
                    Prepared By: {val(preparedBy)}
                  </div>
                </div>
                <div className="pr-signature-block">
                  <div className="pr-signature-line" />
                  <div className="pr-signature-label">Received By</div>
                </div>
                <div className="pr-signature-block">
                  <div className="pr-signature-line" />
                  <div className="pr-signature-label">Authorized Signature</div>
                </div>
              </div>

              <div className="pr-footer">
                This receipt serves as proof of item submission for calibration
                services. Please present this upon claiming of items. See the
                attached Conditions of Calibration.
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS — screen only */}
        <div className="jr-modal-actions pr-no-print">
          <div className="jr-modal-actions-left" />
          <div className="jr-modal-actions-right">
            <button className="jr-action-btn" onClick={onClose}>
              Close
            </button>
            <button className="jr-save-btn" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PrintReceiptModal;

const printStyles = `
  .pr-scroll {
    max-height: 70vh;
    overflow-y: auto;
    background: #e9edf1;
    padding: 24px;
  }
  .pr-sheet {
    max-width: 780px;
    margin: 0 auto 24px;
    background: #ffffff;
    padding: 40px 48px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    color: #1c2530;
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  .pr-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .pr-company-name {
    font-size: 19px;
    font-weight: 700;
  }
  .pr-company-sub {
    font-size: 12.5px;
    color: #5b6672;
    margin-top: 2px;
  }
  .pr-header-right {
    text-align: right;
  }
  .pr-doc-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #5b6672;
  }
  .pr-jr-id {
    font-size: 18px;
    font-weight: 700;
    margin-top: 4px;
    color: #1f6feb;
  }
  .pr-divider {
    height: 2px;
    background: #1c2530;
    margin: 16px 0 18px;
  }
  .pr-meta-row {
    display: flex;
    gap: 24px;
    margin-bottom: 22px;
  }
  .pr-meta-col {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pr-meta-label {
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #8892a0;
  }
  .pr-meta-value {
    font-size: 13.5px;
    font-weight: 600;
  }
  .pr-section-title {
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #1f6feb;
    border-bottom: 1px solid #dde2e8;
    padding-bottom: 5px;
    margin-top: 22px;
    margin-bottom: 10px;
  }
  .pr-customer-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pr-customer-row {
    display: flex;
    font-size: 13px;
  }
  .pr-field-label {
    width: 150px;
    flex-shrink: 0;
    color: #5b6672;
  }
  .pr-field-value {
    font-weight: 600;
    color: #1c2530;
  }
  .pr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11.5px;
  }
  .pr-table th {
    text-align: left;
    padding: 6px 6px;
    background: #f2f4f7;
    border: 1px solid #d7dce2;
    font-weight: 700;
    color: #33404d;
  }
  .pr-table td {
    padding: 8px 6px;
    border: 1px solid #d7dce2;
    height: 14px;
  }
  .pr-remarks-box {
    font-size: 13px;
    min-height: 40px;
    border: 1px solid #d7dce2;
    border-radius: 4px;
    padding: 10px 12px;
    color: #33404d;
  }
  .pr-signature-row {
    display: flex;
    justify-content: space-between;
    margin-top: 48px;
    gap: 20px;
  }
  .pr-signature-block {
    flex: 1;
    text-align: center;
  }
  .pr-signature-line {
    border-bottom: 1px solid #1c2530;
    height: 36px;
  }
  .pr-signature-label {
    font-size: 11.5px;
    color: #5b6672;
    margin-top: 6px;
  }
  .pr-footer {
    margin-top: 30px;
    font-size: 10.5px;
    color: #8892a0;
    text-align: center;
    border-top: 1px solid #eef0f3;
    padding-top: 10px;
  }

  /* TAGS PAGE (reuses pr-terms-header/pr-divider from above) */
  .pr-terms-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .pr-terms-title {
    font-size: 13px;
    font-weight: 700;
    margin-top: 4px;
    color: #33404d;
  }

  /* ===================================================================
     CONDITIONS OF CALIBRATION PAGE — letterhead, info bar, numbered list
     =================================================================== */
  .pr-terms-page {
    margin-top: 0;
  }

  .pr-letterhead {
    display: flex;
    align-items: flex-start;
    gap: 22px;
  }
  .pr-logo-circle {
    width: 92px;
    height: 92px;
    border-radius: 50%;
    border: 3px solid #17375e;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    background: #fff;
  }
  .pr-logo-circle img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .pr-logo-fallback {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #17375e;
  }
  .pr-letterhead-text {
    flex: 1;
    text-align: center;
  }
  .pr-letterhead-name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #17375e;
  }
  .pr-letterhead-line {
    font-size: 11.5px;
    color: #33404d;
    margin-top: 2px;
  }
  .pr-letterhead-divider {
    height: 2px;
    background: #17375e;
    margin: 16px 0 14px;
  }

  .pr-info-bar {
    background: #eceef1;
    border: 1px solid #d7dce2;
    border-radius: 3px;
    padding: 8px 14px;
    margin-bottom: 18px;
  }
  .pr-info-row {
    display: flex;
    font-size: 12.5px;
    padding: 3px 0;
  }
  .pr-info-label {
    width: 180px;
    flex-shrink: 0;
    font-weight: 700;
    color: #1c2530;
  }
  .pr-info-value {
    font-weight: 600;
    color: #1c2530;
  }

  .pr-conditions-title {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.4px;
    color: #1c2530;
    margin-top: 4px;
  }
  .pr-conditions-subtitle {
    font-size: 11px;
    font-style: italic;
    color: #5b6672;
    margin-bottom: 12px;
  }

  .pr-conditions-list {
    margin: 0;
    padding-left: 20px;
  }
  .pr-conditions-list li {
    font-size: 11px;
    line-height: 1.55;
    color: #1c2530;
    margin-bottom: 7px;
  }
  .pr-fillblank {
    display: inline-block;
    width: 60px;
    border-bottom: 1px solid #1c2530;
  }

  .pr-thank-you {
    font-size: 12px;
    margin: 16px 0 34px;
  }

  .pr-conforme-row {
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }
  .pr-conforme-block {
    flex: 1;
    text-align: center;
  }
  .pr-conforme-caption {
    font-size: 11.5px;
    font-weight: 700;
    color: #1c2530;
    margin-top: 6px;
  }
  .pr-conforme-name {
    font-size: 11.5px;
    color: #33404d;
    margin-top: 2px;
  }

  @media print {
    /* The modal system (jr-modal-overlay / jr-modal-wrapper) is built for an
       on-screen popup: fixed/absolute positioning, capped heights, and
       overflow:auto scroll areas. Left alone, those ancestors clip the
       print output to whatever fits in the visible scroll box. Strip all of
       that out for print so the browser can lay out and paginate the full
       content instead of just what was scrolled into view. */
    html, body {
      height: auto !important;
      overflow: visible !important;
    }
    .jr-modal-overlay {
      position: static !important;
      display: block !important;
      overflow: visible !important;
      height: auto !important;
      max-height: none !important;
      background: none !important;
    }
    .jr-modal-wrapper {
      position: static !important;
      display: block !important;
      overflow: visible !important;
      height: auto !important;
      max-height: none !important;
      box-shadow: none !important;
    }
    .pr-scroll {
      max-height: none !important;
      overflow: visible !important;
      padding: 0 !important;
      background: none !important;
    }

    body * {
      visibility: hidden;
    }
    #pr-print-area, #pr-print-area * {
      visibility: visible;
    }
    #pr-print-area {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
    #pr-print-area .pr-sheet {
      box-shadow: none !important;
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .pr-terms-page {
      page-break-before: always;
      break-before: page;
      padding-top: 0 !important;
    }
    .pr-receipt-page {
      page-break-before: always;
      break-before: page;
      padding-top: 0 !important;
    }
    @page {
      size: A4;
      margin: 12mm;
    }
  }

  ${jobTagStyles}
`;
