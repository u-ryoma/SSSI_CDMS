import React from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import "./QuotationFilesModal.css";

/**
 * QuotationFilesModal — "Standard Files" popup shown from
 * QuotationDetailsModal's "View Files" button.
 *
 * Takes the already-computed `files` list (each { url, filename, label })
 * and just renders them — no fetching, since (per QuotationDetailsModal's
 * notes) all file URLs already live directly on the quotation document.
 */
const QuotationFilesModal = ({ files = [], onClose }) => {
  return (
    <div className="qtn-modal-overlay">
      <div className="qtn-files-modal">
        <CdmsModalHeader title="STANDARD FILES" onClose={onClose} />

        <div className="qtn-files-modal-body">
          <div className="qtn-files-modal-section-title">Undated</div>
          <div className="qtn-files-modal-divider" />

          {files.length === 0 ? (
            <div className="qtn-files-modal-empty">
              No files attached to this quotation.
            </div>
          ) : (
            <div className="qtn-files-modal-list">
              {files.map((f, idx) => (
                <a
                  key={f.url || idx}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="qtn-files-modal-item"
                >
                  <div className="qtn-files-modal-icon">📄</div>
                  <div className="qtn-files-modal-text">
                    <div className="qtn-files-modal-filename">{f.filename}</div>
                    <div className="qtn-files-modal-label">{f.label}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="qtn-files-modal-footer">
          <button className="qtn-btn qtn-btn-pill" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationFilesModal;
