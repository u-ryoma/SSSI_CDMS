// import React, { useState } from "react";
// import "./Ongoinglistcalib.css";

// const IncomingCalib = () => {
//   const [company, setCompany] = useState("");
//   const [search, setSearch] = useState("");

//   const companies = ["Company Name", "Contact Name", "JR ID"];

//   const calibrations = [
//     // {
//     //   jobNumber: "JOB-001",
//     //   dateRec: "2026-05-08",
//     //   priority: "High",
//     //   oic: "Engr. Santos",
//     //   company: "ABC Company",
//     //   description: "Calibration",
//     //   brand: "Fluke",
//     //   model: "F101",
//     //   serialNo: "SN001",
//     //   eta: "2026-05-15",
//     //   remarks: "Waiting",
//     // },
//   ];

//   const filteredCalibrations = calibrations.filter(
//     (c) =>
//       (!company || c.company === company) &&
//       (!search || c.description.toLowerCase().includes(search.toLowerCase())),
//   );

//   return (
//     <div className="calibration-container">
//       {/* Header */}
//       <div className="calibration-header">
//         {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM (CDMS)</h1> */}
//         <h2>INCOMING CALIBRATION</h2>
//       </div>

//       {/* Tabs */}
//       <div className="calibration-tabs">
//         <button className="active">List of Jobs</button>
//         {/* <button>Add Job</button> */}
//       </div>

//       {/* Search bar */}
//       <div className="calibration-search">
//         {/* <label>Company Name:</label> */}
//         <select value={company} onChange={(e) => setCompany(e.target.value)}>
//           {/* <option value="">Company Name</option> */}
//           {companies.map((comp, idx) => (
//             <option key={idx} value={comp}>
//               {comp}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <button>Re-Log</button>
//         <button>Quick Log</button>
//         <button>Refresh</button>
//       </div>

//       {/* Table */}
//       <div className="calibration-table-wrapper">
//         <table className="calibration-table">
//           <thead>
//             <tr>
//               <th>Job Number</th>
//               <th>Date Rec</th>
//               <th>Priority</th>
//               <th>OIC</th>
//               <th>Company</th>
//               <th>Description</th>
//               <th>Brand</th>
//               <th>Model</th>
//               <th>Serial No</th>
//               <th>ETA</th>
//               <th>Remarks</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredCalibrations.map((c, idx) => (
//               <tr key={idx}>
//                 <td>{c.jobNumber}</td>
//                 <td>{c.dateRec}</td>
//                 <td>{c.priority}</td>
//                 <td>{c.oic}</td>
//                 <td>{c.company}</td>
//                 <td>{c.description}</td>
//                 <td>{c.brand}</td>
//                 <td>{c.model}</td>
//                 <td>{c.serialNo}</td>
//                 <td>{c.eta}</td>
//                 <td>{c.remarks}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default IncomingCalib;
import React, { useState, useEffect, useMemo } from "react";
import "./Ongoinglistcalib.css";

const API = import.meta.env.VITE_API_URL;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (currentYear - i).toString(),
);

const searchKeyMap = {
  "Company Name": "companyName",
  "Contact Name": "contactName",
  "JR ID": "jobReceiptID",
};

const IncomingCalib = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
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

      // only tagged jobs where concernTagged is false
      const merged = Array.isArray(jobs)
        ? jobs
            .filter((job) => job.tagged === true && !job.concernTagged)
            .map((job) => {
              const receipt = receiptsMap[job.jobReceiptID] || {};
              return {
                jobNumber: job.jobNumber,
                jobReceiptID: job.jobReceiptID,
                dateRec: receipt.date || "",
                priority: job.priority || "",
                companyName: receipt.companyName || "",
                contactName: receipt.contactName || "",
                description: job.description || "",
                brand: job.brand || "",
                model: job.model || "",
                serialNo: job.serialNo || "",
                eta: job.eta || "",
                remarks: job.remarks || "",
                taggedAt: job.taggedAt || "",
              };
            })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch incoming calibration:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const yr = selectedYear.slice(-2);

    return records
      .filter((r) => {
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

  const handleSearch = () => setActiveSearch(searchInput);
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    setSelectedYear(currentYear.toString());
    fetchRecords();
  };

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>INCOMING CALIBRATION</h2>
      </div>

      <div className="calibration-tabs">
        <button className="active">List of Jobs</button>
      </div>

      <div className="calibration-search">
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

        <button>Re-Log</button>
        <button>Quick Log</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="search-results-info">
        <span>
          Showing <strong>{filteredRecords.length}</strong> of{" "}
          <strong>{records.length}</strong> records for{" "}
          <strong>{selectedYear}</strong>
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

      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Date Rec</th>
              <th>Priority</th>
              <th>OIC</th>
              <th>Company</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No</th>
              <th>ETA</th>
              <th>Remarks</th>
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
              filteredRecords.map((r, idx) => (
                <tr key={idx} className="clickable-row">
                  <td>{r.jobNumber}</td>
                  <td>{r.dateRec}</td>
                  <td>{r.priority}</td>
                  <td>{r.contactName}</td>
                  <td>{r.companyName}</td>
                  <td>{r.description}</td>
                  <td>{r.brand}</td>
                  <td>{r.model}</td>
                  <td>{r.serialNo}</td>
                  <td>{r.eta}</td>
                  <td>{r.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : `No incoming calibration records for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomingCalib;
