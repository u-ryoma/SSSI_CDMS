// import React from "react";
// import { createPortal } from "react-dom";

// /**
//  * PrintAgreementModal
//  * Printable "Conditions of Calibration" agreement sheet, matching the
//  * paper form used for Concern jobs (2 printed pages):
//  *   PAGE 1 — letterhead, date, Company/Address/Reference/E-Mail/Contact/
//  *            Tel-Fax info box, items 1-12
//  *   PAGE 2 — items 13-15, a bold calibration-result note, Witness /
//  *            Conforme signature blocks, and a doc-footer strip
//  *
//  * NOTE ON FIELDS: `reference` isn't currently on the job/receipt record
//  * anywhere else in the app (search for it — it's not set by
//  * JobReceipt.jsx or /api/jobnumbers), so it renders blank unless you
//  * pass it in via `record.reference`. Same for `agreementNote` — the
//  * bold "As agreed the inst. was calibrated with a max error of ___"
//  * line is job-specific text, so it falls back to a fill-in-the-blank
//  * template if `record.agreementNote` isn't set. Adjust the field names
//  * below to whatever you end up calling them on the record.
//  *
//  * SIGNATURE NAMES:
//  *   - "Conforme" is printed from `record.contactName` (already used in
//  *     the info box up top).
//  *   - "Witness" is printed from `sessionStorage.getItem("name")`, set
//  *     at login (see Login.jsx) for whoever is currently signed in.
//  *   Both names sit above the signature line so the person just signs
//  *   over their printed name, matching the paper form.
//  */

// const val = (v) => (v === undefined || v === null || v === "" ? "" : v);

// const formatDateShort = (dateInput) => {
//   const d = dateInput ? new Date(dateInput) : new Date();
//   if (isNaN(d.getTime())) return "";
//   const year = d.getFullYear();
//   const month = d.toLocaleDateString("en-US", { month: "short" });
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year} ${month} ${day}`;
// };

// const COMPANY = {
//   name: "SCIENTIFIC STANDARDS SERVICES",
//   addressLine: "#9 M. Santos St. Tuktukan Taguig City, Philippines (1637)",
//   telFaxLine: "Tel/Fax:(02)642 3695•6423373•6282410•6280177",
//   emailLine: "stdcalib@yahoo.com • inquiry@scientificstandards.com.ph",
//   website: "www.scientificstandards.com.ph",
// };

// // Items 1-12 print on page 1, 13-15 print on page 2 — matching the
// // paper form's page break exactly (see AGREEMENT_ITEMS below, sliced).
// const AGREEMENT_ITEMS = [
//   "That the calibration will be done In-House (SSS LAB).",
//   "That the customer will ensure that the instruments are in good working condition prior to its calibration.",
//   "That the customer will provide instrument manual and dummy loads if necessary.",
//   "The Calibration of Scientific Standards Services does not include adjustment or repair of the instruments.",
//   "The customer will provide the necessary information, manpower and other means if adjustment is necessary.",
//   "That the pick-up and delivery of instruments for In – House calibration will be shouldered by the customer.",
//   "That the customer agrees to the calibration procedure and traceability of Scientific Standards Services.",
//   "We at Scientific Standards Services are giving our best to be diligent enough in performing the test and or calibration services but no warranties are given and none may be implied directly or indirectly relating to SSS' test and calibration results and facilities. And no event shall SSS be liable for collateral, special, consequential damage, or damages caused by fortuitous events, any error of judgment, fault or negligence of its officers or employees.",
//   "Scientific Standards Services shall have the right to sell instrument / equipment which were not claimed within a period of one hundred twenty (120) days to cover cost of storage, calibration fees and related costs.",
//   "When an equipment for calibration has no Serial Number, Scientific Standards Services will inform the customer that a unique Serial Number or Identification will be engraved to their equipment.",
//   "That the calibration certificate will only be given upon full payment of calibration services.",
//   "This offer is valid for 30 days from date of quotation and thereafter will be subject to a written confirmation.",
//   "The full evaluation of the instrument (UUT) will be done during the scheduled calibration.",
//   <>
//     That as agreed the calibration frequency for these instruments is ({" "}
//     <span className="pa-fillblank" /> ) months/year/s.
//   </>,
//   "Scientific Standards Services will charge 50% of the actual amount of calibration if the instrument was already calibrated and the customer decided to cancel the transaction and pull-out/return without calibration (RWOC) the instrument due to error or discrepancies found during calibration. In this case, SSS can issue a Service Report if applicable.",
// ];
// const PAGE1_ITEMS = AGREEMENT_ITEMS.slice(0, 12);
// const PAGE2_ITEMS = AGREEMENT_ITEMS.slice(12);

// const InfoBox = ({ record }) => (
//   <table className="pa-infobox">
//     <tbody>
//       <tr>
//         <td className="pa-infobox-label">Company Name :</td>
//         <td className="pa-infobox-value" colSpan={3}>
//           {val(record.companyName)}
//         </td>
//       </tr>
//       <tr>
//         <td className="pa-infobox-label">Address :</td>
//         <td className="pa-infobox-value" colSpan={3}>
//           {val(record.companyAddress)}
//         </td>
//       </tr>
//       <tr>
//         <td className="pa-infobox-label">Reference :</td>
//         <td className="pa-infobox-value">{val(record.reference)}</td>
//         <td className="pa-infobox-label">E-Mail :</td>
//         <td className="pa-infobox-value">{val(record.email)}</td>
//       </tr>
//       <tr>
//         <td className="pa-infobox-label">Contact :</td>
//         <td className="pa-infobox-value">{val(record.contactName)}</td>
//         <td className="pa-infobox-label">Tel / Fax # :</td>
//         <td className="pa-infobox-value">
//           {val(record.phoneNumber)}
//           {record.phoneNumber && record.faxNumber ? " / " : ""}
//           {val(record.faxNumber)}
//         </td>
//       </tr>
//     </tbody>
//   </table>
// );

// const ItemsTable = ({ items, startNumber }) => (
//   <table className="pa-items-table">
//     <tbody>
//       {items.map((text, i) => (
//         <tr key={startNumber + i}>
//           <td className="pa-item-no">{startNumber + i}.</td>
//           <td className="pa-item-text">{text}</td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// );

// const PrintAgreementModal = ({ record, onClose }) => {
//   if (!record) return null;

//   const handlePrint = () => window.print();
//   // Date shown is the date this sheet is printed, not a stored job date.
//   const docDate = formatDateShort();

//   // Witness = whoever is logged in (set at /api/login); Conforme = the
//   // job's contact person.
//   const witnessName = val(sessionStorage.getItem("name"));
//   const conformeName = val(record.contactName);

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <style>{printAgreementStyles}</style>

//       <div
//         className="jr-modal-wrapper pa-no-print-bounds"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* HEADER — screen only */}
//         <div className="jr-modal-header pa-no-print">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">
//                 CONDITIONS OF CALIBRATION — PRINT COPY
//               </span>
//               <span className="jr-modal-title-sub">
//                 SCIENTIFIC STANDARDS SERVICES
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close pa-no-print" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {/* PRINTABLE AREA */}
//         <div className="pa-scroll">
//           <div id="pa-print-area">
//             {/* PAGE 1 */}
//             <div className="pa-sheet pa-page1">
//               <div className="pa-page-header">
//                 <div className="pa-company-block">
//                   <div className="pa-company-name">{COMPANY.name}</div>
//                   <div className="pa-company-line">{COMPANY.addressLine}</div>
//                   <div className="pa-company-line">{COMPANY.telFaxLine}</div>
//                   <div className="pa-company-line">{COMPANY.emailLine}</div>
//                 </div>
//                 <div className="pa-doc-date">{docDate}</div>
//               </div>

//               <div className="pa-doc-title">CONDITIONS OF CALIBRATION</div>

//               <InfoBox record={record} />

//               <div className="pa-agree-line">
//                 The customer agrees wherever applicable
//               </div>

//               <ItemsTable items={PAGE1_ITEMS} startNumber={1} />
//             </div>

//             {/* PAGE 2 */}
//             <div className="pa-sheet pa-page2">
//               <ItemsTable items={PAGE2_ITEMS} startNumber={13} />

//               <div className="pa-agreement-note">
//                 {record.agreementNote ? (
//                   record.agreementNote
//                 ) : (
//                   <>
//                     As agreed the inst. was calibrated with a max error of{" "}
//                     <span className="pa-fillblank pa-fillblank-wide" /> @{" "}
//                     <span className="pa-fillblank pa-fillblank-wide" /> only.
//                   </>
//                 )}
//               </div>

//               <div className="pa-sig-row pa-no-split">
//                 <div className="pa-sig-block">
//                   <div className="pa-sig-caption">Witness :</div>
//                   <div className="pa-sig-name">{witnessName}</div>
//                   <div className="pa-sig-line" />
//                   <div className="pa-sig-under">
//                     Signature Over Printed Name
//                   </div>
//                 </div>
//                 <div className="pa-sig-block">
//                   <div className="pa-sig-caption">Conforme :</div>
//                   <div className="pa-sig-name">{conformeName}</div>
//                   <div className="pa-sig-line" />
//                   <div className="pa-sig-under">
//                     Signature Over Printed Name
//                   </div>
//                 </div>
//               </div>

//               <div className="pa-footer">
//                 <div className="pa-footer-left">Conditions of Calibration</div>
//                 <div className="pa-footer-mid">
//                   Reference - {val(record.reference)}
//                   <br />1 of 1
//                 </div>
//                 <div className="pa-footer-right">{COMPANY.website}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ACTIONS — screen only */}
//         <div className="jr-modal-actions pa-no-print">
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

// export default PrintAgreementModal;

// const printAgreementStyles = `
//   .pa-scroll {
//     max-height: 70vh;
//     overflow-y: auto;
//     background: #e9edf1;
//     padding: 24px;
//   }
//   .pa-sheet {
//     max-width: 780px;
//     margin: 0 auto 24px;
//     background: #ffffff;
//     padding: 32px 40px;
//     box-shadow: 0 1px 4px rgba(0,0,0,0.15);
//     color: #1c2530;
//     font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
//     font-size: 12px;
//   }
//   .pa-page-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//   }
//   .pa-company-name {
//     font-size: 15px;
//     font-weight: 800;
//   }
//   .pa-company-line {
//     font-size: 10.5px;
//     color: #33404d;
//     margin-top: 2px;
//   }
//   .pa-doc-date {
//     font-size: 11px;
//     color: #33404d;
//     white-space: nowrap;
//     margin-top: 2px;
//   }
//   .pa-doc-title {
//     text-align: center;
//     font-weight: 800;
//     font-size: 13px;
//     letter-spacing: 0.4px;
//     margin: 14px 0 10px;
//   }

//   .pa-infobox {
//     width: 100%;
//     border-collapse: collapse;
//     margin-bottom: 12px;
//   }
//   .pa-infobox td {
//     border: 1px solid #1c2530;
//     padding: 4px 8px;
//     font-size: 11px;
//     vertical-align: top;
//   }
//   .pa-infobox-label {
//     font-weight: 700;
//     width: 15%;
//     white-space: nowrap;
//   }
//   .pa-infobox-value {
//     width: 35%;
//   }

//   .pa-agree-line {
//     font-style: italic;
//     font-size: 11px;
//     margin-bottom: 6px;
//   }

//   .pa-items-table {
//     width: 100%;
//     border-collapse: collapse;
//   }
//   .pa-items-table td {
//     border: 1px solid #1c2530;
//     padding: 5px 7px;
//     font-size: 10.5px;
//     line-height: 1.4;
//     vertical-align: top;
//     page-break-inside: avoid;
//     break-inside: avoid;
//   }
//   .pa-item-no {
//     width: 24px;
//     text-align: center;
//     font-weight: 700;
//   }

//   .pa-fillblank {
//     display: inline-block;
//     width: 24px;
//     border-bottom: 1px solid #1c2530;
//   }
//   .pa-fillblank-wide {
//     width: 80px;
//   }

//   .pa-agreement-note {
//     font-weight: 800;
//     font-size: 11.5px;
//     margin: 14px 0 26px;
//   }

//   .pa-sig-row {
//     display: flex;
//     justify-content: space-between;
//     gap: 40px;
//     margin-bottom: 24px;
//   }
//   .pa-no-split {
//     page-break-inside: avoid;
//     break-inside: avoid;
//   }
//   .pa-sig-block {
//     flex: 1;
//   }
//   .pa-sig-caption {
//     font-size: 11px;
//     font-weight: 700;
//     margin-bottom: 16px;
//   }
//   .pa-sig-name {
//     font-size: 11px;
//     text-align: center;
//     min-height: 14px;
//   }
//   .pa-sig-line {
//     border-bottom: 1px solid #1c2530;
//     height: 1px;
//   }
//   .pa-sig-under {
//     font-size: 9.5px;
//     color: #5b6672;
//     text-align: center;
//     margin-top: 4px;
//   }

//   .pa-footer {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-end;
//     border-top: 1px solid #d7dce2;
//     padding-top: 8px;
//     font-size: 9.5px;
//     color: #5b6672;
//   }
//   .pa-footer-mid {
//     text-align: center;
//   }
//   .pa-footer-right {
//     text-align: right;
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
//     .pa-scroll {
//       max-height: none !important;
//       overflow: visible !important;
//       padding: 0 !important;
//       background: none !important;
//     }
//     body * {
//       visibility: hidden;
//     }
//     #pa-print-area, #pa-print-area * {
//       visibility: visible;
//     }
//     #pa-print-area {
//       position: absolute;
//       top: 0;
//       left: 0;
//       width: 100%;
//     }
//     #pa-print-area .pa-sheet {
//       box-shadow: none !important;
//       max-width: 100% !important;
//       padding: 0 !important;
//       margin: 0 !important;
//     }
//     .pa-page2 {
//       page-break-before: always;
//       break-before: page;
//     }
//     @page {
//       size: A4;
//       margin: 12mm;
//     }
//   }
// `;
import React, { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

/**
 * PrintAgreementModal
 * Printable "Conditions of Calibration" agreement sheet, matching the
 * paper form used for Concern jobs (2 printed pages):
 *   PAGE 1 — letterhead, date, Company/Address/Reference/E-Mail/Contact/
 *            Tel-Fax info box, items 1-12
 *   PAGE 2 — items 13-15, a bold calibration-result note, Witness /
 *            Conforme signature blocks, and a doc-footer strip
 *
 * EDITABLE: every piece of text on the sheet (date, info box, each
 * numbered condition, the calibration note, the signature names, the
 * reference) can be clicked and edited directly before printing.
 * Edits only affect this printout — nothing is saved back to the job
 * record. "Reset" restores the values pulled from the record.
 *
 * SEND EMAIL: the "Send Email" button renders the two sheets (with any
 * edits) to an A4 PDF in the browser (html2canvas + jsPDF) and POSTs it,
 * base64-encoded, to POST /api/agreements/send-email, which sends it
 * through mailer.js. Needs: npm i html2canvas jspdf
 *
 * FIELD NOTES: `reference` and `agreementNote` aren't set anywhere else
 * in the app yet, so they start blank / as the fill-in-the-blank
 * template unless you pass them on `record`.
 *   - Conforme defaults to `record.contactName`.
 *   - Witness defaults to `sessionStorage.getItem("name")` (set at login).
 */

const val = (v) => (v === undefined || v === null || v === "" ? "" : String(v));

const formatDateShort = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = String(d.getDate()).padStart(2, "0");
  return `${year} ${month} ${day}`;
};

const COMPANY = {
  name: "SCIENTIFIC STANDARDS SERVICES",
  addressLine: "#9 M. Santos St. Tuktukan Taguig City, Philippines (1637)",
  telFaxLine: "Tel/Fax:(02)642 3695•6423373•6282410•6280177",
  emailLine: "stdcalib@yahoo.com • inquiry@scientificstandards.com.ph",
  website: "www.scientificstandards.com.ph",
};

// Default wording of the 15 conditions. Item 13 (kind: "freq") has an
// editable blank in the middle, so it is rendered specially below.
const DEFAULT_ITEMS = [
  "That the calibration will be done In-House (SSS LAB).",
  "That the customer will ensure that the instruments are in good working condition prior to its calibration.",
  "That the customer will provide instrument manual and dummy loads if necessary.",
  "The Calibration of Scientific Standards Services does not include adjustment or repair of the instruments.",
  "The customer will provide the necessary information, manpower and other means if adjustment is necessary.",
  "That the pick-up and delivery of instruments for In – House calibration will be shouldered by the customer.",
  "That the customer agrees to the calibration procedure and traceability of Scientific Standards Services.",
  "We at Scientific Standards Services are giving our best to be diligent enough in performing the test and or calibration services but no warranties are given and none may be implied directly or indirectly relating to SSS' test and calibration results and facilities. And no event shall SSS be liable for collateral, special, consequential damage, or damages caused by fortuitous events, any error of judgment, fault or negligence of its officers or employees.",
  "Scientific Standards Services shall have the right to sell instrument / equipment which were not claimed within a period of one hundred twenty (120) days to cover cost of storage, calibration fees and related costs.",
  "When an equipment for calibration has no Serial Number, Scientific Standards Services will inform the customer that a unique Serial Number or Identification will be engraved to their equipment.",
  "That the calibration certificate will only be given upon full payment of calibration services.",
  "This offer is valid for 30 days from date of quotation and thereafter will be subject to a written confirmation.",
  "The full evaluation of the instrument (UUT) will be done during the scheduled calibration.",
  { kind: "freq" },
  "Scientific Standards Services will charge 50% of the actual amount of calibration if the instrument was already calibrated and the customer decided to cancel the transaction and pull-out/return without calibration (RWOC) the instrument due to error or discrepancies found during calibration. In this case, SSS can issue a Service Report if applicable.",
];

const makeInitialState = (record) => ({
  date: formatDateShort(),
  companyName: val(record.companyName),
  companyAddress: val(record.companyAddress),
  reference: val(record.reference),
  email: val(record.email),
  contactName: val(record.contactName),
  telFax: [val(record.phoneNumber), val(record.faxNumber)]
    .filter(Boolean)
    .join(" / "),
  items: DEFAULT_ITEMS.map((it) => (typeof it === "string" ? it : "")),
  freq: "",
  noteCustom: val(record.agreementNote),
  maxError: "",
  atValue: "",
  witnessName: val(sessionStorage.getItem("name")),
  conformeName: val(record.contactName),
});

/**
 * Click-to-edit plain text. The DOM text is managed through a ref
 * (instead of React children) so typing never fights React's
 * re-rendering. Commits on blur; Enter commits too unless multiline.
 */
const Editable = ({
  value,
  onChange,
  multiline = false,
  placeholder = "",
  className = "",
}) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  return (
    <span
      ref={ref}
      className={`pa-edit${multiline ? " pa-edit-multi" : ""} ${className}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={placeholder}
      onBlur={(e) => {
        const raw = e.currentTarget.innerText;
        onChange(
          multiline ? raw.trim() : raw.replace(/\s*\n+\s*/g, " ").trim(),
        );
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
    />
  );
};

const InfoBox = ({ f, set }) => (
  <table className="pa-infobox">
    <tbody>
      <tr>
        <td className="pa-infobox-label">Company Name :</td>
        <td className="pa-infobox-value" colSpan={3}>
          <Editable
            value={f.companyName}
            onChange={set("companyName")}
            placeholder="Company name"
          />
        </td>
      </tr>
      <tr>
        <td className="pa-infobox-label">Address :</td>
        <td className="pa-infobox-value" colSpan={3}>
          <Editable
            value={f.companyAddress}
            onChange={set("companyAddress")}
            placeholder="Address"
            multiline
          />
        </td>
      </tr>
      <tr>
        <td className="pa-infobox-label">Reference :</td>
        <td className="pa-infobox-value">
          <Editable
            value={f.reference}
            onChange={set("reference")}
            placeholder="Reference"
          />
        </td>
        <td className="pa-infobox-label">E-Mail :</td>
        <td className="pa-infobox-value">
          <Editable
            value={f.email}
            onChange={set("email")}
            placeholder="E-mail"
          />
        </td>
      </tr>
      <tr>
        <td className="pa-infobox-label">Contact :</td>
        <td className="pa-infobox-value">
          <Editable
            value={f.contactName}
            onChange={set("contactName")}
            placeholder="Contact person"
          />
        </td>
        <td className="pa-infobox-label">Tel / Fax # :</td>
        <td className="pa-infobox-value">
          <Editable
            value={f.telFax}
            onChange={set("telFax")}
            placeholder="Tel / Fax"
          />
        </td>
      </tr>
    </tbody>
  </table>
);

const ItemsTable = ({ f, set, setItem, from, to }) => (
  <table className="pa-items-table">
    <tbody>
      {DEFAULT_ITEMS.slice(from, to).map((def, k) => {
        const idx = from + k;
        return (
          <tr key={idx}>
            <td className="pa-item-no">{idx + 1}.</td>
            <td className="pa-item-text">
              {typeof def === "string" ? (
                <Editable
                  value={f.items[idx]}
                  onChange={setItem(idx)}
                  multiline
                  className="pa-edit-block"
                />
              ) : (
                <>
                  That as agreed the calibration frequency for these instruments
                  is ({" "}
                  <Editable
                    value={f.freq}
                    onChange={set("freq")}
                    className="pa-fillblank"
                  />{" "}
                  ) months/year/s.
                </>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const PrintAgreementModal = ({ record, onClose }) => {
  const [f, setF] = useState(() => (record ? makeInitialState(record) : null));

  // --- Send Email panel state ---
  const [sendOpen, setSendOpen] = useState(false);
  const [mailTo, setMailTo] = useState(() => val(record?.email));
  const [mailSubject, setMailSubject] = useState(
    `Conditions of Calibration${record?.jobNumber ? ` - ${record.jobNumber}` : ""}`,
  );
  const [mailMessage, setMailMessage] = useState(
    `Good day,\n\nPlease find attached the Conditions of Calibration${
      record?.jobNumber ? ` for Job Number ${record.jobNumber}` : ""
    }. Kindly review, sign, and return a copy to us.\n\nThank you.\n\nScientific Standards Services`,
  );
  const [mailStatus, setMailStatus] = useState({ type: "", text: "" });
  const [downloading, setDownloading] = useState(false);

  if (!record || !f) return null;

  const set = (key) => (v) => setF((prev) => ({ ...prev, [key]: v }));
  const setItem = (idx) => (v) =>
    setF((prev) => {
      const items = [...prev.items];
      items[idx] = v;
      return { ...prev, items };
    });

  const handlePrint = () => window.print();
  const handleReset = () => setF(makeInitialState(record));

  // Renders each .pa-sheet to an A4 page and returns the jsPDF document.
  const buildPdf = async () => {
    if (document.activeElement?.blur) document.activeElement.blur();
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const sheets = document.querySelectorAll("#pa-print-area .pa-sheet");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210;
    const pageH = 297;
    const margin = 12;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    for (let i = 0; i < sheets.length; i++) {
      const canvas = await html2canvas(sheets[i], {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        // hide edit highlights / placeholders in the captured copy
        onclone: (doc) => {
          doc.getElementById("pa-print-area")?.classList.add("pa-capturing");
        },
      });
      const ratio = canvas.width / canvas.height;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      if (i > 0) pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        margin,
        margin,
        w,
        h,
      );
    }
    return pdf;
  };

  const pdfFileName = () =>
    `Conditions_of_Calibration_${(record.jobNumber || "agreement").replace(/[^\w.-]+/g, "-")}.pdf`;

  // Saves the PDF (with any edits) straight to the user's computer.
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const pdf = await buildPdf();
      pdf.save(pdfFileName());
    } catch (err) {
      console.error("Failed to create PDF:", err);
      window.alert("Could not create the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    const to = mailTo.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      setMailStatus({
        type: "error",
        text: "Enter a valid recipient email address.",
      });
      return;
    }
    setMailStatus({ type: "sending", text: "Preparing PDF and sending..." });
    try {
      const pdfBase64 = (await buildPdf())
        .output("datauristring")
        .split(",")[1];
      const res = await fetch(`${API}/api/agreements/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject: mailSubject.trim() || "Conditions of Calibration",
          text: mailMessage,
          filename: pdfFileName(),
          pdfBase64,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Server error (${res.status})`);
      }
      setMailStatus({ type: "success", text: `Sent to ${to}.` });
    } catch (err) {
      console.error("Failed to send agreement email:", err);
      setMailStatus({
        type: "error",
        text: err.message || "Could not send the email. Please try again.",
      });
    }
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <style>{printAgreementStyles}</style>

      <div
        className="jr-modal-wrapper pa-no-print-bounds"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER — screen only */}
        <div className="jr-modal-header pa-no-print">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">
                CONDITIONS OF CALIBRATION — PRINT COPY
              </span>
              <span className="jr-modal-title-sub">
                SCIENTIFIC STANDARDS SERVICES
              </span>
            </div>
          </div>
          <button className="jr-modal-close pa-no-print" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* EDIT HINT — screen only */}
        <div className="pa-hint pa-no-print">
          Click any text on the sheet to edit it. Changes apply to this printout
          only and are not saved to the job.
        </div>

        {/* PRINTABLE AREA */}
        <div className="pa-scroll">
          <div id="pa-print-area">
            {/* PAGE 1 */}
            <div className="pa-sheet pa-page1">
              <div className="pa-page-header">
                <div className="pa-company-block">
                  <div className="pa-company-name">{COMPANY.name}</div>
                  <div className="pa-company-line">{COMPANY.addressLine}</div>
                  <div className="pa-company-line">{COMPANY.telFaxLine}</div>
                  <div className="pa-company-line">{COMPANY.emailLine}</div>
                </div>
                <div className="pa-doc-date">
                  <Editable
                    value={f.date}
                    onChange={set("date")}
                    placeholder="Date"
                  />
                </div>
              </div>

              <div className="pa-doc-title">CONDITIONS OF CALIBRATION</div>

              <InfoBox f={f} set={set} />

              <div className="pa-agree-line">
                The customer agrees wherever applicable
              </div>

              <ItemsTable f={f} set={set} setItem={setItem} from={0} to={12} />
            </div>

            {/* PAGE 2 */}
            <div className="pa-sheet pa-page2">
              <ItemsTable
                f={f}
                set={set}
                setItem={setItem}
                from={12}
                to={DEFAULT_ITEMS.length}
              />

              <div className="pa-agreement-note">
                {f.noteCustom ? (
                  <Editable
                    value={f.noteCustom}
                    onChange={set("noteCustom")}
                    multiline
                    className="pa-edit-block"
                  />
                ) : (
                  <>
                    As agreed the inst. was calibrated with a max error of{" "}
                    <Editable
                      value={f.maxError}
                      onChange={set("maxError")}
                      className="pa-fillblank pa-fillblank-wide"
                    />{" "}
                    @{" "}
                    <Editable
                      value={f.atValue}
                      onChange={set("atValue")}
                      className="pa-fillblank pa-fillblank-wide"
                    />{" "}
                    only.
                  </>
                )}
              </div>

              <div className="pa-sig-row pa-no-split">
                <div className="pa-sig-block">
                  <div className="pa-sig-caption">Witness :</div>
                  <div className="pa-sig-name">
                    <Editable
                      value={f.witnessName}
                      onChange={set("witnessName")}
                      placeholder="Witness name"
                    />
                  </div>
                  <div className="pa-sig-line" />
                  <div className="pa-sig-under">
                    Signature Over Printed Name
                  </div>
                </div>
                <div className="pa-sig-block">
                  <div className="pa-sig-caption">Conforme :</div>
                  <div className="pa-sig-name">
                    <Editable
                      value={f.conformeName}
                      onChange={set("conformeName")}
                      placeholder="Conforme name"
                    />
                  </div>
                  <div className="pa-sig-line" />
                  <div className="pa-sig-under">
                    Signature Over Printed Name
                  </div>
                </div>
              </div>

              <div className="pa-footer">
                <div className="pa-footer-left">Conditions of Calibration</div>
                <div className="pa-footer-mid">
                  Reference -{" "}
                  <Editable
                    value={f.reference}
                    onChange={set("reference")}
                    placeholder="Reference"
                  />
                  <br />1 of 1
                </div>
                <div className="pa-footer-right">{COMPANY.website}</div>
              </div>
            </div>
          </div>
        </div>

        {/* SEND EMAIL PANEL — screen only */}
        {sendOpen && (
          <div className="pa-send-panel pa-no-print">
            <div className="pa-send-row">
              <label htmlFor="pa-mail-to">To</label>
              <input
                id="pa-mail-to"
                type="email"
                value={mailTo}
                onChange={(e) => setMailTo(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            <div className="pa-send-row">
              <label htmlFor="pa-mail-subject">Subject</label>
              <input
                id="pa-mail-subject"
                type="text"
                value={mailSubject}
                onChange={(e) => setMailSubject(e.target.value)}
              />
            </div>
            <div className="pa-send-row">
              <label htmlFor="pa-mail-message">Message</label>
              <textarea
                id="pa-mail-message"
                rows={4}
                value={mailMessage}
                onChange={(e) => setMailMessage(e.target.value)}
              />
            </div>
            <div className="pa-send-footer">
              <span className={`pa-send-status pa-send-${mailStatus.type}`}>
                {mailStatus.text ||
                  "The sheet is attached as a PDF, including your edits."}
              </span>
              <button
                className="jr-action-btn"
                onClick={() => setSendOpen(false)}
                disabled={mailStatus.type === "sending"}
              >
                Cancel
              </button>
              <button
                className="jr-save-btn"
                onClick={handleSendEmail}
                disabled={mailStatus.type === "sending"}
              >
                {mailStatus.type === "sending" ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}

        {/* ACTIONS — screen only */}
        <div className="jr-modal-actions pa-no-print">
          <div className="jr-modal-actions-left">
            <button className="jr-action-btn" onClick={handleReset}>
              Reset
            </button>
            <button
              className="jr-action-btn"
              onClick={() => {
                setMailStatus({ type: "", text: "" });
                setSendOpen((o) => !o);
              }}
            >
              Send Email
            </button>
            <button
              className="jr-action-btn"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? "Creating PDF..." : "Download PDF"}
            </button>
          </div>
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

export default PrintAgreementModal;

const printAgreementStyles = `
  .pa-hint {
    padding: 8px 24px;
    font-size: 12px;
    color: #475569;
    background: #eef4ff;
    border-bottom: 1px solid #d6e2fb;
  }
  .pa-send-panel {
    padding: 12px 24px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pa-send-row {
    display: grid;
    grid-template-columns: 70px 1fr;
    align-items: start;
    gap: 8px;
  }
  .pa-send-row label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    padding-top: 7px;
  }
  .pa-send-row input,
  .pa-send-row textarea {
    border: 1px solid #cbd2db;
    border-radius: 5px;
    padding: 6px 10px;
    font: inherit;
    font-size: 13px;
    resize: vertical;
  }
  .pa-send-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  .pa-send-status {
    flex: 1;
    font-size: 12px;
    color: #64748b;
  }
  .pa-send-error { color: #b3261e; }
  .pa-send-success { color: #166534; font-weight: 600; }
  .pa-capturing .pa-edit,
  .pa-capturing .pa-edit:empty {
    background: none !important;
    box-shadow: none !important;
  }
  .pa-capturing .pa-edit:empty::before {
    content: none !important;
  }
  .pa-scroll {
    max-height: 70vh;
    overflow-y: auto;
    background: #e9edf1;
    padding: 24px;
  }
  .pa-sheet {
    max-width: 780px;
    margin: 0 auto 24px;
    background: #ffffff;
    padding: 32px 40px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    color: #1c2530;
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
  }
  .pa-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .pa-company-name {
    font-size: 15px;
    font-weight: 800;
  }
  .pa-company-line {
    font-size: 10.5px;
    color: #33404d;
    margin-top: 2px;
  }
  .pa-doc-date {
    font-size: 11px;
    color: #33404d;
    white-space: nowrap;
    margin-top: 2px;
  }
  .pa-doc-title {
    text-align: center;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 0.4px;
    margin: 14px 0 10px;
  }

  .pa-infobox {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
  }
  .pa-infobox td {
    border: 1px solid #1c2530;
    padding: 4px 8px;
    font-size: 11px;
    vertical-align: top;
  }
  .pa-infobox-label {
    font-weight: 700;
    width: 15%;
    white-space: nowrap;
  }
  .pa-infobox-value {
    width: 35%;
  }

  .pa-agree-line {
    font-style: italic;
    font-size: 11px;
    margin-bottom: 6px;
  }

  .pa-items-table {
    width: 100%;
    border-collapse: collapse;
  }
  .pa-items-table td {
    border: 1px solid #1c2530;
    padding: 5px 7px;
    font-size: 10.5px;
    line-height: 1.4;
    vertical-align: top;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .pa-item-no {
    width: 24px;
    text-align: center;
    font-weight: 700;
  }

  /* ---- editable text ---- */
  .pa-edit {
    outline: none;
  }
  .pa-edit-multi,
  .pa-edit-block {
    white-space: pre-wrap;
  }
  .pa-edit-block {
    display: block;
  }
  .pa-fillblank {
    display: inline-block;
    min-width: 36px;
    text-align: center;
    border-bottom: 1px solid #1c2530;
  }
  .pa-fillblank-wide {
    min-width: 80px;
  }

  /* editing affordances: on screen only, never printed */
  @media screen {
    .pa-edit {
      border-radius: 2px;
      cursor: text;
      transition: background-color 0.1s ease;
    }
    .pa-edit:hover {
      background: #f1f6ff;
      box-shadow: 0 0 0 1px #c7d8f8;
    }
    .pa-edit:focus {
      background: #fffbe6;
      box-shadow: 0 0 0 2px #2563eb;
    }
    .pa-edit:empty::before {
      content: attr(data-ph);
      color: #9aa5b1;
      font-style: italic;
    }
    .pa-edit:empty {
      display: inline-block;
      min-width: 60px;
    }
  }

  .pa-agreement-note {
    font-weight: 800;
    font-size: 11.5px;
    margin: 14px 0 26px;
  }

  .pa-sig-row {
    display: flex;
    justify-content: space-between;
    gap: 40px;
    margin-bottom: 24px;
  }
  .pa-no-split {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .pa-sig-block {
    flex: 1;
  }
  .pa-sig-caption {
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 16px;
  }
  .pa-sig-name {
    font-size: 11px;
    text-align: center;
    min-height: 14px;
  }
  .pa-sig-line {
    border-bottom: 1px solid #1c2530;
    height: 1px;
  }
  .pa-sig-under {
    font-size: 9.5px;
    color: #5b6672;
    text-align: center;
    margin-top: 4px;
  }

  .pa-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 1px solid #d7dce2;
    padding-top: 8px;
    font-size: 9.5px;
    color: #5b6672;
  }
  .pa-footer-mid {
    text-align: center;
  }
  .pa-footer-right {
    text-align: right;
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
    .pa-scroll {
      max-height: none !important;
      overflow: visible !important;
      padding: 0 !important;
      background: none !important;
    }
    body * {
      visibility: hidden;
    }
    #pa-print-area, #pa-print-area * {
      visibility: visible;
    }
    #pa-print-area {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
    #pa-print-area .pa-sheet {
      box-shadow: none !important;
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .pa-page2 {
      page-break-before: always;
      break-before: page;
    }
    @page {
      size: A4;
      margin: 12mm;
    }
  }
`;
