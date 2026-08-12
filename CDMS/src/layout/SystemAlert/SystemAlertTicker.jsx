import React, { useLayoutEffect, useRef, useState } from "react";
import { useSystemAlerts } from "./SystemAlertContext";
import { SEVERITY } from "./severity";

function AlertItem({ a }) {
  const cfg = SEVERITY[a.severity] || SEVERITY.info;
  const Icon = cfg.icon;
  return (
    <div style={{ ...styles.item, background: cfg.bg }}>
      <Icon size={13} color={cfg.text} strokeWidth={2.3} />
      <span style={{ ...styles.badge, color: cfg.text }}>
        {cfg.label.toUpperCase()}
      </span>
      <span style={{ ...styles.msg, color: cfg.text }}>{a.message}</span>
      <span style={{ ...styles.divider, color: cfg.divider }}>◆</span>
    </div>
  );
}

export default function SystemAlertTicker() {
  const { alerts } = useSystemAlerts();
  const [paused, setPaused] = useState(false);
  const [repeats, setRepeats] = useState(4);

  const wrapRef = useRef(null);
  const blockRef = useRef(null); // hidden single pass, used to measure natural width

  // Recompute how many times "alerts" must repeat so one block is at least
  // as wide as the viewport — otherwise short/few alerts leave a gap of
  // unfilled (dark) space once the colored strip finishes scrolling by.
  useLayoutEffect(() => {
    function recalc() {
      const viewportWidth = wrapRef.current?.offsetWidth || 0;
      const blockWidth = blockRef.current?.offsetWidth || 0;
      if (!viewportWidth || !blockWidth) return;
      const needed = Math.ceil((viewportWidth * 1.2) / blockWidth); // small buffer
      setRepeats(Math.max(2, needed));
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [alerts]);

  if (!alerts || alerts.length === 0) return null;

  const block = Array.from({ length: repeats }, () => alerts).flat();
  const sequence = [...block, ...block]; // two equal blocks → seamless -50% loop
  const duration = Math.max(14, block.length * 6);

  return (
    <div
      ref={wrapRef}
      style={styles.wrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes sysAlertScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .sys-alert-track { animation: none !important; } }
      `}</style>

      {/* invisible, used only to measure the width of one pass */}
      <div style={styles.measurer} aria-hidden="true">
        <div ref={blockRef} style={styles.track}>
          {alerts.map((a, i) => (
            <AlertItem key={`measure-${a.id}-${i}`} a={a} />
          ))}
        </div>
      </div>

      {/* Screen readers get one plain announcement of the real (non-repeated)
          alert list, instead of parsing the visually-duplicated scrolling
          strip below, which is hidden from assistive tech entirely. */}
      <div style={styles.srOnly} role="status" aria-live="polite">
        {alerts
          .map(
            (a) =>
              `${(SEVERITY[a.severity] || SEVERITY.info).label}: ${a.message}`,
          )
          .join(". ")}
      </div>

      <div style={styles.viewport} aria-hidden="true">
        <div
          className="sys-alert-track"
          style={{
            ...styles.track,
            animationDuration: `${duration}s`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {sequence.map((a, i) => (
            <AlertItem key={`${a.id}-${i}`} a={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: 30,
    background: "#1a1a1a",
    overflow: "hidden",
  },
  measurer: {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    top: 0,
    left: 0,
    height: 0,
    overflow: "hidden",
  },
  viewport: { flex: 1, overflow: "hidden", height: "100%" },
  track: {
    display: "flex",
    alignItems: "stretch",
    height: "100%",
    width: "max-content",
    whiteSpace: "nowrap",
    animationName: "sysAlertScroll",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "0 16px",
    height: "100%",
  },
  badge: { fontSize: 11, fontWeight: 800, letterSpacing: "0.05em" },
  msg: { fontSize: 12.5, opacity: 0.92 },
  divider: { marginLeft: 16, fontSize: 8 },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
};
