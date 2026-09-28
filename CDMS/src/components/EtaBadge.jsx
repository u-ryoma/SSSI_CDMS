import React from "react";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const fmtMinutes = (m) => {
  if (m == null) return "-";
  const h = Math.floor(m / 60);
  const min = Math.round(m % 60);
  return h ? `${h}h ${min}m` : `${min}m`;
};

export const stageLabel = (s) => (s || "").replace(/([a-z])([A-Z])/g, "$1 $2");

const pill = (bg, color) => ({
  display: "inline-block",
  marginLeft: 6,
  padding: "1px 7px",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
  background: bg,
  color,
});

// Small cell for tables: predicted completion date + "At risk" flag.
// `prediction` is one entry from usePredictions().byJob (or undefined).
export default function EtaBadge({ prediction }) {
  if (!prediction) return <span style={{ color: "#999" }}>-</span>;

  const tip =
    `Predicted completion: ${fmtDateTime(prediction.predictedCompletion)}\n` +
    `Remaining work: ${fmtMinutes(prediction.remainingWorkingMin)} (working time)` +
    (prediction.manualEta ? `\nManual ETA: ${prediction.manualEta}` : "");

  return (
    <span title={tip}>
      {fmtDate(prediction.predictedCompletion)}
      {prediction.atRisk && (
        <span style={pill("#fde2e2", "#b42318")}>At risk</span>
      )}
    </span>
  );
}
