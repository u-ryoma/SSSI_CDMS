// import React from "react";

// // Formats a date the way it appears on the physical tag sample: "2026 May 07"
// const formatTagDate = (dateInput) => {
//   if (!dateInput) return "---";
//   const d = new Date(dateInput);
//   if (isNaN(d.getTime())) return dateInput;
//   const year = d.getFullYear();
//   const month = d.toLocaleDateString("en-US", { month: "short" });
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year} ${month} ${day}`;
// };

// const tv = (v) => (v === null || v === undefined || v === "" ? "—" : v);

// /**
//  * JobTag
//  * Compact printable equipment tag (form SSS-FRM-004), physically attached
//  * to the instrument while it's in the lab. One prints per Job Number.
//  *
//  * Styles live in `jobTagStyles`, exported below, so a parent (e.g.
//  * PrintReceiptModal) can inject them once alongside its own print CSS
//  * instead of duplicating a <style> tag for every tag instance.
//  */
// const JobTag = ({ job, receiptDate }) => {
//   return (
//     <div className="jt-tag">
//       <div className="jt-top-row">
//         <div className="jt-logo">SSS</div>
//         {/* <div className="jt-form-code">SSS-FRM-004</div> */}
//       </div>

//       {/* TOP — Job Number, Date, Priority */}
//       <div className="jt-job-number">{tv(job.jobNumber)}</div>
//       <div className="jt-line">{formatTagDate(receiptDate)}</div>
//       <div className="jt-line">{tv(job.priority)}</div>

//       <div className="jt-spacer" />

//       {/* MIDDLE — Company, Description, Brand, Model, Serial, Range */}
//       <div className="jt-company">SCIENTIFIC STANDARD SERVICES INC</div>
//       <div className="jt-description">
//         {tv(job.description).toString().toUpperCase()}
//       </div>
//       <div className="jt-line">{tv(job.brand)}</div>
//       <div className="jt-line">{tv(job.model)}</div>
//       <div className="jt-serial">
//         {tv(job.serialNo).toString().toUpperCase()}
//       </div>
//       <div className="jt-line">{tv(job.range)}</div>

//       <div className="jt-spacer" />

//       {/* BOTTOM — ETA, Frequency, Prepared By */}
//       <div className="jt-line">{job.eta ? formatTagDate(job.eta) : "—"}</div>
//       <div className="jt-line">{tv(job.frequency)}</div>
//       <div className="jt-line">{tv(job.evalBy)}</div>
//     </div>
//   );
// };

// export default JobTag;

// export const jobTagStyles = `
//   .jt-tags-grid {
//     display: flex;
//     flex-wrap: wrap;
//     gap: 14px;
//     justify-content: flex-start;
//   }
//   .jt-tag {
//     width: 220px;
//     border: 1px solid #1c2530;
//     padding: 10px 12px 14px;
//     font-family: 'Courier New', Courier, monospace;
//     text-align: center;
//     color: #1c2530;
//     background: #fff;
//   }
//   .jt-top-row {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     margin-bottom: 4px;
//   }
//   .jt-logo {
//     width: 30px;
//     height: 30px;
//     border-radius: 50%;
//     border: 1.5px solid #1c2530;
//     font-size: 8px;
//     font-weight: 700;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }
//   .jt-form-code {
//     font-size: 8.5px;
//     color: #5b6672;
//   }
//   .jt-job-number {
//     font-size: 15px;
//     font-weight: 700;
//     letter-spacing: 0.5px;
//     margin-top: 2px;
//   }
//   .jt-line {
//     font-size: 10.5px;
//     line-height: 1.5;
//   }
//   .jt-spacer {
//     height: 6px;
//   }
//   .jt-company {
//     font-size: 9.5px;
//     font-weight: 700;
//     line-height: 1.3;
//     margin-bottom: 2px;
//   }
//   .jt-description {
//     font-size: 12px;
//     font-weight: 700;
//     margin: 2px 0;
//   }
//   .jt-serial {
//     font-size: 10.5px;
//     font-weight: 700;
//   }

//   @media print {
//     .jt-tag {
//       break-inside: avoid;
//     }
//   }
// `;
// import React from "react";

// // Formats a date the way it appears on the physical tag sample: "2026 May 07"
// const formatTagDate = (dateInput) => {
//   if (!dateInput) return "---";
//   const d = new Date(dateInput);
//   if (isNaN(d.getTime())) return dateInput;
//   const year = d.getFullYear();
//   const month = d.toLocaleDateString("en-US", { month: "short" });
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year} ${month} ${day}`;
// };

// const tv = (v) => (v === null || v === undefined || v === "" ? "—" : v);

// /**
//  * JobTag
//  * Compact printable equipment tag (form SSS-FRM-004), physically attached
//  * to the instrument while it's in the lab. One prints per Job Number.
//  *
//  * Styles live in `jobTagStyles`, exported below, so a parent (e.g.
//  * PrintReceiptModal) can inject them once alongside its own print CSS
//  * instead of duplicating a <style> tag for every tag instance.
//  *
//  * LOGO: pass `logoUrl` with the path to your logo image (defaults to the
//  * same icon used on PrintReceiptModal's letterhead). Pass `logoUrl={null}`
//  * to fall back to the plain "SSS" text badge instead.
//  */
// const JobTag = ({
//   job,
//   receiptDate,
//   logoUrl = "/images/SSSi-Icon-circle.png",
// }) => {
//   return (
//     <div className="jt-tag">
//       <div className="jt-top-row">
//         <div className="jt-logo">
//           {logoUrl ? (
//             <img src={logoUrl} alt="Company logo" />
//           ) : (
//             <span>SSS</span>
//           )}
//         </div>
//         {/* <div className="jt-form-code">SSS-FRM-004</div> */}
//       </div>

//       {/* TOP — Job Number, Date, Priority */}
//       <div className="jt-job-number">{tv(job.jobNumber)}</div>
//       <div className="jt-line">{formatTagDate(receiptDate)}</div>
//       <div className="jt-line">{tv(job.priority)}</div>

//       <div className="jt-spacer" />

//       {/* MIDDLE — Company, Description, Brand, Model, Serial, Range */}
//       <div className="jt-company">SCIENTIFIC STANDARD SERVICES INC</div>
//       <div className="jt-description">
//         {tv(job.description).toString().toUpperCase()}
//       </div>
//       <div className="jt-line">{tv(job.brand)}</div>
//       <div className="jt-line">{tv(job.model)}</div>
//       <div className="jt-serial">
//         {tv(job.serialNo).toString().toUpperCase()}
//       </div>
//       <div className="jt-line">{tv(job.range)}</div>

//       <div className="jt-spacer" />

//       {/* BOTTOM — ETA, Frequency, Prepared By */}
//       <div className="jt-line">{job.eta ? formatTagDate(job.eta) : "—"}</div>
//       <div className="jt-line">{tv(job.frequency)}</div>
//       <div className="jt-line">{tv(job.evalBy)}</div>
//     </div>
//   );
// };

// export default JobTag;

import React from "react";

// Formats a date the way it appears on the physical tag sample: "2026 May 07"
const formatTagDate = (dateInput) => {
  if (!dateInput) return "---";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
  const year = d.getFullYear();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = String(d.getDate()).padStart(2, "0");
  return `${year} ${month} ${day}`;
};

const tv = (v) => (v === null || v === undefined || v === "" ? "—" : v);

/**
 * JobTag
 * Compact printable equipment tag (form SSS-FRM-004), physically attached
 * to the instrument while it's in the lab. One prints per Job Number.
 *
 * Styles live in `jobTagStyles`, exported below, so a parent (e.g.
 * PrintReceiptModal) can inject them once alongside its own print CSS
 * instead of duplicating a <style> tag for every tag instance.
 *
 * LOGO: pass `logoUrl` with the path to your logo image (defaults to the
 * same icon used on PrintReceiptModal's letterhead). Pass `logoUrl={null}`
 * to fall back to the plain "SSS" text badge instead.
 */
const JobTag = ({
  job,
  receiptDate,
  logoUrl = "/images/SSSiLogoforFiles.png",
}) => {
  return (
    <div className="jt-tag">
      <div className="jt-top-row">
        <div className="jt-logo">
          {logoUrl ? (
            <img src={logoUrl} alt="Company logo" />
          ) : (
            <span>SSS</span>
          )}
        </div>
        {/* <div className="jt-form-code">SSS-FRM-004</div> */}
      </div>

      {/* TOP — Job Number, Date, Priority */}
      <div className="jt-job-number">{tv(job.jobNumber)}</div>
      <div className="jt-line">{formatTagDate(receiptDate)}</div>
      <div className="jt-line">{tv(job.priority)}</div>

      <div className="jt-spacer" />

      {/* MIDDLE — Company, Description, Brand, Model, Serial, Range */}
      <div className="jt-company">SCIENTIFIC STANDARD SERVICES INC</div>
      <div className="jt-description">
        {tv(job.description).toString().toUpperCase()}
      </div>
      <div className="jt-line">{tv(job.brand)}</div>
      <div className="jt-line">{tv(job.model)}</div>
      <div className="jt-serial">
        {tv(job.serialNo).toString().toUpperCase()}
      </div>
      <div className="jt-line">{tv(job.range)}</div>

      <div className="jt-spacer" />

      {/* BOTTOM — ETA, Frequency, Prepared By */}
      <div className="jt-line">{job.eta ? formatTagDate(job.eta) : "—"}</div>
      <div className="jt-line">{tv(job.frequency)}</div>
      <div className="jt-line">{tv(job.evalBy)}</div>
    </div>
  );
};

export default JobTag;

export const jobTagStyles = `
  .jt-tags-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    justify-content: flex-start;
  }
  .jt-tag {
    width: 220px;
    border: 1px solid #1c2530;
    padding: 10px 12px 14px;
    font-family: 'Courier New', Courier, monospace;
    text-align: center;
    color: #1c2530;
    background: #fff;
  }
  .jt-top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
  }
  .jt-logo {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1.5px solid #1c2530;
    font-size: 8px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #fff;
  }
  .jt-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .jt-form-code {
    font-size: 8.5px;
    color: #5b6672;
  }
  .jt-job-number {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }
  .jt-line {
    font-size: 10.5px;
    line-height: 1.5;
  }
  .jt-spacer {
    height: 6px;
  }
  .jt-company {
    font-size: 9.5px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 2px;
  }
  .jt-description {
    font-size: 12px;
    font-weight: 700;
    margin: 2px 0;
  }
  .jt-serial {
    font-size: 10.5px;
    font-weight: 700;
  }

  @media print {
    .jt-tag {
      break-inside: avoid;
    }
  }
`;
