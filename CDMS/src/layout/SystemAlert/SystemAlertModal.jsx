import React, { useState } from "react";
import { Send, X, Trash2 } from "lucide-react";
import { useSystemAlerts } from "./SystemAlertContext";
import { SEVERITY } from "./severity";

const BORDER = "#e6e7ea";

export default function SystemAlertModal({ open, onClose }) {
  const { alerts, publishAlert, endAlert } = useSystemAlerts();
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  function resetAndClose() {
    setMessage("");
    setSeverity("info");
    setConfirming(false);
    onClose();
  }

  async function handlePublish() {
    setSubmitting(true);
    setError(null);
    try {
      const username = sessionStorage.getItem("activeUser");
      await publishAlert({ message: message.trim(), severity, username });
      resetAndClose();
    } catch (err) {
      setError(err.message || "Something went wrong publishing this alert.");
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim() || submitting) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    handlePublish();
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>New system alert</div>
            <div style={styles.subtitle}>
              Every active account will see this at the top of their screen.
            </div>
          </div>
          <button
            style={styles.closeBtn}
            onClick={resetAndClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: "16px 20px" }}>
            <label style={styles.fieldLabel}>Message</label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setConfirming(false);
              }}
              placeholder="What should every admin and staff account know right now?"
              maxLength={160}
              rows={3}
              style={styles.textarea}
              autoFocus
            />
            <div style={styles.charCount}>{message.length}/160</div>

            <label style={{ ...styles.fieldLabel, marginTop: 10 }}>
              Severity
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {Object.entries(SEVERITY).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const selected = severity === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => {
                      setSeverity(key);
                      setConfirming(false);
                    }}
                    style={{
                      ...styles.chip,
                      borderColor: selected ? cfg.color : BORDER,
                      background: selected ? cfg.tint : "#fff",
                    }}
                  >
                    <Icon size={13} color={cfg.color} />
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: selected ? cfg.color : "#5b6068",
                      }}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && <div style={styles.errorText}>{error}</div>}
          </div>

          {alerts.length > 0 && (
            <div style={styles.manageSection}>
              <div style={styles.fieldLabel}>
                Currently live ({alerts.length})
              </div>
              <div style={styles.manageList}>
                {alerts.map((a) => {
                  const cfg = SEVERITY[a.severity] || SEVERITY.info;
                  const Icon = cfg.icon;
                  return (
                    <div key={a.id} style={styles.manageRow}>
                      <div
                        style={{ ...styles.manageIcon, background: cfg.tint }}
                      >
                        <Icon size={13} color={cfg.color} />
                      </div>
                      <span style={styles.manageMsg}>{a.message}</span>
                      <button
                        type="button"
                        style={styles.endBtn}
                        onClick={() => endAlert(a.id)}
                        aria-label="End this alert"
                      >
                        <Trash2 size={12} />
                        End
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {confirming && !error && (
            <div style={styles.confirmBanner}>
              Click "Confirm and publish" to broadcast this now — everyone
              active will see it immediately.
            </div>
          )}

          <div style={styles.footer}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={resetAndClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.publishBtn,
                background: confirming ? "#a02725" : "#c9302c",
              }}
              disabled={!message.trim() || submitting}
            >
              <Send size={13} />
              {submitting
                ? "Publishing…"
                : confirming
                  ? "Confirm and publish"
                  : "Publish to all accounts"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20,20,22,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  },
  modal: {
    width: 440,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    fontFamily: "Inter, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "16px 20px 12px",
    borderBottom: `1px solid ${BORDER}`,
  },
  title: { fontWeight: 700, fontSize: 16, color: "#1a1a1a" },
  subtitle: { fontSize: 12.5, color: "#8a8f98", marginTop: 3 },
  closeBtn: {
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f5f7",
    border: "none",
    borderRadius: 6,
    color: "#5b6068",
    cursor: "pointer",
    flexShrink: 0,
  },
  fieldLabel: {
    display: "block",
    fontSize: 11.5,
    fontWeight: 700,
    color: "#5b6068",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  textarea: {
    width: "100%",
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13.5,
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    color: "#1a1a1a",
  },
  charCount: {
    textAlign: "right",
    fontSize: 11,
    color: "#b0b4bb",
    marginTop: 3,
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 12px",
    borderRadius: 7,
    border: "1px solid",
    cursor: "pointer",
  },
  errorText: { marginTop: 10, fontSize: 12.5, color: "#c9302c" },
  confirmBanner: {
    margin: "0 20px 14px",
    padding: "8px 10px",
    borderRadius: 7,
    background: "#fdecec",
    border: "1px solid #f3c6c5",
    fontSize: 12,
    color: "#9c2a28",
    lineHeight: 1.4,
  },
  manageSection: {
    padding: "0 20px 16px",
    borderTop: `1px solid ${BORDER}`,
    paddingTop: 14,
  },
  manageList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxHeight: 160,
    overflowY: "auto",
  },
  manageRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fafafb",
    border: `1px solid ${BORDER}`,
    borderRadius: 7,
    padding: "7px 8px",
  },
  manageIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  manageMsg: {
    flex: 1,
    fontSize: 12.5,
    color: "#2b2f36",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  endBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    color: "#8a8f98",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    padding: "4px 8px",
    cursor: "pointer",
    flexShrink: 0,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    padding: "12px 20px",
    background: "#fafafb",
    borderTop: `1px solid ${BORDER}`,
  },
  cancelBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: "#5b6068",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 7,
    padding: "8px 14px",
    cursor: "pointer",
  },
  publishBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    background: "#c9302c",
    border: "none",
    borderRadius: 7,
    padding: "8px 16px",
    cursor: "pointer",
  },
};
