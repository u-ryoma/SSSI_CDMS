import { createPortal } from "react-dom";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  type,
}) => {
  const handleOverlayClick = (e) => {
    e.stopPropagation();
    onCancel?.();
  };

  return createPortal(
    <div className="cdms-confirm-overlay" onClick={handleOverlayClick}>
      <div className="cdms-confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="cdms-confirm-header">
          <span
            className={
              type === "danger"
                ? "cdms-confirm-icon cdms-confirm-icon-danger"
                : "cdms-confirm-icon"
            }
          >
            {type === "danger" ? "⚠" : "ℹ"}
          </span>
          <h2 className="cdms-confirm-title">{title}</h2>
        </div>
        <p className="cdms-confirm-message">{message}</p>
        <div className="cdms-confirm-actions">
          {onCancel && (
            <button className="cdms-confirm-cancel-btn" onClick={onCancel}>
              {cancelLabel || "Cancel"}
            </button>
          )}
          <button
            className={
              type === "danger" ? "cdms-confirm-btn-danger" : "cdms-confirm-btn"
            }
            onClick={onConfirm}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
