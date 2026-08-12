import React, { useState, useEffect, useMemo } from "react";
import "./instrumenttag.css";
import TaggingModal from "./TaggingModal";

const API = import.meta.env.VITE_API_URL;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (currentYear - i).toString(),
);

const searchKeyMap = {
  "Company Name": "companyName",
  "Job Number": "jobNumber",
  Brand: "brand",
};

const InstrumentTag = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [jobsRes, receiptsRes] = await Promise.all([
        fetch(`${API}/api/jobnumbers`),
        fetch(`${API}/api/jobreceipts`),
      ]);
      const jobs = await jobsRes.json();
      const receipts = await receiptsRes.json();

      const receiptsMap = {};
      if (Array.isArray(receipts)) {
        receipts.forEach((r) => {
          receiptsMap[r.jrId] = r;
        });
      }

      const merged = Array.isArray(jobs)
        ? jobs.map((job) => {
            const receipt = receiptsMap[job.jobReceiptID] || {};

            // Equipment photos are uploaded to Cloudinary from
            // JobNumberModal's "Open Camera" flow and accumulate on
            // job.photoUrls (array). job.photoUrl is the legacy singular
            // field kept in sync with the first photo ever taken, for any
            // older job records saved before photoUrls existed — used
            // here only as a fallback when photoUrls is empty/missing.
            const images = job.photoUrls?.length
              ? [...new Set(job.photoUrls.filter(Boolean))]
              : job.photoUrl
                ? [job.photoUrl]
                : [];

            return {
              _id: job._id,
              jobNumber: job.jobNumber,
              jobReceiptID: job.jobReceiptID,
              dateRec: receipt.date || "",
              priority: job.priority || "",
              company: receipt.companyName || "",
              description: job.description || "",
              brand: job.brand || "",
              model: job.model || "",
              serialNo: job.serialNo || "",
              eta: job.eta || "",
              remarks: job.remarks || "",
              concern: job.concern || "",
              range: job.range || "",
              uncertainty: job.uncertainty || "",
              frequency: job.frequency || "",
              voltage: job.voltage || "",
              evalBy: job.evalBy || "",
              type: job.type || "mechanical",
              tagged: job.tagged || false,
              concernTagged: job.concernTagged || false,
              images,
            };
          })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const yr = selectedYear.slice(-2);

    return records
      .filter((r) => {
        // HIDE tagged records
        if (r.tagged) return false;

        const parts = r.jobNumber?.split("/");
        const jobYear = parts?.[2];
        if (jobYear !== yr) return false;

        if (activeSearch.trim()) {
          const key = searchKeyMap[searchBy];
          return r[key]
            ?.toString()
            .toLowerCase()
            .includes(activeSearch.toLowerCase());
        }

        return true;
      })
      .slice(0, rowsPerPage);
  }, [records, selectedYear, activeSearch, searchBy, rowsPerPage]);

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  // concernSource is stamped here so downstream screens (ConcernIncoming,
  // JobDetailsModal) can tell this concern was flagged straight from
  // Instrument Tagging — the job never passed through Incoming
  // Calibration Details, so it has no real OIC/SIG yet. Only set when
  // concernPicTaken is actually true; otherwise null, since this job
  // isn't a concern at all. See IncomingCalibDetailsModal.jsx for the
  // other source ("calibration").
  const handleTagged = async (record, { concernPicTaken }) => {
    try {
      const res = await fetch(`${API}/api/jobnumbers/tag`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNumber: record.jobNumber,
          tagged: true,
          concernTagged: concernPicTaken,
          concernSource: concernPicTaken ? "instrumentTag" : null,
          taggedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.jobNumber === record.jobNumber
              ? { ...r, tagged: true, concernTagged: concernPicTaken }
              : r,
          ),
        );
        setShowModal(false);
      } else {
        console.error("Tag update failed:", data.message);
      }
    } catch (err) {
      console.error("Failed to mark as tagged:", err);
    }
  };

  const handleSearch = () => setActiveSearch(searchInput);
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    setSelectedYear(currentYear.toString());
    setRowsPerPage(25);
    fetchRecords();
  };

  return (
    <div className="instrument-container">
      <div className="instrument-header">
        <h2>INSTRUMENT TAG / PIC</h2>
      </div>

      <div className="instrument-tabs">
        <button className="active">Instrument List</button>
      </div>

      <div className="search-bar">
        <select
          value={searchBy}
          onChange={(e) => {
            setSearchBy(e.target.value);
            setSearchInput("");
            setActiveSearch("");
          }}
        >
          {Object.keys(searchKeyMap).map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={`Search by ${searchBy}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />

        <button onClick={handleSearch}>Search</button>

        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setActiveSearch("");
            setSearchInput("");
          }}
        >
          {yearOptions.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

        <button>Log Printed</button>
        <button>Re-Print</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="search-results-info">
        <span>
          Showing <strong>{filteredRecords.length}</strong> of{" "}
          <strong>{records.filter((r) => !r.tagged).length}</strong> untagged
          records for <strong>{selectedYear}</strong>
        </span>
        {activeSearch && (
          <span>
            {" "}
            — searching <strong>{searchBy}</strong>: "
            <strong>{activeSearch}</strong>"
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchInput("");
                setActiveSearch("");
              }}
            >
              ✕ Clear
            </button>
          </span>
        )}
      </div>

      <div className="table-wrapper">
        <table className="instrument-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Date Rec</th>
              <th>Priority</th>
              <th>Company</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No</th>
              <th>ETA</th>
              <th>Remarks</th>
              <th>Concern</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr
                  key={index}
                  className="clickable-row"
                  onClick={() => handleRowClick(record)}
                >
                  <td>{record.jobNumber}</td>
                  <td>{record.dateRec}</td>
                  <td>{record.priority}</td>
                  <td>{record.company}</td>
                  <td>{record.description}</td>
                  <td>{record.brand}</td>
                  <td>{record.model}</td>
                  <td>{record.serialNo}</td>
                  <td>{record.eta}</td>
                  <td>{record.remarks}</td>
                  <td>{record.concern}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : `No untagged records found for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedRecord && (
        <TaggingModal
          record={selectedRecord}
          onClose={() => setShowModal(false)}
          onTagged={handleTagged}
        />
      )}
    </div>
  );
};

export default InstrumentTag;
