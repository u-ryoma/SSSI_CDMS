import React, { useState } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path to wherever this actually lives
import "./DeliveryReceiptModals.css";

// Step 1 modal: lets the user choose whether they're releasing an
// instrument or releasing a certificate. Calling onSelect(type) with
// type === "instrument" | "certificate" and closing is left to the parent
// (DeliveryReceiptList), which decides which follow-up modal to open.
const DeliveryTypeModal = ({ isOpen, onClose, onSelect }) => {
  const [choice, setChoice] = useState("instrument");

  if (!isOpen) return null;

  const handleContinue = () => {
    onSelect(choice);
  };

  return ReactDOM.createPortal(
    <div className="dr-modal-overlay">
      <div className="dr-modal dr-modal--small">
        <CdmsModalHeader title="DELIVERY RECEIPT" onClose={onClose} />

        <div className="dr-modal-body">
          <label className="dr-radio-row">
            <input
              type="radio"
              name="deliveryType"
              value="instrument"
              checked={choice === "instrument"}
              onChange={() => setChoice("instrument")}
            />
            <span>Release Instrument</span>
          </label>

          <label className="dr-radio-row">
            <input
              type="radio"
              name="deliveryType"
              value="certificate"
              checked={choice === "certificate"}
              onChange={() => setChoice("certificate")}
            />
            <span>Release Certificate</span>
          </label>

          <div className="dr-modal-actions dr-modal-actions--right">
            <button className="dr-btn dr-btn--primary" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeliveryTypeModal;
