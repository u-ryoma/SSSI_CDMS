// import React from "react";
// import { createPortal } from "react-dom";
// import JobTag, { jobTagStyles } from "./JobTag";

// /**
//  * PrintReceiptModal
//  * Read-only, printable view of a saved Job Receipt + its Job Numbers:
//  *   PAGE 1 — Equipment Tags (one per Job Number)
//  *   PAGE 2 — Conditions of Calibration (letterhead + doc-id box + terms)
//  *
//  * The old "PAGE 3 — Receipt" (Job Numbers table, customer info, signatures)
//  * has been removed per request; this modal now only prints the tags and
//  * the Conditions of Calibration sheet.
//  *
//  * Reuses the app's existing jr-modal-* classes (from jobreceipt.css) for the
//  * chrome so it looks consistent with AddReceiptModal / JobNumberModal, and
//  * defines its own scoped print rules so only the tags/terms sheets are
//  * printed (each on its own page).
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

// const val = (v) => (v === null || v === undefined || v === "" ? "---" : v);

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

// // LETTERHEAD + DOC-ID BOX — logo/company block on the left, paired with a
// // bordered "TITLE / DOC ID / ISSUE NO. / REVISION / DATE REV" box on the
// // right (same document-control box used on the On-Site version of the
// // form).
// const Letterhead = ({ logoUrl }) => (
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
//         <div className="pr-letterhead-line">{COMPANY.websiteLine}</div>
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

// const PrintReceiptModal = ({
//   receipt,
//   onClose,
//   logoUrl = "/images/SSSiLogoforFiles.png",
// }) => {
//   if (!receipt) return null;

//   const {
//     jrId,
//     companyName,
//     contactName,
//     preparedBy,
//     jobNumbers = [],
//   } = receipt;

//   const handlePrint = () => window.print();

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
//                       receiptDate={receipt.date}
//                       logoUrl={logoUrl}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* PAGE 2 — CONDITIONS OF CALIBRATION (letterhead + doc-id box) */}
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

//               <div className="pr-conforme-row pr-no-split">
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

//   /* TAGS PAGE */
//   .pr-terms-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//   }
//   .pr-company-name {
//     font-size: 19px;
//     font-weight: 700;
//   }
//   .pr-terms-title {
//     font-size: 13px;
//     font-weight: 700;
//     margin-top: 4px;
//     color: #33404d;
//   }

//   /* ===================================================================
//      CONDITIONS OF CALIBRATION PAGE — letterhead + doc-id box, info bar,
//      numbered list
//      =================================================================== */
//   .pr-terms-page {
//     margin-top: 0;
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
//     gap: 22px;
//     flex: 1;
//   }
//   .prs-letterhead-text {
//     flex: 1;
//     text-align: center;
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
//     page-break-inside: avoid;
//     break-inside: avoid;
//   }
//   .pr-fillblank {
//     display: inline-block;
//     width: 60px;
//     border-bottom: 1px solid #1c2530;
//   }

//   .pr-thank-you {
//     font-size: 12px;
//     margin: 16px 0 34px;
//     page-break-inside: avoid;
//     break-inside: avoid;
//   }

//   .pr-conforme-row {
//     display: flex;
//     justify-content: space-between;
//     gap: 40px;
//   }
//   /* Keep the signature block together so it never splits across a print
//      page break on its own. */
//   .pr-no-split {
//     page-break-inside: avoid;
//     break-inside: avoid;
//   }
//   .pr-conforme-block {
//     flex: 1;
//     text-align: center;
//   }
//   .pr-signature-line {
//     border-bottom: 1px solid #1c2530;
//     height: 36px;
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
 * Read-only, printable view of a saved Job Receipt + its Job Numbers:
 *   PAGE 1 — Equipment Tags (one per Job Number)
 *   PAGE 2 — Conditions of Calibration (letterhead + doc-id box + terms)
 *
 * PRINTING: the sheets are rendered twice —
 *   1. inside the on-screen modal (preview), and
 *   2. inside #pr-print-root, a plain portal that is a direct child of
 *      <body>. It is hidden on screen. When printing, everything else in
 *      <body> is display:none and only #pr-print-root is shown, so none of
 *      the modal's / app shell's positioning, overflow or 100vh rules can
 *      clip or blank the output.
 *
 * LOGO: pass `logoUrl` with the path to your logo image (e.g. an asset in
 * /public, like "/logo-sss.png"). If omitted, the default below is used.
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

const val = (v) => (v === null || v === undefined || v === "" ? "---" : v);

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

// LETTERHEAD + DOC-ID BOX — logo/company block on the left, paired with a
// bordered "TITLE / DOC ID / ISSUE NO. / REVISION / DATE REV" box on the
// right (same document-control box used on the On-Site version of the
// form).
const Letterhead = ({ logoUrl }) => (
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
        <div className="pr-letterhead-line">{COMPANY.websiteLine}</div>
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

const PrintReceiptModal = ({
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

  const hasTags = jobNumbers.length > 0;

  const handlePrint = () => window.print();

  // PAGE 1 + PAGE 2 — defined once, rendered in both the on-screen preview
  // and the print-only root below.
  const sheets = (
    <>
      {/* PAGE 1 — EQUIPMENT TAGS (one per Job Number) */}
      {hasTags && (
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
                receiptDate={receipt.date}
                logoUrl={logoUrl}
              />
            ))}
          </div>
        </div>
      )}

      {/* PAGE 2 — CONDITIONS OF CALIBRATION (letterhead + doc-id box).
          Only forces a page break before itself when a tags page exists,
          so there's no blank first page when there are no job numbers. */}
      <div
        className={`pr-sheet pr-terms-page${hasTags ? " pr-break-before" : ""}`}
      >
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

        <div className="pr-conditions-title">CONDITIONS OF CALIBRATION</div>
        <div className="pr-conditions-subtitle">
          *The customer agrees whenever applicable*
        </div>

        <ol className="pr-conditions-list">
          {CONDITIONS_OF_CALIBRATION.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        <p className="pr-thank-you">Thank you.</p>

        <div className="pr-conforme-row pr-no-split">
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
    </>
  );

  return (
    <>
      {/* ON-SCREEN MODAL (preview only — hidden when printing) */}
      {createPortal(
        <div className="jr-modal-overlay" onClick={onClose}>
          <style>{printStyles}</style>

          <div
            className="jr-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER — screen only */}
            <div className="jr-modal-header">
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
              <button className="jr-modal-close" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* PREVIEW AREA */}
            <div className="pr-scroll">
              <div id="pr-print-area">{sheets}</div>
            </div>

            {/* ACTIONS — screen only */}
            <div className="jr-modal-actions">
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
      )}

      {/* PRINT-ONLY COPY — direct child of <body>, hidden on screen */}
      {createPortal(<div id="pr-print-root">{sheets}</div>, document.body)}
    </>
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

  /* TAGS PAGE */
  .pr-terms-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .pr-company-name {
    font-size: 19px;
    font-weight: 700;
  }
  .pr-terms-title {
    font-size: 13px;
    font-weight: 700;
    margin-top: 4px;
    color: #33404d;
  }

  /* ===================================================================
     CONDITIONS OF CALIBRATION PAGE — letterhead + doc-id box, info bar,
     numbered list
     =================================================================== */
  .pr-terms-page {
    margin-top: 0;
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
    gap: 22px;
    flex: 1;
  }
  .prs-letterhead-text {
    flex: 1;
    text-align: center;
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
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .pr-fillblank {
    display: inline-block;
    width: 60px;
    border-bottom: 1px solid #1c2530;
  }

  .pr-thank-you {
    font-size: 12px;
    margin: 16px 0 34px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .pr-conforme-row {
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }
  /* Keep the signature block together so it never splits across a print
     page break on its own. */
  .pr-no-split {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .pr-conforme-block {
    flex: 1;
    text-align: center;
  }
  .pr-signature-line {
    border-bottom: 1px solid #1c2530;
    height: 36px;
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

  /* ===================================================================
     PRINT
     The print root is hidden on screen. When printing, everything else in
     <body> (the app shell AND the on-screen modal) is removed with
     display:none, and only #pr-print-root is shown — so no ancestor's
     fixed/absolute positioning, overflow, 100vh height or visibility can
     clip or blank the output.
     =================================================================== */
  #pr-print-root {
    display: none;
  }

  @media print {
    html, body {
      height: auto !important;
      overflow: visible !important;
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    body > *:not(#pr-print-root) {
      display: none !important;
    }

    #pr-print-root {
      display: block !important;
      position: static !important;
      width: 100%;
    }

    #pr-print-root .pr-sheet {
      box-shadow: none !important;
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    #pr-print-root .pr-break-before {
      break-before: page;
      page-break-before: always;
    }

    /* Tighten the Conditions of Calibration sheet so the terms AND the
       signature block fit on a single A4 page. */
    #pr-print-root .pr-terms-page .pr-logo-circle {
      width: 76px;
      height: 76px;
    }
    #pr-print-root .pr-terms-page .pr-letterhead-name {
      font-size: 19px;
    }
    #pr-print-root .pr-terms-page .pr-letterhead-line {
      font-size: 10.5px;
      margin-top: 1px;
    }
    #pr-print-root .pr-terms-page .pr-letterhead-divider {
      margin: 10px 0 8px;
    }
    #pr-print-root .pr-terms-page .pr-info-bar {
      padding: 5px 12px;
      margin-bottom: 10px;
    }
    #pr-print-root .pr-terms-page .pr-info-row {
      font-size: 11.5px;
      padding: 2px 0;
    }
    #pr-print-root .pr-terms-page .pr-conditions-subtitle {
      margin-bottom: 8px;
    }
    #pr-print-root .pr-terms-page .pr-conditions-list li {
      font-size: 9.8px;
      line-height: 1.38;
      margin-bottom: 4px;
    }
    #pr-print-root .pr-terms-page .pr-thank-you {
      font-size: 11px;
      margin: 10px 0 18px;
    }
    #pr-print-root .pr-terms-page .pr-signature-line {
      height: 26px;
    }
    #pr-print-root .pr-terms-page .pr-conforme-caption,
    #pr-print-root .pr-terms-page .pr-conforme-name {
      font-size: 10.5px;
    }

    @page {
      size: A4;
      margin: 10mm;
    }
  }

  ${jobTagStyles}
`;
