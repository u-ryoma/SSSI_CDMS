import React, { useState } from "react";
import { createPortal } from "react-dom";

const RecallJobModal = ({ onClose, onUseDetails, savedJobNumbers }) => {
  const currentYr = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) =>
    (currentYr - i).toString().slice(-2),
  );

  const [prefix, setPrefix] = useState("SSS");
  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
  const [jobNumberInput, setJobNumberInput] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = savedJobNumbers.filter((job) => {
    const parts = job.jobNumber?.split("/");
    if (!parts || parts.length < 3) return false;
    return parts[0] === prefix && parts[2] === selectedYear;
  });

  const handleRowClick = (job) => {
    setSelectedJob(job);
    setJobNumberInput(job.jobNumber);
  };

  const handleUseDetails = () => {
    if (!selectedJob) return;
    onUseDetails(selectedJob);
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <div
        className="recall-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED HEADER */}
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">RECALL JOB NUMBER</span>
              <span className="jr-modal-title-sub">
                SCIENTIFIC STANDARDS SERVICES
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="recall-content">
          <div className="recall-filter-row">
            <select
              className="recall-select"
              value={prefix}
              onChange={(e) => {
                setPrefix(e.target.value);
                setSelectedJob(null);
                setJobNumberInput("");
              }}
            >
              <option value="SSS">SSS</option>
              <option value="SSE">SSE</option>
            </select>

            <input
              type="text"
              className="recall-input"
              placeholder="Job number..."
              value={jobNumberInput}
              onChange={(e) => setJobNumberInput(e.target.value)}
            />

            <select
              className="recall-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedJob(null);
                setJobNumberInput("");
              }}
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            <button className="recall-search-btn" title="Search">
              🔍
            </button>
          </div>

          <div className="recall-table-wrapper">
            <table className="recall-table">
              <thead>
                <tr>
                  <th>Job Number</th>
                  <th>Description</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Serial No.</th>
                  <th>Range</th>
                  <th>Uncertainty</th>
                  <th>Remarks</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((job, index) => (
                    <tr
                      key={index}
                      className={`recall-row ${selectedJob?.jobNumber === job.jobNumber ? "recall-row-selected" : ""}`}
                      onClick={() => handleRowClick(job)}
                    >
                      <td>{job.jobNumber}</td>
                      <td>{job.description}</td>
                      <td>{job.brand}</td>
                      <td>{job.model}</td>
                      <td>{job.serialNo}</td>
                      <td>{job.range}</td>
                      <td>{job.uncertainty}</td>
                      <td>{job.remarks}</td>
                      <td>{job.priority}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="jr-no-data">
                      No job numbers found for {prefix}/{selectedYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedJob && (
            <div className="recall-preview">
              <div className="recall-preview-title">
                Selected: {selectedJob.jobNumber}
              </div>
              <div className="recall-preview-grid">
                <div>
                  <span>Description:</span> {selectedJob.description}
                </div>
                <div>
                  <span>Brand:</span> {selectedJob.brand}
                </div>
                <div>
                  <span>Model:</span> {selectedJob.model}
                </div>
                <div>
                  <span>Serial No.:</span> {selectedJob.serialNo}
                </div>
                <div>
                  <span>Range:</span> {selectedJob.range}
                </div>
                <div>
                  <span>Uncertainty:</span> {selectedJob.uncertainty}
                </div>
                <div>
                  <span>Frequency:</span> {selectedJob.frequency}
                </div>
                <div>
                  <span>Priority:</span> {selectedJob.priority}
                </div>
              </div>
            </div>
          )}

          <div className="recall-footer">
            <button
              className={`jr-save-btn ${!selectedJob ? "recall-btn-disabled" : ""}`}
              onClick={handleUseDetails}
              disabled={!selectedJob}
            >
              Use Details
            </button>
            <button className="jr-action-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RecallJobModal;
