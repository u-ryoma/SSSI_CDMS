import React from "react";
import "./CdmsModalHeader.css";

/**
 * CdmsModalHeader
 *
 * The dark "CDMS" branded header bar used across all job/calibration
 * modals (Job Number Details, Incoming Calibration Details, Calibration
 * Standard lookup, etc). Pulled out into its own component so every
 * modal stays visually consistent without copy-pasting the header markup.
 */
const CdmsModalHeader = ({
  title,
  subtitleTop = "CALIBRATION DATABASE AND MONITORING SYSTEM",
  subtitleBottom,
  onClose,
}) => (
  <div className="cdms-modal-header">
    <div className="cdms-modal-header-left">
      <div className="cdms-logo">CDMS</div>
      <div className="cdms-modal-title">
        <span className="cdms-modal-title-sub">{subtitleTop}</span>
        <span className="cdms-modal-title-main">{title}</span>
        <span className="cdms-modal-title-sub">
          {subtitleBottom || "\u00A0"}
        </span>
      </div>
    </div>
    {onClose && (
      <button className="cdms-modal-close" onClick={onClose}>
        ✕
      </button>
    )}
  </div>
);

export default CdmsModalHeader;
