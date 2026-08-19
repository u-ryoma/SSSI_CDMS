// import React, { useState, useEffect, useMemo } from "react";
// import "./Ongoinglistcalib.css";
// import IncomingCalibDetailsModal from "../IncomingCalibration/IncomingCalibDetailsModal";

// const API = import.meta.env.VITE_API_URL;

// const currentYear = new Date().getFullYear();
// const yearOptions = Array.from({ length: 5 }, (_, i) =>
//   (currentYear - i).toString(),
// );

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Contact Name": "contactName",
//   "JR ID": "jobReceiptID",
// };

// const OnGoingCalib = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");
//   const [selectedYear, setSelectedYear] = useState(currentYear.toString());
//   const [rowsPerPage, setRowsPerPage] = useState(25);

//   useEffect(() => {
//     fetchRecords();
//   }, []);

//   const fetchRecords = async () => {
//     setLoading(true);
//     try {
//       const [jobsRes, receiptsRes] = await Promise.all([
//         fetch(`${API}/api/jobnumbers`),
//         fetch(`${API}/api/jobreceipts`),
//       ]);
//       const jobs = await jobsRes.json();
//       const receipts = await receiptsRes.json();

//       const receiptsMap = {};
//       if (Array.isArray(receipts)) {
//         receipts.forEach((r) => {
//           receiptsMap[r.jrId] = r;
//         });
//       }

//       const merged = Array.isArray(jobs)
//         ? jobs
//             // Only jobs that have been moved on from Incoming Calibration,
//             // haven't already moved on to For Typing, and haven't been
//             // closed out via "Log RWOC" in Outgoing Concern (a concern
//             // raised while a job was already ongoingTagged would otherwise
//             // fall right back into this list once RWOC clears the concern
//             // flags).
//             .filter(
//               (job) =>
//                 job.ongoingTagged === true &&
//                 !job.forTypingTagged &&
//                 !job.rwocTagged,
//             )
//             .map((job) => {
//               const receipt = receiptsMap[job.jobReceiptID] || {};
//               return {
//                 jobNumber: job.jobNumber,
//                 jobReceiptID: job.jobReceiptID,
//                 type: job.type || "mechanical",
//                 description: job.description || "",
//                 brand: job.brand || "",
//                 model: job.model || "",
//                 serialNo: job.serialNo || "",
//                 remarks: job.remarks || "",
//                 concern: job.concern || "",
//                 range: job.range || "",
//                 uncertainty: job.uncertainty || "",
//                 contactCert: job.contactCert || "",
//                 frequency: job.frequency || "1 Year",
//                 eta: job.eta || "",
//                 oicBy: job.oicBy || "",
//                 priority: job.priority || "Normal",
//                 voltage: job.voltage || "-",
//                 ongoingTagged: job.ongoingTagged || false,
//                 forTypingTagged: job.forTypingTagged || false,
//                 // fields carried over from the Incoming Calibration step
//                 sig: job.sig || "",
//                 dateCal: job.dateCal || "",
//                 dateDue: job.dateDue || "",
//                 accreditationLogo: job.accreditationLogo || "with",
//                 calibrationProcedure: job.calibrationProcedure || "",
//                 // Full template record (publicId, code, format, version,
//                 // etc.) selected/re-uploaded back in Incoming Calibration.
//                 // Without carrying this over, the Download button in this
//                 // stage's modal has no publicId to build a filled-template
//                 // download from, even though calibrationProcedure (the
//                 // display text) looks populated.
//                 calibrationProcedureTemplate:
//                   job.calibrationProcedureTemplate || null,
//                 calibrationStandards: job.calibrationStandards || [],
//                 photoUrl: job.photoUrl || "",
//                 dateRec: receipt.date || "",
//                 companyName: receipt.companyName || "",
//                 // Lives on the job receipt record, not the job number
//                 // record — needed so the filled-template download can
//                 // stamp the CDMS sheet's COMPANY ADDRESS cell with it.
//                 companyAddress: receipt.companyAddress || "",
//                 contactName: receipt.contactName || "",
//               };
//             })
//         : [];

//       setRecords(merged);
//     } catch (err) {
//       console.error("Failed to fetch on-going calibration:", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRecords = useMemo(() => {
//     const yr = selectedYear.slice(-2);
//     return records
//       .filter((r) => {
//         const parts = r.jobNumber?.split("/");
//         const jobYear = parts?.[2];
//         if (jobYear !== yr) return false;
//         if (activeSearch.trim()) {
//           const key = searchKeyMap[searchBy];
//           return r[key]
//             ?.toString()
//             .toLowerCase()
//             .includes(activeSearch.toLowerCase());
//         }
//         return true;
//       })
//       .slice(0, rowsPerPage);
//   }, [records, selectedYear, activeSearch, searchBy, rowsPerPage]);

//   const handleRowClick = (record) => {
//     setSelectedRecord(record);
//     setShowModal(true);
//   };

//   // Clicking Update moves the job on to "For Typing": tag it on the
//   // backend, then drop it out of this table immediately (rather than
//   // just merging the edited fields back in, like the other stages do).
//   const handleUpdate = async (updatedFields) => {
//     try {
//       const res = await fetch(`${API}/api/jobnumbers/update-details`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           jobNumber: selectedRecord.jobNumber,
//           ...updatedFields,
//           forTypingTagged: true,
//         }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setRecords((prev) =>
//           prev.filter((r) => r.jobNumber !== selectedRecord.jobNumber),
//         );
//         setShowModal(false);
//       }
//     } catch (err) {
//       console.error("Update failed:", err);
//     }
//   };

//   const handleSearch = () => setActiveSearch(searchInput);
//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };
//   const handleRefresh = () => {
//     setSearchInput("");
//     setActiveSearch("");
//     setSearchBy("Company Name");
//     setSelectedYear(currentYear.toString());
//     fetchRecords();
//   };

//   return (
//     <div className="calibration-container">
//       <div className="calibration-header">
//         <h2>ON-GOING CALIBRATION</h2>
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

//         <select
//           value={selectedYear}
//           onChange={(e) => {
//             setSelectedYear(e.target.value);
//             setActiveSearch("");
//             setSearchInput("");
//           }}
//         >
//           {yearOptions.map((yr) => (
//             <option key={yr} value={yr}>
//               {yr}
//             </option>
//           ))}
//         </select>

//         <select
//           value={rowsPerPage}
//           onChange={(e) => setRowsPerPage(Number(e.target.value))}
//         >
//           <option value={25}>25</option>
//           <option value={50}>50</option>
//           <option value={100}>100</option>
//         </select>

//         <button>Re-Log</button>
//         <button>Quick Log</button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       <div className="search-results-info">
//         <span>
//           Showing <strong>{filteredRecords.length}</strong> of{" "}
//           <strong>{records.length}</strong> records for{" "}
//           <strong>{selectedYear}</strong>
//         </span>
//         {activeSearch && (
//           <span>
//             {" "}
//             — searching <strong>{searchBy}</strong>: "
//             <strong>{activeSearch}</strong>"
//             <button
//               className="clear-search-btn"
//               onClick={() => {
//                 setSearchInput("");
//                 setActiveSearch("");
//               }}
//             >
//               ✕ Clear
//             </button>
//           </span>
//         )}
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
//             ) : filteredRecords.length > 0 ? (
//               filteredRecords.map((r, idx) => (
//                 <tr
//                   key={idx}
//                   className="clickable-row"
//                   onClick={() => handleRowClick(r)}
//                 >
//                   <td>{r.jobNumber}</td>
//                   <td>{r.dateRec}</td>
//                   <td>{r.priority}</td>
//                   <td>{r.oicBy || "Ready"}</td>
//                   <td>{r.companyName}</td>
//                   <td>{r.description}</td>
//                   <td>{r.brand}</td>
//                   <td>{r.model}</td>
//                   <td>{r.serialNo}</td>
//                   <td>{r.eta}</td>
//                   <td>{r.remarks}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="11" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : `No on-going calibration records for ${selectedYear}`}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Reuses the same details modal as Incoming Calibration, retitled.
//           downloadLabel="On-Going Calib" is appended to the downloaded
//           filled-template filename (e.g. "SSS-0001-26 - On-Going Calib.xlsx")
//           so downloads from this stage are distinguishable from Incoming
//           Calibration's. */}
//       {showModal && selectedRecord && (
//         <IncomingCalibDetailsModal
//           jobForm={selectedRecord}
//           title="ON-GOING CALIBRATION DETAILS"
//           downloadLabel="On-Going Calib"
//           onClose={() => setShowModal(false)}
//           onUpdate={handleUpdate}
//           onOpenCamera={() => {}}
//           onOpenFolder={() => {}}
//           onLoadTemplate={() => {}}
//           onLoadAndConnect={() => {}}
//           onOpenCalProcedureLookup={() => {}}
//           onOpenCalStandardLookup={(rowIndex, columnKey) => {}}
//         />
//       )}
//     </div>
//   );
// };

// export default OnGoingCalib;
import React, { useState, useEffect, useMemo, useRef } from "react";
import "./Ongoinglistcalib.css";
import IncomingCalibDetailsModal from "../IncomingCalibration/IncomingCalibDetailsModal";
import CameraCaptureModal from "../jobreceipt/CameraCaptureModal"; // adjust path to wherever this actually lives

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

const OnGoingCalib = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // --- Camera wiring ---------------------------------------------------
  // IncomingCalibDetailsModal's handleOpenCamera does:
  //   const result = await onOpenCamera?.();
  //   if (!result) return;
  // i.e. it expects onOpenCamera to be a function that (a) actually opens
  // a CameraCaptureModal, and (b) returns a Promise that resolves with the
  // array of captured photo dataURLs once the user hits "Done" in that
  // modal. Previously this was stubbed as onOpenCamera={() => {}}, which
  // resolves to undefined immediately, so handleOpenCamera always bailed
  // out on the `if (!result) return;` line and the button did nothing.
  const [showCamera, setShowCamera] = useState(false);
  const cameraResolveRef = useRef(null);

  const handleOpenCamera = () => {
    return new Promise((resolve) => {
      cameraResolveRef.current = resolve;
      setShowCamera(true);
    });
  };

  // Called by CameraCaptureModal's onCapture when the user taps "Done"
  // with at least one photo taken/picked.
  const handleCameraCapture = (photos) => {
    cameraResolveRef.current?.(photos);
    cameraResolveRef.current = null;
    setShowCamera(false);
  };

  // Called by CameraCaptureModal's onClose (✕ / Cancel, or after Done
  // already closed it via handleCameraCapture above). If the modal is
  // dismissed without ever capturing anything, resolve with undefined so
  // the pending Promise in IncomingCalibDetailsModal doesn't hang forever.
  const handleCameraClose = () => {
    cameraResolveRef.current?.(undefined);
    cameraResolveRef.current = null;
    setShowCamera(false);
  };

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
        ? jobs
            // Only jobs that have been moved on from Incoming Calibration,
            // haven't already moved on to For Typing, haven't been closed
            // out via "Log RWOC" in Outgoing Concern (a concern raised
            // while a job was already ongoingTagged would otherwise fall
            // right back into this list once RWOC clears the concern
            // flags), and haven't just been flagged as a concern from
            // THIS stage (clicking "Job Number With Concern" in the
            // details modal sets concernTagged: true and moves the job to
            // Incoming Concern — it must disappear from here too, not
            // just show up over there).
            .filter(
              (job) =>
                job.ongoingTagged === true &&
                !job.forTypingTagged &&
                !job.rwocTagged &&
                !job.concernTagged,
            )
            .map((job) => {
              const receipt = receiptsMap[job.jobReceiptID] || {};
              return {
                jobNumber: job.jobNumber,
                jobReceiptID: job.jobReceiptID,
                type: job.type || "mechanical",
                description: job.description || "",
                brand: job.brand || "",
                model: job.model || "",
                serialNo: job.serialNo || "",
                remarks: job.remarks || "",
                concern: job.concern || "",
                concernTagged: job.concernTagged || false,
                range: job.range || "",
                uncertainty: job.uncertainty || "",
                contactCert: job.contactCert || "",
                frequency: job.frequency || "1 Year",
                eta: job.eta || "",
                oicBy: job.oicBy || "",
                priority: job.priority || "Normal",
                voltage: job.voltage || "-",
                ongoingTagged: job.ongoingTagged || false,
                forTypingTagged: job.forTypingTagged || false,
                // fields carried over from the Incoming Calibration step
                sig: job.sig || "",
                dateCal: job.dateCal || "",
                dateDue: job.dateDue || "",
                accreditationLogo: job.accreditationLogo || "with",
                calibrationProcedure: job.calibrationProcedure || "",
                // Full template record (publicId, code, format, version,
                // etc.) selected/re-uploaded back in Incoming Calibration.
                // Without carrying this over, the Download button in this
                // stage's modal has no publicId to build a filled-template
                // download from, even though calibrationProcedure (the
                // display text) looks populated.
                calibrationProcedureTemplate:
                  job.calibrationProcedureTemplate || null,
                calibrationStandards: job.calibrationStandards || [],
                photoUrl: job.photoUrl || "",
                dateRec: receipt.date || "",
                companyName: receipt.companyName || "",
                // Lives on the job receipt record, not the job number
                // record — needed so the filled-template download can
                // stamp the CDMS sheet's COMPANY ADDRESS cell with it.
                companyAddress: receipt.companyAddress || "",
                contactName: receipt.contactName || "",
              };
            })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch on-going calibration:", err);
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

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  // Clicking Update moves the job on to "For Typing": tag it on the
  // backend, then drop it out of this table immediately (rather than
  // just merging the edited fields back in, like the other stages do).
  const handleUpdate = async (updatedFields) => {
    try {
      const res = await fetch(`${API}/api/jobnumbers/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNumber: selectedRecord.jobNumber,
          ...updatedFields,
          forTypingTagged: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) =>
          prev.filter((r) => r.jobNumber !== selectedRecord.jobNumber),
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Clicking "Job Number With Concern" inside the details modal tags the
  // job with concernTagged: true on the backend and moves it to Incoming
  // Concern. The modal already handles the API call and confirmation
  // dialog — this just drops the row out of THIS table right away so the
  // user doesn't have to hit Refresh to see it disappear.
  const handleConcernFlagged = (jobNumber) => {
    setRecords((prev) => prev.filter((r) => r.jobNumber !== jobNumber));
    setShowModal(false);
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
    fetchRecords();
  };

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>ON-GOING CALIBRATION</h2>
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

        {/* <button>Re-Log</button>
        <button>Quick Log</button> */}
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
                <tr
                  key={idx}
                  className="clickable-row"
                  onClick={() => handleRowClick(r)}
                >
                  <td>{r.jobNumber}</td>
                  <td>{r.dateRec}</td>
                  <td>{r.priority}</td>
                  <td>{r.oicBy || "Ready"}</td>
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
                    : `No on-going calibration records for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reuses the same details modal as Incoming Calibration, retitled.
          downloadLabel="On-Going Calib" is appended to the downloaded
          filled-template filename (e.g. "SSS-0001-26 - On-Going Calib.xlsx")
          so downloads from this stage are distinguishable from Incoming
          Calibration's. onConcernFlagged removes the row from this table
          immediately when "Job Number With Concern" succeeds. onOpenCamera
          now actually opens CameraCaptureModal below and resolves with
          the captured photos, instead of being a no-op stub. */}
      {showModal && selectedRecord && (
        <IncomingCalibDetailsModal
          jobForm={selectedRecord}
          title="ON-GOING CALIBRATION DETAILS"
          downloadLabel="On-Going Calib"
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
          onConcernFlagged={handleConcernFlagged}
          onOpenCamera={handleOpenCamera}
          onOpenFolder={() => {}}
          onLoadTemplate={() => {}}
          onLoadAndConnect={() => {}}
          onOpenCalProcedureLookup={() => {}}
          onOpenCalStandardLookup={(rowIndex, columnKey) => {}}
        />
      )}

      {showCamera && (
        <CameraCaptureModal
          onClose={handleCameraClose}
          onCapture={handleCameraCapture}
          contextLabel={selectedRecord?.jobNumber}
        />
      )}
    </div>
  );
};

export default OnGoingCalib;
