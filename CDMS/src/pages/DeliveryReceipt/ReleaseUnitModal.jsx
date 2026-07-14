import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import "./DeliveryReceiptModals.css";

const API = import.meta.env.VITE_API_URL;

const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

// "RELEASE UNIT" picker, opened from the Add button in
// DeliveryReceiptUnitModal. Loads a list of instruments/jobs ready to be
// released, lets the user click through and add several of them to the
// delivery receipt's item list without closing between picks, then close
// manually when done.
//
// TODO: confirm what "Load" should actually fetch. Right now it pulls
// `${API}/api/jobnumbers` and filters to jobs tagged forDeliveryTagged
// (same tag the list page uses) since that's the closest existing
// pattern - swap the filter/endpoint once the real source is settled.
//
// TODO: "Log" and "Quick Log" are stubbed with console.log - there's no
// reference yet for what those screens should show.
const ReleaseUnitModal = ({ isOpen, onClose, onAddItem, addedIds = [] }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(26);
  const [evaluatedBy, setEvaluatedBy] = useState("");
  const [evaluators, setEvaluators] = useState([]);

  const handleLoad = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/jobnumbers`);
      const data = await res.json();
      const jobs = Array.isArray(data) ? data : [];
      setRows(jobs.filter((job) => job.forDeliveryTagged === true));
    } catch (err) {
      console.error("Failed to load releasable units:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // TODO: confirm the endpoint/shape for the "Evaluated By" options -
  // guessing it's the same users collection used elsewhere.
  const fetchEvaluators = async () => {
    try {
      const res = await fetch(`${API}/api/users`);
      const data = await res.json();
      setEvaluators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch evaluators:", err);
    }
  };

  const handleLog = () => console.log("Open Log");
  const handleQuickLog = () => console.log("Open Quick Log");

  const handleRowClick = (row) => {
    const rowId = row.jobReceiptID || row._id;
    if (addedIds.includes(rowId)) return;
    onAddItem({
      id: rowId,
      value: [row.jobReceiptID, row.instrumentName || row.type, row.serialNo]
        .filter(Boolean)
        .join(" — "),
      evaluatedBy,
    });
  };

  useEffect(() => {
    fetchEvaluators();
  }, []);

  if (!isOpen) return null;

  const visibleRows = rows.slice(0, pageSize);

  return ReactDOM.createPortal(
    <div className="dr-modal-overlay">
      <div className="dr-modal dr-modal--large">
        <CdmsModalHeader title="RELEASE UNIT" onClose={onClose} />

        <div className="dr-modal-body">
          <div className="dr-release-toolbar">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button className="dr-btn" onClick={handleLoad}>
              Load
            </button>
            <button className="dr-btn dr-btn--bold" onClick={handleLog}>
              Log
            </button>
            <button className="dr-btn" onClick={handleQuickLog}>
              Quick Log
            </button>

            <div className="dr-release-toolbar-spacer" />

            <label className="dr-release-evaluated-by">
              Evaluated By :
              <select
                value={evaluatedBy}
                onChange={(e) => setEvaluatedBy(e.target.value)}
              >
                <option value=""></option>
                {evaluators.map((u) => (
                  <option key={u._id} value={u.fullName || u.name}>
                    {u.fullName || u.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="dr-release-list-wrapper">
            {loading ? (
              <p className="dr-release-loading">Loading...</p>
            ) : (
              <table className="dr-table dr-release-table">
                <tbody>
                  {visibleRows.length > 0
                    ? visibleRows.map((row) => {
                        const rowId = row.jobReceiptID || row._id;
                        const added = addedIds.includes(rowId);
                        return (
                          <tr
                            key={rowId}
                            className={`dr-release-row${added ? " dr-release-row--added" : ""}`}
                            onClick={() => handleRowClick(row)}
                          >
                            <td>
                              {[
                                row.jobReceiptID,
                                row.instrumentName || row.type,
                                row.serialNo,
                              ]
                                .filter(Boolean)
                                .join(" — ")}
                              {added ? " (added)" : ""}
                            </td>
                          </tr>
                        );
                      })
                    : // Blank ruled rows so the list looks like the
                      // reference screenshot before anything is loaded.
                      Array.from({ length: 20 }).map((_, i) => (
                        <tr
                          key={i}
                          className="dr-release-row dr-release-row--blank"
                        >
                          <td>&nbsp;</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReleaseUnitModal;
