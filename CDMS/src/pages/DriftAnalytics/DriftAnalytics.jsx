import { useEffect, useMemo, useState } from "react";
import "../OngoingCalibration/Ongoinglistcalib.css";
import "./DriftAnalytics.css";

const API = import.meta.env.VITE_API_URL; // if this already ends with /api, drop "/api" below
const DAY = 86400000;
const WARN = 80,
  LIMIT = 100;
const STATUSES = ["Drifting", "Watch", "Stable", "Insufficient data"];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
const fmtNum = (v, suffix = "") => (v == null ? "—" : `${v}${suffix}`);

function StatusBadge({ status }) {
  return (
    <span
      className={`da-badge da-${status.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {status}
    </span>
  );
}

/* ---------- chart: history, linear regression, AI curve, 80% / 100% limits ---------- */
function DriftChart({ item }) {
  const W = 680,
    H = 300,
    m = { l: 48, r: 16, t: 16, b: 34 };
  const iw = W - m.l - m.r,
    ih = H - m.t - m.b;
  const s = item.series;
  const lastT = s[s.length - 1].t;
  const t0 = s[0].t;
  const t1 = lastT + 1.5 * Math.max(item.frequencyDays, 365) * DAY;
  const aiPts = item.ai
    ? item.ai.sweep.map((p) => ({ t: lastT + p.days * DAY, d: p.drift }))
    : [];
  const yMax =
    Math.max(120, ...s.map((p) => p.d), ...aiPts.map((p) => p.d)) * 1.05;

  const x = (t) => m.l + ((t - t0) / (t1 - t0)) * iw;
  const y = (d) => m.t + ih - (Math.min(d, yMax) / yMax) * ih;
  const line = (pts) =>
    pts
      .map(
        (p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.d).toFixed(1)}`,
      )
      .join(" ");

  const fit = item.fit;
  const reg = (t) =>
    fit ? fit.intercept + fit.slope * ((t - fit.t0) / DAY) : null;
  const ticks = Array.from({ length: 5 }, (_, i) => t0 + ((t1 - t0) * i) / 4);
  const yTicks = [0, 40, WARN, LIMIT].concat(yMax > 160 ? [200] : []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="da-chart"
      role="img"
      aria-label="Drift over time"
    >
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={m.l}
            x2={W - m.r}
            y1={y(v)}
            y2={y(v)}
            className={
              v === WARN
                ? "da-warn-line"
                : v === LIMIT
                  ? "da-limit-line"
                  : "da-grid"
            }
          />
          <text x={m.l - 6} y={y(v) + 4} textAnchor="end" className="da-axis">
            {v}%
          </text>
        </g>
      ))}
      {ticks.map((t, i) => (
        <text
          key={i}
          x={x(t)}
          y={H - 10}
          textAnchor="middle"
          className="da-axis"
        >
          {new Date(t).toLocaleDateString("en-PH", {
            month: "short",
            year: "2-digit",
          })}
        </text>
      ))}
      <line
        x1={x(lastT)}
        x2={x(lastT)}
        y1={m.t}
        y2={m.t + ih}
        className="da-today"
      />

      {fit && item.n >= 2 && (
        <>
          <path
            d={line([
              { t: t0, d: reg(t0) },
              { t: lastT, d: reg(lastT) },
            ])}
            className="da-reg"
          />
          <path
            d={line([
              { t: lastT, d: reg(lastT) },
              { t: t1, d: reg(t1) },
            ])}
            className="da-reg da-dash"
          />
        </>
      )}
      {item.ai && (
        <>
          <path
            d={line([{ t: lastT, d: s[s.length - 1].d }, ...aiPts])}
            className="da-ai"
          />
          {item.ai.sweep.map((p) => (
            <circle
              key={p.days}
              cx={x(lastT + p.days * DAY)}
              cy={y(p.drift)}
              r="3"
              className="da-ai-dot"
            >
              <title>{`${p.days} days: ${p.drift}% predicted`}</title>
            </circle>
          ))}
        </>
      )}
      <path d={line(s)} className="da-actual" />
      {s.map((p, i) => (
        <circle
          key={i}
          cx={x(p.t)}
          cy={y(p.d)}
          r="4"
          className={
            i === s.length - 1 && item.anomaly.flag
              ? "da-pt da-pt-anom"
              : "da-pt"
          }
        >
          <title>{`${fmtDate(p.t)}: ${p.d}%`}</title>
        </circle>
      ))}
    </svg>
  );
}

function Legend() {
  return (
    <div className="da-legend">
      <span>
        <i className="da-sw da-sw-actual" /> Actual drift
      </span>
      <span>
        <i className="da-sw da-sw-reg" /> Linear regression
      </span>
      <span>
        <i className="da-sw da-sw-ai" /> AI forecast by interval
      </span>
      <span>
        <i className="da-sw da-sw-warn" /> 80% warning
      </span>
      <span>
        <i className="da-sw da-sw-limit" /> 100% limit
      </span>
    </div>
  );
}

/* ---------- page ---------- */
export default function DriftAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API}/api/drift/instruments`);
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      setData(await r.json());
    } catch (e) {
      setError(e.message || "Failed to load drift analytics");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const retrain = async () => {
    setTraining(true);
    try {
      const r = await fetch(`${API}/api/drift/train`, { method: "POST" });
      const out = await r.json();
      if (!out.ok) setError(out.reason || "Training failed");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setTraining(false);
    }
  };

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.items.filter(
      (i) =>
        (statusFilter === "All" || i.status === statusFilter) &&
        (!q ||
          [i.description, i.companyName, i.brand, i.model, i.serialNo]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    );
  }, [data, statusFilter, query]);

  const selected =
    data?.items.find((i) => i.instrumentKey === selectedKey) || null;
  const cv = data?.model?.cv;

  return (
    <div className="calibration-container da-page">
      <div className="da-header">
        <div>
          <h2>Drift Analytics</h2>
          <p className="da-sub">
            AI forecast of how far each instrument drifts between calibrations,
            and when it should be calibrated next.
          </p>
        </div>
        <button
          className="da-btn"
          onClick={retrain}
          disabled={training || loading}
        >
          {training ? "Training…" : "Retrain model"}
        </button>
      </div>

      {error && <div className="da-error">{error}</div>}
      {loading && !data && <p>Loading…</p>}

      {data && (
        <>
          <div className="da-cards">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`da-card da-card-${s.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
              >
                <span className="da-card-num">{data.counts[s]}</span>
                <span className="da-card-label">{s}</span>
              </button>
            ))}
            <div className="da-card da-card-static">
              <span className="da-card-num">{data.anomalies}</span>
              <span className="da-card-label">Unusual results</span>
            </div>
          </div>

          <div className="da-model">
            {data.model ? (
              <>
                <strong>Model:</strong> random forest ({data.model.trees} trees)
                + per-instrument regression, trained on {data.model.samples}{" "}
                calibration pairs from {data.model.instruments} instruments on{" "}
                {fmtDate(data.model.trainedAt)}.
                {cv && (
                  <>
                    {" "}
                    Cross-validated error: <strong>{cv.hybridMAE}</strong>{" "}
                    points (hybrid) vs <strong>{cv.baselineMAE}</strong>{" "}
                    (regression only).
                    {cv.onePriorCalibration && (
                      <>
                        {" "}
                        With just one earlier calibration:{" "}
                        {cv.onePriorCalibration.hybridMAE} vs{" "}
                        {cv.onePriorCalibration.baselineMAE}.
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                No trained model yet. Showing regression-only results; the AI
                model needs at least 20 calibration pairs from 8 instruments.
              </>
            )}
            {data.items.some((i) => i.simulated) && (
              <span className="da-sim"> Includes simulated data.</span>
            )}
          </div>

          <div className="da-filters">
            <input
              placeholder="Search instrument, customer, serial…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="da-table-wrap">
            <table className="calibration-table da-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Customer</th>
                  <th>Serial no.</th>
                  <th>Last calibrated</th>
                  <th>Drift now</th>
                  <th>Trend / month</th>
                  <th>AI at due date</th>
                  <th>Interval (now → AI)</th>
                  <th>Next calibration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr
                    key={i.instrumentKey}
                    onClick={() => setSelectedKey(i.instrumentKey)}
                    className={
                      i.instrumentKey === selectedKey ? "da-selected" : ""
                    }
                  >
                    <td>
                      {i.description || "—"}
                      <div className="da-muted">
                        {[i.brand, i.model].filter(Boolean).join(" ")}
                      </div>
                    </td>
                    <td>{i.companyName || "—"}</td>
                    <td>{i.serialNo || "—"}</td>
                    <td>{fmtDate(i.lastCalibratedAt)}</td>
                    <td>{fmtNum(i.latestDriftPct, "%")}</td>
                    <td>
                      {i.slopePctPerMonth == null
                        ? "—"
                        : `${i.slopePctPerMonth > 0 ? "+" : ""}${i.slopePctPerMonth}%`}
                    </td>
                    <td>{i.ai ? `${i.ai.predictedDriftAtDue}%` : "—"}</td>
                    <td>
                      {i.frequencyDays}d
                      {i.ai ? ` → ${i.ai.recommendedIntervalDays}d` : ""}
                    </td>
                    <td>{fmtDate(i.recommendedNextDate)}</td>
                    <td>
                      <StatusBadge status={i.status} />
                      {i.anomaly.flag && (
                        <span
                          className="da-badge da-anomaly"
                          title={`z = ${i.anomaly.z}`}
                        >
                          Unusual
                        </span>
                      )}
                      {i.simulated && (
                        <span className="da-badge da-simbadge">SIM</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan="10" className="da-empty">
                      No instruments match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selected ? (
            <div className="da-detail">
              <h3>
                {selected.description}{" "}
                <span className="da-muted">
                  {[selected.brand, selected.model].filter(Boolean).join(" ")} ·{" "}
                  {selected.serialNo}
                </span>
              </h3>
              <p className="da-summary">{selected.summary}</p>
              <DriftChart item={selected} />
              <Legend />
              <div className="da-facts">
                <div>
                  <span>Calibrations</span>
                  <b>{selected.n}</b>
                </div>
                <div>
                  <span>Confidence</span>
                  <b>{selected.confidence}</b>
                </div>
                <div>
                  <span>Trend fit (R²)</span>
                  <b>{fmtNum(selected.r2)}</b>
                </div>
                <div>
                  <span>Reaches 80%</span>
                  <b>{fmtDate(selected.projectedWarnDate)}</b>
                </div>
                <div>
                  <span>Reaches 100%</span>
                  <b>{fmtDate(selected.projectedLimitDate)}</b>
                </div>
                <div>
                  <span>Recommended next</span>
                  <b>{fmtDate(selected.recommendedNextDate)}</b>
                </div>
              </div>
              <p className="da-note">
                Drift = the worst test-point error as a percentage of its
                expanded uncertainty. 100% means the error is as large as the
                uncertainty of the measurement.
              </p>
            </div>
          ) : (
            <p className="da-hint">
              Select an instrument to see its drift chart and recommendation.
            </p>
          )}
        </>
      )}
    </div>
  );
}
