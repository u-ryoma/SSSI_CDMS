import React from "react";
import { createPortal } from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import StandardQrCodeDisplay from "./standardQrCodeDisplay";
import "./PrintStandardQrModal.css";

/**
 * PrintStandardQrModal
 *
 * Opens from the "Print Label" button on an Asset Monitoring row. Shows
 * the standard's QR code (via StandardQrCodeDisplay) with Download/Print
 * actions, plus a quick summary of which standard the label belongs to.
 */
const PrintStandardQrModal = ({ standard, onClose }) => {
  if (!standard) return null;

  return createPortal(
    <div className="psq-modal-overlay" onClick={onClose}>
      <div className="psq-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader title="STANDARD QR LABEL" onClose={onClose} />

        <div className="psq-modal-body">
          <div className="psq-summary">
            <div className="psq-summary-code">{standard.code}</div>
            <div className="psq-summary-desc">
              {standard.assetNo} — {standard.description}
            </div>
          </div>

          <StandardQrCodeDisplay standard={standard} size={220} />

          <div className="psq-footer">
            <button type="button" className="psq-close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PrintStandardQrModal;
