import React, { useState } from "react";
import { createPortal } from "react-dom";
import "./ForPrintFinalDetailsModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import ConfirmDialog from "../../components/ConfirmDialog";

/**
 * ForPrintFinalDetailsModal
 *
 * Read-only "final certificate" review screen shown when a row is
 * clicked in PrintFinal.jsx. Layout follows the same left/mid/dates
 * column pattern as ForCheckingSigDetailsModal, but drops the
 * calibration-standard grid and accreditation/procedure section, and
 * swaps the primary action for printing the final certificate.
 *
 * NOTE ON IMPORT PATHS: this assumes ForPrintFinalDetailsModal.jsx sits
 * flat in src/pages/OnGoingCalibration/ alongside PrintFinal.jsx, same
 * as ForCheckingSigDetailsModal.jsx. Adjust the CdmsModalHeader and
 * ConfirmDialog import paths if your folder structure differs.
 */
const ForPrintFinalDetailsModal = ({
  jobForm,
  onClose,
  onOpenCamera,
  onOpenFolder,
  onPrintFinalCertificate,
  onUpdate,
  onLogForRetyping,
  isUpdateEnabled = false,
}) => {
  // ---- Confirm dialog (same pattern as the other stage modals) ----
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    type: "default",
  });

  const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

  const showConfirm = (title, message, onConfirm, type = "default") => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm,
      onCancel: hideDialog,
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      type,
    });
  };

  const handlePrintFinalCertificateClick = () => {
    showConfirm(
      "Print Final Certificate",
      `Are you sure you want to print the final certificate for Job Number ${jobForm.jobNumber}?`,
      () => {
        hideDialog();
        onPrintFinalCertificate?.();
      },
      "default",
    );
  };

  const handleUpdateClick = () => {
    showConfirm(
      "Confirm Update",
      `Are you sure you want to update Job Number ${jobForm.jobNumber}?`,
      () => {
        hideDialog();
        onUpdate?.();
      },
      "default",
    );
  };

  const handleLogForRetypingClick = () => {
    showConfirm(
      "Log for Re-Typing",
      `Are you sure you want to send Job Number ${jobForm.jobNumber} back for re-typing? This will return it to the typist.`,
      () => {
        hideDialog();
        onLogForRetyping?.();
      },
      "danger",
    );
  };

  const handleExitClick = () => {
    showConfirm(
      "Confirm Exit",
      "Are you sure you want to exit this report?",
      () => {
        hideDialog();
        onClose();
      },
    );
  };

  return createPortal(
    <div className="pfc-modal-overlay" onClick={handleExitClick}>
      <div className="pfc-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title="PRINT FINAL CERTIFICATE"
          onClose={handleExitClick}
        />

        <div className="pfc-modal-scroll">
          <div className="pfc-top-meta">
            <div className="pfc-meta-row">
              <label>Job Number</label>
              <input type="text" value={jobForm.jobNumber || ""} disabled />
            </div>
            <div className="pfc-meta-row">
              <label>Date Received</label>
              <input type="text" value={jobForm.dateRec || ""} disabled />
            </div>
          </div>

          <div className="pfc-body">
            {/* LEFT COLUMN */}
            <div className="pfc-col pfc-col-left">
              <div className="pfc-field">
                <label>Company</label>
                <textarea value={jobForm.companyName || ""} rows={2} disabled />
              </div>
              <div className="pfc-field">
                <label>Description</label>
                <div className="pfc-input-with-btn">
                  <textarea
                    value={jobForm.description || ""}
                    rows={2}
                    disabled
                  />
                  <button type="button" className="pfc-lookup-btn" disabled>
                    🔍
                  </button>
                </div>
              </div>
              <div className="pfc-field">
                <label>Brand</label>
                <input type="text" value={jobForm.brand || ""} disabled />
              </div>
              <div className="pfc-field">
                <label>Model</label>
                <input type="text" value={jobForm.model || ""} disabled />
              </div>
              <div className="pfc-field">
                <label>Serial No.</label>
                <input type="text" value={jobForm.serialNo || ""} disabled />
              </div>
              <div className="pfc-field">
                <label>Remarks</label>
                <textarea value={jobForm.remarks || ""} rows={2} disabled />
              </div>
            </div>

            {/* MIDDLE COLUMN */}
            <div className="pfc-col pfc-col-mid">
              <div className="pfc-inline-field">
                <label>OIC</label>
                <input type="text" value={jobForm.evalBy || ""} disabled />
              </div>
              <div className="pfc-inline-field">
                <label>SIG</label>
                <input type="text" value={jobForm.sig || ""} disabled />
              </div>
              <div className="pfc-inline-field">
                <label>Frequency</label>
                <input type="text" value={jobForm.frequency || ""} disabled />
              </div>
              <div className="pfc-field">
                <label>Con Cert</label>
                <div className="pfc-input-with-btn">
                  <input
                    type="text"
                    value={jobForm.contactCert || ""}
                    disabled
                  />
                  <button type="button" className="pfc-lookup-btn" disabled>
                    🔍
                  </button>
                </div>
              </div>
              <div className="pfc-field">
                <label>Uncertainty</label>
                <input type="text" value={jobForm.uncertainty || ""} disabled />
              </div>
              <div className="pfc-field">
                <label>Range</label>
                <textarea value={jobForm.range || ""} rows={2} disabled />
              </div>
              <div className="pfc-field">
                <label>Concern</label>
                <textarea value={jobForm.concern || ""} rows={3} disabled />
              </div>
            </div>

            {/* DATE / PRIORITY COLUMN */}
            <div className="pfc-col pfc-col-dates">
              <div className="pfc-inline-field">
                <label>Date Cal</label>
                <input type="text" value={jobForm.dateCal || ""} disabled />
              </div>
              <div className="pfc-inline-field">
                <label>Date Due</label>
                <input type="text" value={jobForm.dateDue || ""} disabled />
              </div>
              <div className="pfc-inline-field">
                <label>Priority</label>
                <input type="text" value={jobForm.priority || ""} disabled />
              </div>
            </div>
          </div>

          <div className="pfc-camera-actions">
            <button type="button" onClick={onOpenCamera}>
              Open Camera
            </button>
            <button type="button" onClick={onOpenFolder}>
              Open Folder
            </button>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pfc-footer">
            <div className="pfc-footer-row">
              <button
                type="button"
                className="pfc-primary-btn"
                onClick={handlePrintFinalCertificateClick}
              >
                Print Final Certificate &amp; Print PDF File
              </button>
              <button
                type="button"
                onClick={handleUpdateClick}
                disabled={!isUpdateEnabled}
              >
                Update
              </button>
              <button type="button" onClick={handleExitClick}>
                Exit
              </button>
            </div>
            <div className="pfc-footer-row pfc-footer-row-secondary">
              <button type="button" onClick={handleLogForRetypingClick}>
                Log for Re-Typing
              </button>
            </div>
          </div>
        </div>
      </div>

      {dialog.show && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          type={dialog.type}
        />
      )}
    </div>,
    document.body,
  );
};

export default ForPrintFinalDetailsModal;
