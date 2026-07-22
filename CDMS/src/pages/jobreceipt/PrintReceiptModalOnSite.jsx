// import React from "react";
// import { createPortal } from "react-dom";

// /**
//  * PrintReceiptModalOnSite
//  * Same as PrintReceiptModal, but the "Conditions of Calibration" page uses
//  * the On-Site version of the form:
//  *   - DOC ID / ISSUE NO. / REVISION / DATE REV box next to the letterhead
//  *   - "SiteCalibration Number" + "Company Name" line instead of the boxed
//  *     Job Receipt Number / Company Name info bar
//  *   - Condition #1 reworded to "done On-site with the assistance of your
//  *     company's staff" (bold "On-site" instead of "SSS LAB")
//  *   - Pickup/delivery clause dropped (not applicable on-site)
//  *   - New cancellation / re-scheduling clause added
//  *   - Revised signature block (name directly under the line, "Conforme :"
//  *     inline with the label)
//  *
//  * Rendered by JobReceipt.jsx instead of PrintReceiptModal whenever at least
//  * one job number on the receipt has onSite === true.
//  *
//  * Expected `receipt` shape — identical to PrintReceiptModal:
//  * {
//  *   jrId, date, customerID, companyName, companyAddress, contactInfo,
//  *   vat, reference, contactName, preparedBy, remarks,
//  *   jobNumbers: [ { jobNumber, type, description, ..., onSite }, ... ]
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

// const COMPANY = {
//   name: "SCIENTIFIC STANDARD SERVICES INC.",
//   addressLine: "#9 M. Santos St. Tuktukan Taguig City, 1637, PH",
//   phoneLine: "inquiry@scientificstandards.com.ph / stdcalib@yahoo.com",
//   emailLine: "02-8642-3695 | 02-8642-3373 | 02-8628-2410",
//   initials: "SSS",
// };

// // ON-SITE CONDITIONS OF CALIBRATION — 18 items, matching the printed
// // on-site company form (DOC ID: SSS-FRM-001, Issue No. 02, Rev. 01,
// // Date Rev. 2021 JAN 28).
// const CONDITIONS_OF_CALIBRATION_ONSITE = [
//   <>
//     That the calibration of the items will be done <strong>On-site</strong> with
//     the assistance of your company's staff.
//   </>,
//   "That the customer will ensure that the instruments are in good working condition prior to its calibration.",
//   "That the customer will provide instrument manual and dummy loads if necessary.",
//   "That the customer will provide the necessary safety gadgets required in the plant.",
//   "That the customer will ensure that the site calibration area will be restricted from other personnel while calibration is on-going.",
//   "The calibration of Scientific Standards Services does not include adjustment or repair of the instrument.",
//   "The customer will provide the necessary information, manpower and other means if adjustment is necessary.",
//   "That the customer agrees to the calibration procedure and traceability of Scientific Standards Services.",
//   "When an equipment for calibration has no Serial Number, Scientific Standards Services will inform the customer that a unique Serial Number or Identification will be engraved to their equipment.",
//   "We at Scientific Standards Services are giving our best to be diligent enough in performing the test and or calibration services but no warranties are given and none may be implied directly or indirectly relating to SSS' test and calibration results and facilities. And no event shall SSS be liable for collateral, special, consequential damage, or damages caused by fortuitous events, any error of judgment, fault or negligence of its officers or employees.",
//   "Scientific Standards Services shall have the right to sell instrument / equipment which were not claimed within a period of one hundred twenty (120) days to cover cost of storage, calibration fees and related costs.",
//   "Cancellations and/or Re-Scheduling of On-site Calibration should be done at least one (1) week before the scheduled On-Site Calibration. Otherwise, the customer will be charged a minimum fee of Php 3000.00 for the cancellation or Re-Scheduling.",
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

// // LETTERHEAD + DOC-ID BOX — the on-site form pairs the logo/company block
// // with a small bordered "TITLE / DOC ID / ISSUE NO. / REVISION / DATE REV"
// // box in the top right, instead of the plain centered letterhead used on
// // the in-house terms page.
// const LetterheadOnSite = ({ logoUrl }) => (
//   <div className="prs-page-top">
//     <div className="prs-letterhead">
//       <div className="pr-logo-circle">
//         {logoUrl ? (
//           <img src={logoUrl} alt={`${COMPANY.name} logo`} />
//         ) : (
//           <span className="pr-logo-fallback">{COMPANY.initials}</span>
//         )}
//       </div>
//       <div className="prs-letterhead-text">
//         <div className="pr-letterhead-name">{COMPANY.name}</div>
//         <div className="pr-letterhead-line">{COMPANY.addressLine}</div>
//         <div className="pr-letterhead-line">{COMPANY.phoneLine}</div>
//         <div className="pr-letterhead-line">{COMPANY.emailLine}</div>
//       </div>
//     </div>

//     <div className="prs-docbox">
//       <div className="prs-docbox-title">
//         <span className="prs-docbox-title-label">TITLE</span>
//         <span className="prs-docbox-title-value">
//           CONDITIONS OF
//           <br />
//           CALIBRATION
//         </span>
//       </div>
//       <div className="prs-docbox-info">
//         <div className="prs-docbox-row">
//           <span>DOC ID</span>
//           <span>:</span>
//           <span>SSS-FRM-001</span>
//         </div>
//         <div className="prs-docbox-row">
//           <span>ISSUE NO.</span>
//           <span>:</span>
//           <span>02</span>
//         </div>
//         <div className="prs-docbox-row">
//           <span>REVISION</span>
//           <span>:</span>
//           <span>01</span>
//         </div>
//         <div className="prs-docbox-row">
//           <span>DATE REV</span>
//           <span>:</span>
//           <span>2021 JAN 28</span>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const PrintReceiptModalOnSite = ({
//   receipt,
//   onClose,
//   logoUrl = "/images/SSSiLogoforFiles.png",
// }) => {
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

//   // "SiteCalibration Number" — use the first on-site job's own job number
//   // (e.g. an SC/#### number) if one exists, otherwise fall back to the
//   // Job Receipt ID so the field is never blank.
//   const siteCalibrationNumber =
//     jobNumbers.find((j) => j.onSite)?.jobNumber || jrId;

//   const MIN_ROWS = 5;
//   const rows = [...jobNumbers];
//   while (rows.length < MIN_ROWS) {
//     rows.push({ _blank: true, _key: `blank-${rows.length}` });
//   }

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <style>{printStylesOnSite}</style>

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
//                 JOB RECEIPT — PRINT COPY (ON-SITE)
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
//             {/* PAGE 1 — CONDITIONS OF CALIBRATION (on-site version).
//                 No Equipment Tags page here: on-site jobs skip Instrument
//                 Tagging entirely, so there's nothing to tag. */}
//             <div className="pr-sheet pr-terms-page">
//               <LetterheadOnSite logoUrl={logoUrl} />

//               <div className="pr-letterhead-divider" />

//               <div className="prs-siteinfo">
//                 <div className="prs-siteinfo-row">
//                   <span className="prs-siteinfo-label">
//                     SiteCalibration Number
//                   </span>
//                   <span>:</span>
//                   <span className="prs-siteinfo-value">
//                     {val(siteCalibrationNumber)}
//                   </span>
//                 </div>
//                 <div className="prs-siteinfo-row">
//                   <span className="prs-siteinfo-label">Company Name</span>
//                   <span>:</span>
//                   <span className="prs-siteinfo-value">{val(companyName)}</span>
//                 </div>
//               </div>

//               <div className="pr-conditions-title">
//                 CONDITIONS OF CALIBRATION
//               </div>
//               <div className="pr-conditions-subtitle">
//                 *The customer agrees wherever applicable*
//               </div>

//               <ol className="pr-conditions-list">
//                 {CONDITIONS_OF_CALIBRATION_ONSITE.map((item, i) => (
//                   <li key={i}>{item}</li>
//                 ))}
//               </ol>

//               <p className="pr-thank-you">Thank you.</p>

//               <div className="prs-conforme-row">
//                 <div className="prs-conforme-block">
//                   <div className="pr-signature-line" />
//                   <div className="prs-conforme-name">{val(preparedBy)}</div>
//                   <div className="prs-conforme-caption">
//                     Scientific Standard Services Inc.
//                   </div>
//                 </div>
//                 <div className="prs-conforme-block">
//                   <div className="prs-conforme-inline-label">Conforme :</div>
//                   <div className="pr-signature-line" />
//                   <div className="prs-conforme-name">
//                     {contactName ? contactName.toUpperCase() : "---"}
//                   </div>
//                   <div className="prs-conforme-caption">
//                     Signature over Printed Name
//                   </div>
//                   <div
//                     className="pr-signature-line"
//                     style={{ marginTop: 18 }}
//                   />
//                   <div className="prs-conforme-caption">Date</div>
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

// export default PrintReceiptModalOnSite;

// const printStylesOnSite = `
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

//   /* ===================================================================
//      ON-SITE CONDITIONS OF CALIBRATION PAGE
//      =================================================================== */
//   .pr-terms-page {
//     margin-top: 0;
//   }

//   .pr-logo-circle {
//     width: 78px;
//     height: 78px;
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
//     font-size: 13px;
//     font-weight: 800;
//     letter-spacing: 1px;
//     color: #17375e;
//   }
//   .pr-letterhead-name {
//     font-size: 18px;
//     font-weight: 800;
//     letter-spacing: 0.3px;
//     color: #17375e;
//   }
//   .pr-letterhead-line {
//     font-size: 10.5px;
//     color: #33404d;
//     margin-top: 2px;
//   }
//   .pr-letterhead-divider {
//     height: 2px;
//     background: #17375e;
//     margin: 14px 0 14px;
//   }

//   /* top row: letterhead (left) + doc-id box (right) */
//   .prs-page-top {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     gap: 16px;
//   }
//   .prs-letterhead {
//     display: flex;
//     align-items: flex-start;
//     gap: 14px;
//     flex: 1;
//   }
//   .prs-letterhead-text {
//     padding-top: 2px;
//   }

//   .prs-docbox {
//     display: flex;
//     flex-shrink: 0;
//     border: 1px solid #1c2530;
//     font-size: 9.5px;
//   }
//   .prs-docbox-title {
//     display: flex;
//     flex-direction: column;
//     justify-content: center;
//     align-items: center;
//     text-align: center;
//     padding: 4px 8px;
//     border-right: 1px solid #1c2530;
//     width: 90px;
//   }
//   .prs-docbox-title-label {
//     font-size: 8px;
//     color: #5b6672;
//     letter-spacing: 0.5px;
//   }
//   .prs-docbox-title-value {
//     font-weight: 700;
//     margin-top: 3px;
//     line-height: 1.25;
//   }
//   .prs-docbox-info {
//     display: flex;
//     flex-direction: column;
//     justify-content: center;
//     padding: 4px 8px;
//     gap: 2px;
//   }
//   .prs-docbox-row {
//     display: flex;
//     gap: 5px;
//     white-space: nowrap;
//   }
//   .prs-docbox-row span:first-child {
//     font-weight: 700;
//     min-width: 52px;
//   }

//   /* SiteCalibration Number / Company Name line (plain, not boxed) */
//   .prs-siteinfo {
//     margin-bottom: 16px;
//   }
//   .prs-siteinfo-row {
//     display: flex;
//     gap: 6px;
//     font-size: 12.5px;
//     padding: 2px 0;
//   }
//   .prs-siteinfo-label {
//     font-weight: 700;
//     color: #1c2530;
//   }
//   .prs-siteinfo-value {
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
//     margin: 16px 0 28px;
//   }

//   /* on-site signature block */
//   .prs-conforme-row {
//     display: flex;
//     justify-content: space-between;
//     gap: 40px;
//   }
//   .prs-conforme-block {
//     flex: 1;
//     text-align: center;
//   }
//   .prs-conforme-inline-label {
//     text-align: left;
//     font-size: 12px;
//     font-weight: 700;
//     font-style: italic;
//     margin-bottom: 4px;
//   }
//   .prs-conforme-name {
//     font-size: 12px;
//     font-weight: 700;
//     color: #1c2530;
//     margin-top: 6px;
//   }
//   .prs-conforme-caption {
//     font-size: 10.5px;
//     color: #5b6672;
//     margin-top: 2px;
//   }

//   @media print {
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
// `;
import React from "react";
import { createPortal } from "react-dom";

/**
 * PrintReceiptModalOnSite
 * Same as PrintReceiptModal, but the "Conditions of Calibration" page uses
 * the On-Site version of the form:
 *   - DOC ID / ISSUE NO. / REVISION / DATE REV box next to the letterhead
 *   - "SiteCalibration Number" + "Company Name" line instead of the boxed
 *     Job Receipt Number / Company Name info bar
 *   - Condition #1 reworded to "done On-site with the assistance of your
 *     company's staff" (bold "On-site" instead of "SSS LAB")
 *   - Pickup/delivery clause dropped (not applicable on-site)
 *   - New cancellation / re-scheduling clause added
 *   - Revised signature block (name directly under the line, "Conforme :"
 *     inline with the label)
 *
 * Rendered by JobReceipt.jsx instead of PrintReceiptModal whenever at least
 * one job number on the receipt has onSite === true.
 *
 * Expected `receipt` shape — identical to PrintReceiptModal:
 * {
 *   jrId, date, customerID, companyName, companyAddress, contactInfo,
 *   vat, reference, contactName, preparedBy, remarks,
 *   jobNumbers: [ { jobNumber, type, description, ..., onSite }, ... ]
 * }
 */

const val = (v) => (v === null || v === undefined || v === "" ? "---" : v);

const COMPANY = {
  name: "SCIENTIFIC STANDARD SERVICES INC.",
  addressLine: "#9 M. Santos St. Tuktukan Taguig City, 1637, PH",
  phoneLine: "inquiry@scientificstandards.com.ph / stdcalib@yahoo.com",
  emailLine: "02-8642-3695 | 02-8642-3373 | 02-8628-2410",
  initials: "SSS",
};

// ON-SITE CONDITIONS OF CALIBRATION — 18 items, matching the printed
// on-site company form (DOC ID: SSS-FRM-001, Issue No. 02, Rev. 01,
// Date Rev. 2021 JAN 28).
const CONDITIONS_OF_CALIBRATION_ONSITE = [
  <>
    That the calibration of the items will be done <strong>On-site</strong> with
    the assistance of your company's staff.
  </>,
  "That the customer will ensure that the instruments are in good working condition prior to its calibration.",
  "That the customer will provide instrument manual and dummy loads if necessary.",
  "That the customer will provide the necessary safety gadgets required in the plant.",
  "That the customer will ensure that the site calibration area will be restricted from other personnel while calibration is on-going.",
  "The calibration of Scientific Standards Services does not include adjustment or repair of the instrument.",
  "The customer will provide the necessary information, manpower and other means if adjustment is necessary.",
  "That the customer agrees to the calibration procedure and traceability of Scientific Standards Services.",
  "When an equipment for calibration has no Serial Number, Scientific Standards Services will inform the customer that a unique Serial Number or Identification will be engraved to their equipment.",
  "We at Scientific Standards Services are giving our best to be diligent enough in performing the test and or calibration services but no warranties are given and none may be implied directly or indirectly relating to SSS' test and calibration results and facilities. And no event shall SSS be liable for collateral, special, consequential damage, or damages caused by fortuitous events, any error of judgment, fault or negligence of its officers or employees.",
  "Scientific Standards Services shall have the right to sell instrument / equipment which were not claimed within a period of one hundred twenty (120) days to cover cost of storage, calibration fees and related costs.",
  "Cancellations and/or Re-Scheduling of On-site Calibration should be done at least one (1) week before the scheduled On-Site Calibration. Otherwise, the customer will be charged a minimum fee of Php 3000.00 for the cancellation or Re-Scheduling.",
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

// LETTERHEAD + DOC-ID BOX — the on-site form pairs the logo/company block
// with a small bordered "TITLE / DOC ID / ISSUE NO. / REVISION / DATE REV"
// box in the top right, instead of the plain centered letterhead used on
// the in-house terms page.
const LetterheadOnSite = ({ logoUrl }) => (
  <div className="prs-page-top">
    <div className="prs-letterhead">
      <div className="pr-logo-circle">
        {logoUrl ? (
          <img src={logoUrl} alt={`${COMPANY.name} logo`} />
        ) : (
          <span className="pr-logo-fallback">{COMPANY.initials}</span>
        )}
      </div>
      <div className="prs-letterhead-text">
        <div className="pr-letterhead-name">{COMPANY.name}</div>
        <div className="pr-letterhead-line">{COMPANY.addressLine}</div>
        <div className="pr-letterhead-line">{COMPANY.phoneLine}</div>
        <div className="pr-letterhead-line">{COMPANY.emailLine}</div>
      </div>
    </div>

    <div className="prs-docbox">
      <div className="prs-docbox-title">
        <span className="prs-docbox-title-label">TITLE</span>
        <span className="prs-docbox-title-value">
          CONDITIONS OF
          <br />
          CALIBRATION
        </span>
      </div>
      <div className="prs-docbox-info">
        <div className="prs-docbox-row">
          <span>DOC ID</span>
          <span>:</span>
          <span>SSS-FRM-001</span>
        </div>
        <div className="prs-docbox-row">
          <span>ISSUE NO.</span>
          <span>:</span>
          <span>02</span>
        </div>
        <div className="prs-docbox-row">
          <span>REVISION</span>
          <span>:</span>
          <span>01</span>
        </div>
        <div className="prs-docbox-row">
          <span>DATE REV</span>
          <span>:</span>
          <span>2021 JAN 28</span>
        </div>
      </div>
    </div>
  </div>
);

const PrintReceiptModalOnSite = ({
  receipt,
  onClose,
  logoUrl = "/images/SSSiLogoforFiles.png",
}) => {
  if (!receipt) return null;

  const {
    jrId,
    companyName,
    contactName,
    preparedBy,
    jobNumbers = [],
  } = receipt;

  const handlePrint = () => window.print();

  // "SiteCalibration Number" — use the first on-site job's own job number
  // (e.g. an SC/#### number) if one exists, otherwise fall back to the
  // Job Receipt ID so the field is never blank.
  const siteCalibrationNumber =
    jobNumbers.find((j) => j.onSite)?.jobNumber || jrId;

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <style>{printStylesOnSite}</style>

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
                JOB RECEIPT — PRINT COPY (ON-SITE)
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
            {/* PAGE 1 — CONDITIONS OF CALIBRATION (on-site version).
                No Equipment Tags page here: on-site jobs skip Instrument
                Tagging entirely, so there's nothing to tag. */}
            <div className="pr-sheet pr-terms-page">
              <LetterheadOnSite logoUrl={logoUrl} />

              <div className="pr-letterhead-divider" />

              <div className="prs-siteinfo">
                <div className="prs-siteinfo-row">
                  <span className="prs-siteinfo-label">
                    SiteCalibration Number
                  </span>
                  <span>:</span>
                  <span className="prs-siteinfo-value">
                    {val(siteCalibrationNumber)}
                  </span>
                </div>
                <div className="prs-siteinfo-row">
                  <span className="prs-siteinfo-label">Company Name</span>
                  <span>:</span>
                  <span className="prs-siteinfo-value">{val(companyName)}</span>
                </div>
              </div>

              <div className="pr-conditions-title">
                CONDITIONS OF CALIBRATION
              </div>
              <div className="pr-conditions-subtitle">
                *The customer agrees wherever applicable*
              </div>

              <ol className="pr-conditions-list">
                {CONDITIONS_OF_CALIBRATION_ONSITE.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>

              <p className="pr-thank-you">Thank you.</p>

              <div className="prs-conforme-row prs-no-split">
                <div className="prs-conforme-block">
                  <div className="pr-signature-line" />
                  <div className="prs-conforme-name">{val(preparedBy)}</div>
                  <div className="prs-conforme-caption">
                    Scientific Standard Services Inc.
                  </div>
                </div>
                <div className="prs-conforme-block">
                  <div className="prs-conforme-inline-label">Conforme :</div>
                  <div className="pr-signature-line" />
                  <div className="prs-conforme-name">
                    {contactName ? contactName.toUpperCase() : "---"}
                  </div>
                  <div className="prs-conforme-caption">
                    Signature over Printed Name
                  </div>
                  <div
                    className="pr-signature-line"
                    style={{ marginTop: 18 }}
                  />
                  <div className="prs-conforme-caption">Date</div>
                </div>
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

export default PrintReceiptModalOnSite;

const printStylesOnSite = `
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

  /* ===================================================================
     ON-SITE CONDITIONS OF CALIBRATION PAGE
     =================================================================== */
  .pr-terms-page {
    margin-top: 0;
  }

  .pr-logo-circle {
    width: 78px;
    height: 78px;
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
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #17375e;
  }
  .pr-letterhead-name {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.3px;
    color: #17375e;
  }
  .pr-letterhead-line {
    font-size: 10.5px;
    color: #33404d;
    margin-top: 2px;
  }
  .pr-letterhead-divider {
    height: 2px;
    background: #17375e;
    margin: 14px 0 14px;
  }

  /* top row: letterhead (left) + doc-id box (right) */
  .prs-page-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  .prs-letterhead {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    flex: 1;
  }
  .prs-letterhead-text {
    padding-top: 2px;
  }

  .prs-docbox {
    display: flex;
    flex-shrink: 0;
    border: 1px solid #1c2530;
    font-size: 9.5px;
  }
  .prs-docbox-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 4px 8px;
    border-right: 1px solid #1c2530;
    width: 90px;
  }
  .prs-docbox-title-label {
    font-size: 8px;
    color: #5b6672;
    letter-spacing: 0.5px;
  }
  .prs-docbox-title-value {
    font-weight: 700;
    margin-top: 3px;
    line-height: 1.25;
  }
  .prs-docbox-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4px 8px;
    gap: 2px;
  }
  .prs-docbox-row {
    display: flex;
    gap: 5px;
    white-space: nowrap;
  }
  .prs-docbox-row span:first-child {
    font-weight: 700;
    min-width: 52px;
  }

  /* SiteCalibration Number / Company Name line (plain, not boxed) */
  .prs-siteinfo {
    margin-bottom: 16px;
  }
  .prs-siteinfo-row {
    display: flex;
    gap: 6px;
    font-size: 12.5px;
    padding: 2px 0;
  }
  .prs-siteinfo-label {
    font-weight: 700;
    color: #1c2530;
  }
  .prs-siteinfo-value {
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
    margin: 16px 0 28px;
  }

  /* on-site signature block */
  .prs-conforme-row {
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }
  .prs-conforme-block {
    flex: 1;
    text-align: center;
  }
  .prs-conforme-inline-label {
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    font-style: italic;
    margin-bottom: 4px;
  }
  .prs-conforme-name {
    font-size: 12px;
    font-weight: 700;
    color: #1c2530;
    margin-top: 6px;
  }
  .prs-conforme-caption {
    font-size: 10.5px;
    color: #5b6672;
    margin-top: 2px;
  }

  /* Keep the signature block (name, line, "Date") together so it never
     splits across a print page break on its own. */
  .prs-no-split {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .pr-thank-you,
  .pr-conditions-list li {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  @media print {
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
    @page {
      size: A4;
      margin: 12mm;
    }
  }
`;
