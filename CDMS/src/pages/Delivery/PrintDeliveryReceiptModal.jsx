import React from "react";
import { createPortal } from "react-dom";
import DeliveryReceiptTag, {
  deliveryReceiptTagStyles,
} from "./DeliveryReceiptTag";

const val = (v) => (v === null || v === undefined || v === "" ? "---" : v);

/**
 * PrintDeliveryReceiptModal
 * Read-only, printable view of a just-saved Delivery Receipt: one tag per
 * item (mirrors PrintReceiptModal's tags page). No Conditions of
 * Calibration page here — that document is specific to Job Receipts.
 *
 * Expected `receipt` shape (matches the `receipt` field returned by
 * POST /api/deliveryreceipts):
 * {
 *   deliveryReceiptId, date, companyName, type,
 *   items: [ { jobNumber, description, brand, model, serialNo, eta,
 *              frequency, remarks, concern, evaluatedBy } ]
 * }
 */
const PrintDeliveryReceiptModal = ({
  receipt,
  onClose,
  logoUrl = "/images/SSSiLogoforFiles.png",
}) => {
  if (!receipt) return null;

  const { deliveryReceiptId, companyName, date, type, items = [] } = receipt;

  const handlePrint = () => window.print();

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <style>{printStyles}</style>

      <div
        className="jr-modal-wrapper drp-no-print-bounds"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER — screen only */}
        <div className="jr-modal-header drp-no-print">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">
                DELIVERY RECEIPT — PRINT COPY
              </span>
              <span className="jr-modal-title-sub">
                SCIENTIFIC STANDARDS SERVICES
              </span>
            </div>
          </div>
          <button className="jr-modal-close drp-no-print" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* PRINTABLE AREA */}
        <div className="drp-scroll">
          <div id="drp-print-area">
            {items.length > 0 && (
              <div className="drp-sheet drp-tags-page">
                <div className="drp-terms-header">
                  <div>
                    <div className="drp-company-name">Equipment Tags</div>
                    <div className="drp-terms-title">
                      {type === "certificate"
                        ? "Released for Certificate"
                        : "Released for Instrument"}
                      {" — one tag per item"}
                    </div>
                  </div>
                  <div className="drp-header-right">
                    <div className="drp-doc-title">DELIVERY RECEIPT</div>
                    <div className="drp-dr-id">{val(deliveryReceiptId)}</div>
                  </div>
                </div>

                <div className="drp-divider" />

                <div className="drt-tags-grid">
                  {items.map((item, index) => (
                    <DeliveryReceiptTag
                      key={item.id || item.jobNumber || index}
                      item={item}
                      receiptDate={date}
                      deliveryReceiptId={deliveryReceiptId}
                      type={type}
                      companyName={companyName}
                      logoUrl={logoUrl}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS — screen only */}
        <div className="jr-modal-actions drp-no-print">
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

export default PrintDeliveryReceiptModal;

const printStyles = `
  .drp-scroll {
    max-height: 70vh;
    overflow-y: auto;
    background: #e9edf1;
    padding: 24px;
  }
  .drp-sheet {
    max-width: 780px;
    margin: 0 auto 24px;
    background: #ffffff;
    padding: 40px 48px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    color: #1c2530;
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  .drp-terms-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .drp-company-name {
    font-size: 19px;
    font-weight: 700;
  }
  .drp-terms-title {
    font-size: 13px;
    font-weight: 700;
    margin-top: 4px;
    color: #33404d;
  }
  .drp-header-right {
    text-align: right;
  }
  .drp-doc-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #5b6672;
  }
  .drp-dr-id {
    font-size: 18px;
    font-weight: 700;
    margin-top: 4px;
    color: #1f6feb;
  }
  .drp-divider {
    height: 2px;
    background: #1c2530;
    margin: 16px 0 18px;
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
    .drp-scroll {
      max-height: none !important;
      overflow: visible !important;
      padding: 0 !important;
      background: none !important;
    }

    body * {
      visibility: hidden;
    }
    #drp-print-area, #drp-print-area * {
      visibility: visible;
    }
    #drp-print-area {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
    #drp-print-area .drp-sheet {
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

  ${deliveryReceiptTagStyles}
`;
