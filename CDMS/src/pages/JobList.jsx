// // export default function JobList() {
// //   return (
// //     <div>
// //       <h1>Job Number List</h1>
// //       <p>Job list page coming soon.</p>
// //     </div>
// //   );
// // }
// // jobnumber.jsx

// import React, { useState } from "react";
// import "./jobnumber.css";

// const JobNumber = () => {
//   const [activeTab, setActiveTab] = useState("list");

//   const [jobs, setJobs] = useState([
//     {
//       jobNumber: "JOB-001",
//       dateRec: "2026-05-08",
//       mor: "MOR-1001",
//       companyName: "ABC Company",
//       jobStatus: "Pending",
//       description: "Calibration",
//       brand: "Fluke",
//       model: "F101",
//       serialNo: "SN001",
//       eta: "2026-05-15",
//       remarks: "Waiting",
//     },
//   ]);

//   const [formData, setFormData] = useState({
//     jobNumber: "",
//     dateRec: "",
//     mor: "",
//     companyName: "",
//     jobStatus: "",
//     description: "",
//     brand: "",
//     model: "",
//     serialNo: "",
//     eta: "",
//     remarks: "",
//   });

//   // HANDLE INPUT
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // SAVE JOB
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     setJobs([...jobs, formData]);

//     setFormData({
//       jobNumber: "",
//       dateRec: "",
//       mor: "",
//       companyName: "",
//       jobStatus: "",
//       description: "",
//       brand: "",
//       model: "",
//       serialNo: "",
//       eta: "",
//       remarks: "",
//     });

//     alert("Job Added Successfully!");
//   };

//   return (
//     <div className="job-container">
//       {/* HEADER */}
//       <div className="job-header">
//         <div>
//           {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM</h1> */}
//           <h2>LIST OF JOB NUMBERS</h2>
//         </div>
//       </div>

//       {/* TABS */}
//       <div className="job-tabs">
//         <button
//           className={activeTab === "list" ? "active" : ""}
//           onClick={() => setActiveTab("list")}
//         >
//           List of Jobs
//         </button>

//         <button
//           className={activeTab === "add" ? "active" : ""}
//           onClick={() => setActiveTab("add")}
//         >
//           Add Job
//         </button>
//       </div>

//       {/* SEARCH BAR */}
//       <div className="search-bar">
//         <select>
//           <option>Company Name</option>
//           <option>Job Number</option>
//           <option>Brand</option>
//         </select>

//         <input type="text" placeholder="Search..." />

//         <button>Search</button>

//         <select>
//           <option>25</option>
//           <option>50</option>
//           <option>100</option>
//         </select>

//         <button>Quick Log</button>
//       </div>

//       {/* LIST TAB */}
//       {activeTab === "list" && (
//         <div className="table-wrapper">
//           <table className="job-table">
//             <thead>
//               <tr>
//                 <th>Job Number</th>
//                 <th>Date Rec</th>
//                 <th>MOR</th>
//                 <th>Company Name</th>
//                 <th>Job Status</th>
//                 <th>Description</th>
//                 <th>Brand</th>
//                 <th>Model</th>
//                 <th>Serial No</th>
//                 <th>ETA</th>
//                 <th>Remarks</th>
//               </tr>
//             </thead>

//             <tbody>
//               {jobs.map((job, index) => (
//                 <tr key={index}>
//                   <td>{job.jobNumber}</td>
//                   <td>{job.dateRec}</td>
//                   <td>{job.mor}</td>
//                   <td>{job.companyName}</td>
//                   <td>{job.jobStatus}</td>
//                   <td>{job.description}</td>
//                   <td>{job.brand}</td>
//                   <td>{job.model}</td>
//                   <td>{job.serialNo}</td>
//                   <td>{job.eta}</td>
//                   <td>{job.remarks}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ADD JOB TAB */}
//       {activeTab === "add" && (
//         <div className="job-card">
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label>Job Number</label>
//               <input
//                 type="text"
//                 name="jobNumber"
//                 value={formData.jobNumber}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Date Received</label>
//               <input
//                 type="date"
//                 name="dateRec"
//                 value={formData.dateRec}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>MOR</label>
//               <input
//                 type="text"
//                 name="mor"
//                 value={formData.mor}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Company Name</label>
//               <input
//                 type="text"
//                 name="companyName"
//                 value={formData.companyName}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Job Status</label>
//               <input
//                 type="text"
//                 name="jobStatus"
//                 value={formData.jobStatus}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Description</label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Brand</label>
//               <input
//                 type="text"
//                 name="brand"
//                 value={formData.brand}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Model</label>
//               <input
//                 type="text"
//                 name="model"
//                 value={formData.model}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Serial No</label>
//               <input
//                 type="text"
//                 name="serialNo"
//                 value={formData.serialNo}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>ETA</label>
//               <input
//                 type="date"
//                 name="eta"
//                 value={formData.eta}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Remarks</label>
//               <textarea
//                 name="remarks"
//                 value={formData.remarks}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="button-wrapper">
//               <button type="submit" className="save-btn">
//                 Save Job
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobNumber;
import React, { useState, useEffect, useMemo } from "react";
import "./jobnumber.css";

const API = import.meta.env.VITE_API_URL;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (currentYear - i).toString(),
);

const searchKeyMap = {
  "Company Name": "companyName",
  "Job Number": "jobNumber",
  Brand: "brand",
  Model: "model",
  "Serial No.": "serialNo",
};

const JobNumber = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // SEARCH & FILTER STATE
  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // FETCH JOBS FROM DATABASE
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/jobnumbers`);
      if (!res.ok) throw new Error("Failed to fetch job numbers");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch job numbers:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // FILTERED JOBS
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (activeSearch.trim()) {
      const key = searchKeyMap[searchBy];
      result = result.filter((job) =>
        job[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
      );
    }

    return result.slice(0, rowsPerPage);
  }, [jobs, searchBy, activeSearch, rowsPerPage]);

  const handleSearch = () => setActiveSearch(searchInput);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    setRowsPerPage(25);
    fetchJobs();
  };

  return (
    <div className="job-container">
      {/* HEADER */}
      <div className="job-header">
        <h2>LIST OF JOB NUMBERS</h2>
      </div>

      {/* TABS */}
      <div className="job-tabs">
        <button className="active">List of Jobs</button>
      </div>

      {/* SEARCH BAR */}
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
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

        <button onClick={handleRefresh}>Refresh</button>
      </div>

      {/* RESULTS INFO */}
      <div className="search-results-info">
        <span>
          Showing <strong>{filteredJobs.length}</strong> of{" "}
          <strong>{jobs.length}</strong> job numbers
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

      {/* JOB LIST TABLE */}
      <div className="table-wrapper">
        <table className="job-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Job Receipt ID</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No.</th>
              <th>Range</th>
              <th>Uncertainty</th>
              <th>Frequency</th>
              <th>ETA</th>
              <th>Eval By</th>
              <th>Priority</th>
              <th>Voltage</th>
              <th>Remarks</th>
              <th>Concern</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="15" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <tr key={job._id || index} className="clickable-row">
                  <td>{job.jobNumber}</td>
                  <td>{job.jobReceiptID}</td>
                  <td>{job.description}</td>
                  <td>{job.brand}</td>
                  <td>{job.model}</td>
                  <td>{job.serialNo}</td>
                  <td>{job.range}</td>
                  <td>{job.uncertainty}</td>
                  <td>{job.frequency}</td>
                  <td>{job.eta}</td>
                  <td>{job.evalBy}</td>
                  <td>{job.priority}</td>
                  <td>{job.voltage}</td>
                  <td>{job.remarks}</td>
                  <td>{job.concern}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No Job Numbers Found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobNumber;
