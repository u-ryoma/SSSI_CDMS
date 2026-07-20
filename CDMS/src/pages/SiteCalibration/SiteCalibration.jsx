// import React, { useState, useEffect, useMemo } from "react";
// import "../OngoingCalibration/Ongoinglistcalib.css";

// const API = import.meta.env.VITE_API_URL;

// const searchKeyMap = {
//   "Company Name": "company",
//   "Contact Name": "contactName",
//   "JR ID": "jrId",
// };

// const SiteCalibration = () => {
//   const [jobNumbers, setJobNumbers] = useState([]);
//   const [receipts, setReceipts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const [jobsRes, receiptsRes] = await Promise.all([
//         fetch(`${API}/api/jobnumbers`),
//         fetch(`${API}/api/jobreceipts`),
//       ]);
//       const jobsData = await jobsRes.json();
//       const receiptsData = await receiptsRes.json();
//       setJobNumbers(Array.isArray(jobsData) ? jobsData : []);
//       setReceipts(Array.isArray(receiptsData) ? receiptsData : []);
//     } catch (err) {
//       console.error("Failed to fetch site calibration data:", err);
//       setJobNumbers([]);
//       setReceipts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = () => {
//     setSearchInput("");
//     setActiveSearch("");
//     setSearchBy("Company Name");
//     fetchAll();
//   };

//   const handleSearch = () => setActiveSearch(searchInput);

//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };

//   // Join each job number with its parent receipt (for company/contact/JR ID),
//   // then keep only jobs flagged as site calibration.
//   const calibrations = useMemo(() => {
//     const receiptsById = new Map(receipts.map((r) => [r.jrId, r]));

//     return jobNumbers
//       .filter((job) => job.tagged === false)
//       .map((job) => {
//         const receipt = receiptsById.get(job.jobReceiptID) || {};
//         return {
//           jobNumber: job.jobNumber,
//           jrId: receipt.jrId || job.jobReceiptID || "",
//           dateRec: receipt.date || "",
//           priority: job.priority || "",
//           oic: job.evalBy || "",
//           company: receipt.companyName || "",
//           contactName: receipt.contactName || "",
//           description: job.description || "",
//           brand: job.brand || "",
//           model: job.model || "",
//           serialNo: job.serialNo || "",
//           eta: job.eta || "",
//           remarks: job.remarks || "",
//         };
//       });
//   }, [jobNumbers, receipts]);

//   const filteredCalibrations = useMemo(() => {
//     if (!activeSearch.trim()) return calibrations;
//     const key = searchKeyMap[searchBy];
//     return calibrations.filter((c) =>
//       c[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
//     );
//   }, [calibrations, activeSearch, searchBy]);

//   return (
//     <div className="calibration-container">
//       <div className="calibration-header">
//         <h2>SITE CALIBRATION</h2>
//       </div>

//       <div className="calibration-tabs">
//         <button className="active">List of Jobs</button>
//       </div>

//       <div className="calibration-search">
//         <select
//           value={searchBy}
//           onChange={(e) => {
//             setSearchBy(e.target.value);
//             setSearchInput("");
//             setActiveSearch("");
//           }}
//         >
//           {Object.keys(searchKeyMap).map((label) => (
//             <option key={label} value={label}>
//               {label}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder={`Search by ${searchBy}...`}
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//           onKeyDown={handleSearchKeyDown}
//         />

//         <button onClick={handleSearch}>Search</button>

//         {/* TODO: wire these up once Re-Log / Quick Log flows are defined */}
//         <button onClick={() => console.log("Re-Log clicked")}>Re-Log</button>
//         <button onClick={() => console.log("Quick Log clicked")}>
//           Quick Log
//         </button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

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
//             {loading ? (
//               <tr>
//                 <td colSpan="11" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredCalibrations.length > 0 ? (
//               filteredCalibrations.map((c, idx) => (
//                 <tr key={c.jobNumber || idx}>
//                   <td>{c.jobNumber}</td>
//                   <td>{c.dateRec}</td>
//                   <td>{c.priority}</td>
//                   <td>{c.oic}</td>
//                   <td>{c.company}</td>
//                   <td>{c.description}</td>
//                   <td>{c.brand}</td>
//                   <td>{c.model}</td>
//                   <td>{c.serialNo}</td>
//                   <td>{c.eta}</td>
//                   <td>{c.remarks}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="11" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : "No site calibration jobs found"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default SiteCalibration;
import React, { useState, useEffect, useMemo } from "react";
import "../OngoingCalibration/Ongoinglistcalib.css";

const API = import.meta.env.VITE_API_URL;

const searchKeyMap = {
  "Company Name": "company",
  "Contact Name": "contactName",
  "JR ID": "jrId",
};

const SiteCalibration = () => {
  const [jobNumbers, setJobNumbers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [jobsRes, receiptsRes] = await Promise.all([
        fetch(`${API}/api/jobnumbers`),
        fetch(`${API}/api/jobreceipts`),
      ]);
      const jobsData = await jobsRes.json();
      const receiptsData = await receiptsRes.json();
      setJobNumbers(Array.isArray(jobsData) ? jobsData : []);
      setReceipts(Array.isArray(receiptsData) ? receiptsData : []);
    } catch (err) {
      console.error("Failed to fetch site calibration data:", err);
      setJobNumbers([]);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    fetchAll();
  };

  const handleSearch = () => setActiveSearch(searchInput);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Join each job number with its parent receipt (for company/contact/JR ID),
  // then keep only jobs flagged On-Site via the JobNumberModal checkbox.
  const calibrations = useMemo(() => {
    const receiptsById = new Map(receipts.map((r) => [r.jrId, r]));

    return jobNumbers
      .filter((job) => job.onSite === true)
      .map((job) => {
        const receipt = receiptsById.get(job.jobReceiptID) || {};
        return {
          jobNumber: job.jobNumber,
          jrId: receipt.jrId || job.jobReceiptID || "",
          dateRec: receipt.date || "",
          priority: job.priority || "",
          oic: job.evalBy || "",
          company: receipt.companyName || "",
          contactName: receipt.contactName || "",
          description: job.description || "",
          brand: job.brand || "",
          model: job.model || "",
          serialNo: job.serialNo || "",
          eta: job.eta || "",
          remarks: job.remarks || "",
        };
      });
  }, [jobNumbers, receipts]);

  const filteredCalibrations = useMemo(() => {
    if (!activeSearch.trim()) return calibrations;
    const key = searchKeyMap[searchBy];
    return calibrations.filter((c) =>
      c[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
    );
  }, [calibrations, activeSearch, searchBy]);

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>SITE CALIBRATION</h2>
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

        <button onClick={handleSearch}>Search</button>

        {/* TODO: wire these up once Re-Log / Quick Log flows are defined */}
        <button onClick={() => console.log("Re-Log clicked")}>Re-Log</button>
        <button onClick={() => console.log("Quick Log clicked")}>
          Quick Log
        </button>
        <button onClick={handleRefresh}>Refresh</button>
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
            ) : filteredCalibrations.length > 0 ? (
              filteredCalibrations.map((c, idx) => (
                <tr key={c.jobNumber || idx}>
                  <td>{c.jobNumber}</td>
                  <td>{c.dateRec}</td>
                  <td>{c.priority}</td>
                  <td>{c.oic}</td>
                  <td>{c.company}</td>
                  <td>{c.description}</td>
                  <td>{c.brand}</td>
                  <td>{c.model}</td>
                  <td>{c.serialNo}</td>
                  <td>{c.eta}</td>
                  <td>{c.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No site calibration jobs found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SiteCalibration;
