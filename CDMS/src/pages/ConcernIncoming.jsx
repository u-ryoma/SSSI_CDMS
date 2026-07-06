// // export default function ConcernIncoming() {
// //   return (
// //     <div>
// //       <h1>Concern Incoming</h1>
// //       <p>Concern Incoming coming soon.</p>
// //     </div>
// //   );
// // }
// import React, { useState } from "react";
// import "./concernout.css";

// const ConcernIncoming = () => {
//   const [company, setCompany] = useState("");
//   const [search, setSearch] = useState("");

//   const companies = ["Company Name", "Contact Name", "JR ID"];

//   const jobs = [
//     // {
//     //   jobNumber: "JOB-002",
//     //   dateRec: "2026-05-09",
//     //   priority: "Medium",
//     //   oic: "Engr. Reyes",
//     //   company: "XYZ Corp",
//     //   description: "Incoming Concern",
//     //   brand: "Keysight",
//     //   model: "K200",
//     //   serialNo: "SN002",
//     //   eta: "2026-05-20",
//     //   remarks: "Pending shipment",
//     // },
//   ];

//   const filteredJobs = jobs.filter(
//     (j) =>
//       (!company || j.company === company) &&
//       (!search || j.description.toLowerCase().includes(search.toLowerCase())),
//   );

//   return (
//     <div className="outgoing-container">
//       {/* Header */}
//       <div className="outgoing-header">
//         {/* <h1>CDMS CALIBRATION DATABASE AND MONITORING SYSTEM</h1> */}
//         <h2>INCOMING CONCERN</h2>
//       </div>

//       {/* Tabs */}
//       <div className="outgoing-tabs">
//         <button className="active">List of Concerns</button>
//         {/* <button>Add Concern</button> */}
//       </div>

//       {/* Search bar */}
//       <div className="outgoing-search">
//         {/* <label>Company Name:</label> */}
//         <select value={company} onChange={(e) => setCompany(e.target.value)}>
//           {/* <option value="">-- Select Company --</option> */}
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

//         <button>Search</button>
//         <select>
//           <option>25</option>
//           <option>50</option>
//           <option>100</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="outgoing-table-wrapper">
//         <table className="outgoing-table">
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
//             {filteredJobs.map((j, idx) => (
//               <tr key={idx}>
//                 <td>{j.jobNumber}</td>
//                 <td>{j.dateRec}</td>
//                 <td>{j.priority}</td>
//                 <td>{j.oic}</td>
//                 <td>{j.company}</td>
//                 <td>{j.description}</td>
//                 <td>{j.brand}</td>
//                 <td>{j.model}</td>
//                 <td>{j.serialNo}</td>
//                 <td>{j.eta}</td>
//                 <td>{j.remarks}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ConcernIncoming;
import React, { useState, useEffect, useMemo } from "react";
import "./concernout.css";

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

const ConcernIncoming = () => {
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

      // only tagged jobs where concernTagged is true
      const merged = Array.isArray(jobs)
        ? jobs
            .filter((job) => job.tagged === true && job.concernTagged === true)
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
                concern: job.concern || "",
                taggedAt: job.taggedAt || "",
              };
            })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch incoming concern:", err);
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
    <div className="outgoing-container">
      <div className="outgoing-header">
        <h2>INCOMING CONCERN</h2>
      </div>

      <div className="outgoing-tabs">
        <button className="active">List of Concerns</button>
      </div>

      <div className="outgoing-search">
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

        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="search-results-info">
        <span>
          Showing <strong>{filteredRecords.length}</strong> of{" "}
          <strong>{records.length}</strong> concern records for{" "}
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

      <div className="outgoing-table-wrapper">
        <table className="outgoing-table">
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
              <th>Concern</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="no-data">
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
                  <td>{r.concern}</td>
                  <td>{r.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : `No incoming concern records for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConcernIncoming;
