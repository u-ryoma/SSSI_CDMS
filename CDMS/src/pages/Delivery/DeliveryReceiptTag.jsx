import React from "react";

// Formats a date the way JobTag does: "2026 May 07"
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
 * DeliveryReceiptTag
 * Compact printable equipment tag for a Delivery Receipt item. One prints
 * per item logged into the receipt (mirrors JobTag's one-per-Job-Number
 * pattern).
 *
 * Deliberately omits fields JobTag has that delivery items don't carry:
 * status/priority ("Normal"), Range, and Next Cal Date — none of those
 * exist on the item shape produced by ReleaseUnitModal / ReleaseCertificateModal.
 *
 * Also deliberately omits Frequency here — not meaningful on a tag whose
 * purpose is to confirm what was released and when, not to schedule the
 * next calibration.
 *
 * `deliveryReceiptId` is the DRID for the receipt this item belongs to
 * (shown separately from the item's own Job Number). `receiptDate` is
 * used as the "Released" date — the date the receipt was actually
 * saved/released, not just a generic document date.
 *
 * `type` is the receipt type ("certificate" | "instrument") and is shown
 * as a small label on the tag so it's clear at a glance what the item was
 * released for.
 *
 * Styles live in `deliveryReceiptTagStyles`, exported below, so a parent
 * (PrintDeliveryReceiptModal) can inject them once alongside its own print
 * CSS instead of duplicating a <style> tag per tag instance.
 */
const DeliveryReceiptTag = ({
  item,
  receiptDate,
  deliveryReceiptId,
  type,
  companyName,
  logoUrl = "/images/SSSiLogoforFiles.png",
}) => {
  const typeLabel =
    type === "certificate"
      ? "CERTIFICATE"
      : type === "instrument"
        ? "INSTRUMENT"
        : null;

  return (
    <div className="drt-tag">
      <div className="drt-top-row">
        <div className="drt-logo">
          {logoUrl ? (
            <img src={logoUrl} alt="Company logo" />
          ) : (
            <span>SSS</span>
          )}
        </div>
      </div>

      {/* TOP — Job Number, DRID, Type */}
      <div className="drt-job-number">{tv(item.jobNumber)}</div>
      <div className="drt-dr-id">DR: {tv(deliveryReceiptId)}</div>
      {typeLabel && <div className="drt-type">{typeLabel}</div>}

      <div className="drt-spacer" />

      {/* MIDDLE — Company, Description, Brand, Model, Serial */}
      <div className="drt-company">
        {(companyName || "SCIENTIFIC STANDARD SERVICES INC")
          .toString()
          .toUpperCase()}
      </div>
      <div className="drt-description">
        {tv(item.description).toString().toUpperCase()}
      </div>
      <div className="drt-line">{tv(item.brand)}</div>
      <div className="drt-line">{tv(item.model)}</div>
      <div className="drt-serial">
        {tv(item.serialNo).toString().toUpperCase()}
      </div>

      <div className="drt-spacer" />

      {/* BOTTOM — ETA, Released Date, Evaluated By */}
      <div className="drt-line">{item.eta ? formatTagDate(item.eta) : "—"}</div>
      <div className="drt-line">Released: {formatTagDate(receiptDate)}</div>
      <div className="drt-line">{tv(item.evaluatedBy)}</div>
    </div>
  );
};

export default DeliveryReceiptTag;

export const deliveryReceiptTagStyles = `
  .drt-tags-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    justify-content: flex-start;
  }
  .drt-tag {
    width: 220px;
    border: 1px solid #1c2530;
    padding: 10px 12px 14px;
    font-family: 'Courier New', Courier, monospace;
    text-align: center;
    color: #1c2530;
    background: #fff;
  }
  .drt-top-row {
    display: flex;
    justify-content: center;
    margin-bottom: 4px;
  }
  .drt-logo {
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
  .drt-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .drt-job-number {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }
  .drt-dr-id {
    font-size: 10.5px;
    font-weight: 700;
    color: #1f6feb;
    letter-spacing: 0.3px;
  }
  .drt-type {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #1f6feb;
    margin-top: 2px;
  }
  .drt-line {
    font-size: 10.5px;
    line-height: 1.5;
  }
  .drt-spacer {
    height: 6px;
  }
  .drt-company {
    font-size: 9.5px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 2px;
  }
  .drt-description {
    font-size: 12px;
    font-weight: 700;
    margin: 2px 0;
  }
  .drt-serial {
    font-size: 10.5px;
    font-weight: 700;
  }

  @media print {
    .drt-tag {
      break-inside: avoid;
    }
  }
`;
