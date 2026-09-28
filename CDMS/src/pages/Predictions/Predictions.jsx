import React, { useState, useEffect, useMemo } from "react";
import "../OngoingCalibration/Ongoinglistcalib.css";
import usePredictions from "../../hooks/usePredictions";
import { fmtDateTime, fmtMinutes, stageLabel } from "../../components/EtaBadge";

const API = import.meta.env.VITE_API_URL;

const card = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: "12px 16px",
  background: "#fff",
  minWidth: 180,
};
const cardLabel = { fontSize: 12, color: "#666", marginBottom: 4 };
const cardValue = { fontSize: 22, fontWeight: 700 };

const statusPill = (bg, color) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 600,
  background: bg,
  color,
});

const Predictions = () => {
  const { jobs, model, loading, error, reload } = usePredictions();
  const [stages, setStages] = useState([]);
  const [onlyAtRisk, setOnlyAtRisk] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [retraining, setRetraining] = useState(false);

  const fetchStages = async () => {
    try {
      const res = await fetch(`${API}/api/predictions/stages`);
      const data = await res.json();
      setStages(data.success ? data.stages : []);
    } catch (err) {
      console.error("Failed to load stage stats:", err);
      setStages([]);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleRefresh = () => {
    reload();
    fetchStages();
  };

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      // Keep whatever data choice the model already uses
      const res = await fetch(`${API}/api/predictions/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          includeSimulated: model?.includeSimulated !== false,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Retrain failed");
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert("Could not retrain the model. Please try again.");
    } finally {
      setRetraining(false);
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (onlyAtRisk && !j.atRisk) return false;
      if (!q) return true;
      return [j.jobNumber, j.companyName, j.description].some((v) =>
        (v || "").toLowerCase().includes(q),
      );
    });
  }, [jobs, onlyAtRisk, search]);

  const atRiskCount = jobs.filter((j) => j.atRisk).length;
  const metrics = model?.metrics || {};
  const slowest = stages.find((s) => s.avgWorkingMin != null);

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>PREDICTED TURNAROUND (AI)</h2>
      </div>

      {/* ---------- Summary cards ---------- */}
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "12px 0" }}
      >
        <div style={card}>
          <div style={cardLabel}>Jobs in progress</div>
          <div style={cardValue}>{jobs.length}</div>
        </div>
        <div style={card}>
          <div style={cardLabel}>Predicted to miss ETA</div>
          <div
            style={{ ...cardValue, color: atRiskCount ? "#b42318" : "#067647" }}
          >
            {atRiskCount}
          </div>
        </div>
        <div style={card}>
          <div style={cardLabel}>Longest stage (average)</div>
          <div style={{ ...cardValue, fontSize: 16 }}>
            {slowest
              ? `${stageLabel(slowest.stage)} · ${fmtMinutes(slowest.avgWorkingMin)}`
              : "-"}
          </div>
        </div>
        <div style={card}>
          <div style={cardLabel}>Prediction method</div>
          <div style={{ ...cardValue, fontSize: 16 }}>
            {model
              ? model.usingMachineLearning
                ? "Machine learning"
                : "Baseline (median)"
              : "-"}
          </div>
          {model?.usingMachineLearning && metrics.forestMAE != null && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              Avg error {fmtMinutes(metrics.forestMAE)} per stage vs{" "}
              {fmtMinutes(metrics.baselineMAE)} baseline
              {metrics.improvementPct != null &&
                ` (${metrics.improvementPct}% better)`}
            </div>
          )}
        </div>
      </div>

      {model?.includeSimulated && (
        <div
          style={{
            background: "#fff8e1",
            border: "1px solid #f0d98a",
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 13,
            marginBottom: 10,
          }}
        >
          The model was trained with <strong>simulated</strong> data for
          demonstration. Predictions will improve as real jobs are completed.
        </div>
      )}

      {/* ---------- Controls ---------- */}
      <div className="calibration-search">
        <input
          type="text"
          placeholder="Search job number, company, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            checked={onlyAtRisk}
            onChange={(e) => setOnlyAtRisk(e.target.checked)}
          />
          At-risk only
        </label>
        <button onClick={handleRefresh}>Refresh</button>
        <button onClick={handleRetrain} disabled={retraining}>
          {retraining ? "Retraining..." : "Retrain Model"}
        </button>
      </div>

      {error && (
        <div style={{ color: "#b42318", margin: "6px 0" }}>{error}</div>
      )}

      <div className="search-results-info">
        <span>
          Showing <strong>{visible.length}</strong> of{" "}
          <strong>{jobs.length}</strong> jobs in progress
        </span>
      </div>

      {/* ---------- Jobs in progress ---------- */}
      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Company</th>
              <th>Description</th>
              <th>Current Stage</th>
              <th>Priority</th>
              <th>Manual ETA</th>
              <th>Predicted Completion</th>
              <th>Remaining Work</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : visible.length > 0 ? (
              visible.map((j) => (
                <React.Fragment key={j.jobNumber}>
                  <tr
                    className="clickable-row"
                    onClick={() =>
                      setExpanded(expanded === j.jobNumber ? null : j.jobNumber)
                    }
                  >
                    <td>{j.jobNumber}</td>
                    <td>{j.companyName}</td>
                    <td>{j.description}</td>
                    <td>{stageLabel(j.currentStage)}</td>
                    <td>{j.priority}</td>
                    <td>{j.manualEta || "-"}</td>
                    <td>{fmtDateTime(j.predictedCompletion)}</td>
                    <td>{fmtMinutes(j.remainingWorkingMin)}</td>
                    <td>
                      {j.manualEta ? (
                        j.atRisk ? (
                          <span style={statusPill("#fde2e2", "#b42318")}>
                            At risk · {j.daysLateVsManualEta}d late
                          </span>
                        ) : (
                          <span style={statusPill("#dcfae6", "#067647")}>
                            On track
                          </span>
                        )
                      ) : (
                        <span style={statusPill("#eee", "#555")}>
                          No ETA set
                        </span>
                      )}
                    </td>
                  </tr>
                  {expanded === j.jobNumber && (
                    <tr>
                      <td colSpan="9" style={{ background: "#fafafa" }}>
                        <div style={{ padding: "6px 10px", fontSize: 13 }}>
                          <strong>Remaining stages (working time):</strong>{" "}
                          {j.steps.map((s, i) => (
                            <span key={s.stage}>
                              {i > 0 && " → "}
                              {stageLabel(s.stage)}{" "}
                              <em>{fmtMinutes(s.remainingMin)}</em>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  {jobs.length === 0
                    ? "No jobs are currently in the pipeline."
                    : "No jobs match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Bottlenecks ---------- */}
      <h3 style={{ margin: "24px 0 8px" }}>
        Where time is spent (bottlenecks)
      </h3>
      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Jobs Finished</th>
              <th>Average Time</th>
              <th>Median Time</th>
              <th>Jobs Waiting Now</th>
            </tr>
          </thead>
          <tbody>
            {stages.length > 0 ? (
              stages.map((s) => (
                <tr key={s.stage}>
                  <td>{stageLabel(s.stage)}</td>
                  <td>{s.finishedCount}</td>
                  <td>{fmtMinutes(s.avgWorkingMin)}</td>
                  <td>{fmtMinutes(s.medianWorkingMin)}</td>
                  <td>{s.jobsWaitingNow}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No stage data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Predictions;
