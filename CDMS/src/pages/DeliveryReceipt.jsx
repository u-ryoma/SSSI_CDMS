import React, { useState, useEffect, useMemo } from "react";
import "./OnGoingCalibration/Ongoinglistcalib.css";

const API = import.meta.env.VITE_API_URL;

const searchKeyMap = {
  CompanyName: "companyName",
  ContactName: "contactName",
  "JR ID": "jobReceiptID",
  "Ref No.": "refNo",
};

const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

const DeliveryReceiptList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("CompanyName");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [pageSize, setPageSize] = useState(26);

  useEffect(() => {
    fetchRecords();
  }, []);

  // NOTE ON DATA SOURCE: it isn't settled yet whether this list should
  // pull from jobnumbers (jobs tagged forDeliveryTagged, same pattern
  // as the other stage pages) or from a dedicated deliveryReceipts
  // collection once that exists. For now this defaults to the former
  // so the page renders real data immediately - swap the body of this
  // function for a fetch to `${API}/api/deliveryreceipts` (or whatever
  // the collection ends up being called) once that's decided.
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
        ? jobs
            .filter((job) => job.forDeliveryTagged === true)
            .map((job) => {
              const receipt = receiptsMap[job.jobReceiptID] || {};
              return {
                jobReceiptID: job.jobReceiptID,
                type: job.type || receipt.type || "",
                date: receipt.date || "",
                companyName: receipt.companyName || "",
                companyAddress: receipt.companyAddress || "",
                contactInfo: receipt.contactInfo || receipt.contactNumber || "",
                contactName: receipt.contactName || "",
                refNo: job.refNo || receipt.refNo || "",
                preparedBy: job.preparedBy || job.evalBy || "",
              };
            })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch delivery receipt list:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!activeSearch.trim()) return records;
    const key = searchKeyMap[searchBy];
    return records.filter((r) =>
      r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
    );
  }, [records, activeSearch, searchBy]);

  const visibleRecords = useMemo(
    () => filteredRecords.slice(0, pageSize),
    [filteredRecords, pageSize],
  );

  const handleSearch = () => setActiveSearch(searchInput);
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("CompanyName");
    fetchRecords();
  };
  const handleAddNew = () => {
    // TODO: wire up Add New flow once the create form/modal exists
    console.log("Add New delivery receipt");
  };

  return (
    <div className="drl-container">
      <div className="drl-titlebar">
        <span className="drl-titlebar-icon">📋</span>
        <span>DELIVERY RECEIPT LIST</span>
      </div>

      <div className="drl-header">
        <div className="drl-logo">CDMS</div>
        <div className="drl-header-text">
          <div className="drl-header-line1">
            CALIBRATION DATABASE AND MONITORING SYSTEM
          </div>
          <div className="drl-header-line2">DELIVERY RECEIPT</div>
        </div>
      </div>

      <div className="drl-toolbar">
        <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
          {Object.keys(searchKeyMap).map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />

        <button onClick={handleSearch} className="drl-link-btn">
          Search
        </button>

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

        <button onClick={handleAddNew} className="drl-link-btn">
          Add New
        </button>

        <button onClick={handleRefresh} className="drl-link-btn">
          Refresh
        </button>
      </div>

      <div className="drl-table-wrapper">
        <table className="drl-table">
          <thead>
            <tr>
              <th>JR ID</th>
              <th>Type</th>
              <th>Date</th>
              <th>Company Name</th>
              <th>Company Address</th>
              <th>Contact Info</th>
              <th>Contact Name</th>
              <th>Ref No.</th>
              <th>Prepared By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="drl-no-data">
                  Loading...
                </td>
              </tr>
            ) : visibleRecords.length > 0 ? (
              visibleRecords.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.jobReceiptID}</td>
                  <td>{r.type}</td>
                  <td>{r.date}</td>
                  <td>{r.companyName}</td>
                  <td>{r.companyAddress}</td>
                  <td>{r.contactInfo}</td>
                  <td>{r.contactName}</td>
                  <td>{r.refNo}</td>
                  <td>{r.preparedBy}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="drl-no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No delivery receipts yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryReceiptList;
