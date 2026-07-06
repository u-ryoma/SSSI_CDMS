import { createPortal } from "react-dom";

const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  type,
}) =>
  createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          {onCancel && (
            <button className="cancel-btn" onClick={onCancel}>
              {cancelLabel || "Cancel"}
            </button>
          )}
          <button
            className={type === "danger" ? "confirm-btn-danger" : "confirm-btn"}
            onClick={onConfirm}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );

export default ConfirmDialog;
