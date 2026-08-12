// import React, { useState, useEffect, useMemo } from "react";
// import "../concernout.css";
// import ConcernInDetailModal from "../IncomingConcern/ConcernInDetailModal";

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

// // Mirrors ConcernIncoming.jsx's structure — same table layout, same
// // merge-with-receipts-and-customers logic. The only real differences:
// //   - filters on outgoingConcernTagged: true instead of concernTagged
// //   - the modal's header subtitle is "Outgoing Concern" instead of the
// //     default "Incoming Concern"
// //   - Update is left as a TODO stub — there's no defined "next stage"
// //     after Outgoing Concern yet. If there is one, wire it the same way
// //     ConcernIncoming.jsx's handleUpdate promotes into this stage: a new
// //     boolean flag, set via PUT /api/jobnumbers/update-details, with the
// //     list filter updated to exclude it once set.
// const ConcernOutgoing = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");
//   const [selectedYear, setSelectedYear] = useState(currentYear.toString());
//   const [rowsPerPage, setRowsPerPage] = useState(25);
//   const [selectedRecord, setSelectedRecord] = useState(null);

//   useEffect(() => {
//     fetchRecords();
//   }, []);

//   const fetchRecords = async () => {
//     setLoading(true);
//     try {
//       const [jobsRes, receiptsRes, customersRes] = await Promise.all([
//         fetch(`${API}/api/jobnumbers`),
//         fetch(`${API}/api/jobreceipts`),
//         // Phone/email live on the Customer record, not the receipt —
//         // TODO: confirm this is the right endpoint/shape for your API.
//         fetch(`${API}/api/customers`),
//       ]);
//       const jobs = await jobsRes.json();
//       const receipts = await receiptsRes.json();
//       const customers = await customersRes.json();

//       const receiptsMap = {};
//       if (Array.isArray(receipts)) {
//         receipts.forEach((r) => {
//           receiptsMap[r.jrId] = r;
//         });
//       }

//       const customersMap = {};
//       if (Array.isArray(customers)) {
//         customers.forEach((c) => {
//           // TODO: confirm the customer's ID field name (customerID vs _id)
//           // matches whatever key the job receipt stores it under below.
//           customersMap[c.customerID || c._id] = c;
//         });
//       }

//       // Jobs that have been promoted out of Incoming Concern via
//       // ConcernIncoming.jsx's "Update" button (see its handleUpdate).
//       const merged = Array.isArray(jobs)
//         ? jobs
//             .filter(
//               (job) =>
//                 job.tagged === true &&
//                 job.concernTagged === true &&
//                 job.outgoingConcernTagged === true,
//             )
//             .map((job) => {
//               const receipt = receiptsMap[job.jobReceiptID] || {};
//               // TODO: confirm the field name the receipt uses to reference
//               // its customer (assuming `customerID` here).
//               const customer = customersMap[receipt.customerID] || {};
//               return {
//                 jobNumber: job.jobNumber,
//                 jobReceiptID: job.jobReceiptID,
//                 dateRec: receipt.date || "",
//                 priority: job.priority || "",
//                 companyName: receipt.companyName || "",
//                 // Company's own contact person — used for the "Con Cert"
//                 // field in the modal (who the certificate is addressed to).
//                 contactName: receipt.contactName || "",
//                 description: job.description || "",
//                 brand: job.brand || "",
//                 model: job.model || "",
//                 serialNo: job.serialNo || "",
//                 eta: job.eta || "",
//                 remarks: job.remarks || "",
//                 concern: job.concern || "",
//                 taggedAt: job.taggedAt || "",
//                 outgoingConcernTaggedAt: job.outgoingConcernTaggedAt || "",
//                 // Staff member assigned to the job — blank for concerns
//                 // that came straight from Instrument Tagging, since
//                 // oicBy only gets set once a job is opened in Incoming
//                 // Calibration Details (see IncomingCalibDetailsModal).
//                 oicBy: job.oicBy || "",
//                 // Not yet returned by /api/jobnumbers or /api/jobreceipts —
//                 // included here so JobDetailsModal picks them up once the
//                 // API starts sending them. Falls back to "--" until then.
//                 sig: job.sig || "",
//                 dateCal: job.dateCal || "",
//                 frequency: job.frequency || "",
//                 uncertainty: job.uncertainty || "",
//                 range: job.range || "",
//                 companyAddress: receipt.companyAddress || "",
//                 // Sourced from the linked Customer record, not the receipt.
//                 phoneNumber: customer.phoneNumber || customer.phone || "",
//                 email: customer.email || "",
//                 faxNumber: customer.faxNumber || receipt.faxNumber || "",
//                 vat: receipt.vat || "",
//                 photoUrl: job.photoUrl || "",
//               };
//             })
//         : [];

//       setRecords(merged);
//     } catch (err) {
//       console.error("Failed to fetch outgoing concern:", err);
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
//     <div className="outgoing-container">
//       <div className="outgoing-header">
//         <h2>OUTGOING CONCERN</h2>
//       </div>

//       <div className="outgoing-tabs">
//         <button className="active">List of Concerns</button>
//       </div>

//       <div className="outgoing-search">
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

//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       <div className="search-results-info">
//         <span>
//           Showing <strong>{filteredRecords.length}</strong> of{" "}
//           <strong>{records.length}</strong> concern records for{" "}
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
//               <th>Concern</th>
//               <th>Remarks</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="12" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredRecords.length > 0 ? (
//               filteredRecords.map((r, idx) => (
//                 <tr
//                   key={idx}
//                   className="clickable-row"
//                   onClick={() => setSelectedRecord(r)}
//                 >
//                   <td>{r.jobNumber}</td>
//                   <td>{r.dateRec}</td>
//                   <td>{r.priority}</td>
//                   <td>{r.oicBy}</td>
//                   <td>{r.companyName}</td>
//                   <td>{r.description}</td>
//                   <td>{r.brand}</td>
//                   <td>{r.model}</td>
//                   <td>{r.serialNo}</td>
//                   <td>{r.eta}</td>
//                   <td>{r.concern}</td>
//                   <td>{r.remarks}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="12" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : `No outgoing concern records for ${selectedYear}`}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {selectedRecord && (
//         <ConcernInDetailModal
//           record={selectedRecord}
//           subtitleBottom="Outgoing Concern"
//           onClose={() => setSelectedRecord(null)}
//           onUpdate={() => {
//             // TODO: no defined next stage after Outgoing Concern yet —
//             // wire this the same way ConcernIncoming.jsx's handleUpdate
//             // does once there's a real destination for this job.
//             setSelectedRecord(null);
//           }}
//           onPrintAgreement={() => {
//             // TODO: wire to your print agreement flow
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default ConcernOutgoing;
import React, { useState, useEffect, useMemo } from "react";
import "../concernout.css";
import ConcernInDetailModal from "../IncomingConcern/ConcernInDetailModal";
// Same dialog used in ConcernIncoming.jsx — replaces window.confirm/alert.
import ConfirmDialog from "../../components/ConfirmDialog";

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

const ConcernOutgoing = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Confirm/error dialog (mirrors ConcernIncoming.jsx) -------------
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    type: "default",
  });

  const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

  const showConfirm = (title, message, onConfirm, type = "default") => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm,
      onCancel: hideDialog,
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      type,
    });
  };

  const showError = (title, message) => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm: hideDialog,
      onCancel: null,
      confirmLabel: "OK",
      cancelLabel: "Cancel",
      type: "danger",
    });
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [jobsRes, receiptsRes, customersRes] = await Promise.all([
        fetch(`${API}/api/jobnumbers`),
        fetch(`${API}/api/jobreceipts`),
        fetch(`${API}/api/customers`),
      ]);
      const jobs = await jobsRes.json();
      const receipts = await receiptsRes.json();
      const customers = await customersRes.json();

      const receiptsMap = {};
      if (Array.isArray(receipts)) {
        receipts.forEach((r) => {
          receiptsMap[r.jrId] = r;
        });
      }

      const customersMap = {};
      if (Array.isArray(customers)) {
        customers.forEach((c) => {
          customersMap[c.customerID || c._id] = c;
        });
      }

      // Jobs promoted out of Incoming Concern via ConcernIncoming.jsx's
      // "Update" button, that haven't already been resolved (Update or
      // Log RWOC) out of this list yet.
      const merged = Array.isArray(jobs)
        ? jobs
            .filter(
              (job) =>
                job.tagged === true &&
                job.concernTagged === true &&
                job.outgoingConcernTagged === true &&
                job.rwocTagged !== true,
            )
            .map((job) => {
              const receipt = receiptsMap[job.jobReceiptID] || {};
              const customer = customersMap[receipt.customerID] || {};
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
                outgoingConcernTaggedAt: job.outgoingConcernTaggedAt || "",
                oicBy: job.oicBy || "",
                sig: job.sig || "",
                dateCal: job.dateCal || "",
                frequency: job.frequency || "",
                uncertainty: job.uncertainty || "",
                range: job.range || "",
                companyAddress: receipt.companyAddress || "",
                phoneNumber: customer.phoneNumber || customer.phone || "",
                email: customer.email || "",
                faxNumber: customer.faxNumber || receipt.faxNumber || "",
                vat: receipt.vat || "",
                photoUrl: job.photoUrl || "",
                // Not shown in the table — used only to decide where
                // "Update" sends the job back to. Never modified by any
                // concern-tagging step, so it still reflects whatever
                // stage the job was in before the concern was raised:
                // false -> was in Incoming Calibration (or came straight
                // from Instrument Tagging); true -> was already in
                // On-Going Calibration.
                ongoingTagged: job.ongoingTagged === true,
              };
            })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch outgoing concern:", err);
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

  // "Update" resolves the concern. We deliberately do NOT touch
  // ongoingTagged here — clearing concernTagged/outgoingConcernTagged is
  // enough for the job to fall back into the correct list on its own:
  //   ongoingTagged: false -> reappears in Incoming Calibration
  //   ongoingTagged: true  -> reappears in On-Going Calibration
  const handleUpdate = (updatedRecord) => {
    if (!updatedRecord?.jobNumber) {
      setSelectedRecord(null);
      return;
    }

    const destination = updatedRecord.ongoingTagged
      ? "On-Going Calibration"
      : "Incoming Calibration";

    showConfirm(
      "Resolve Concern",
      `Are you sure you want to resolve this concern for Job Number ${updatedRecord.jobNumber}? It will move back to ${destination}.`,
      async () => {
        hideDialog();
        setIsUpdating(true);
        try {
          const res = await fetch(`${API}/api/jobnumbers/update-details`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobNumber: updatedRecord.jobNumber,
              concernTagged: false,
              outgoingConcernTagged: false,
              concernResolvedAt: new Date().toISOString(),
            }),
          });
          const data = await res.json();
          if (!res.ok || data.success === false) {
            throw new Error(data?.message || "Failed to resolve concern");
          }
          await fetchRecords();
          setSelectedRecord(null);
        } catch (err) {
          console.error("Failed to resolve concern:", err);
          showError(
            "Update Failed",
            "This concern could not be resolved. Please try again.",
          );
        } finally {
          setIsUpdating(false);
        }
      },
      "default",
    );
  };

  // "Log RWOC" — Return Without Calibration. Terminal state: the job is
  // finished but never got calibrated. rwocTagged is the flag that keeps
  // it out of every other list (Incoming/On-Going Calibration, Incoming
  // Concern, this Outgoing Concern list) going forward.
  const handleLogRwoc = (updatedRecord) => {
    if (!updatedRecord?.jobNumber) return;

    showConfirm(
      "Log RWOC",
      `Mark Job Number ${updatedRecord.jobNumber} as Returned Without Calibration? The job will be closed out and will not continue on to calibration.`,
      async () => {
        hideDialog();
        setIsUpdating(true);
        try {
          const res = await fetch(`${API}/api/jobnumbers/update-details`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobNumber: updatedRecord.jobNumber,
              rwocTagged: true,
              rwocTaggedAt: new Date().toISOString(),
              jobFinished: true,
              concernTagged: false,
              outgoingConcernTagged: false,
            }),
          });
          const data = await res.json();
          if (!res.ok || data.success === false) {
            throw new Error(data?.message || "Failed to log RWOC");
          }
          await fetchRecords();
          setSelectedRecord(null);
        } catch (err) {
          console.error("Failed to log RWOC:", err);
          showError(
            "Update Failed",
            "This job could not be marked as RWOC. Please try again.",
          );
        } finally {
          setIsUpdating(false);
        }
      },
      "danger",
    );
  };

  return (
    <div className="outgoing-container">
      <div className="outgoing-header">
        <h2>OUTGOING CONCERN</h2>
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
                <tr
                  key={idx}
                  className="clickable-row"
                  onClick={() => setSelectedRecord(r)}
                >
                  <td>{r.jobNumber}</td>
                  <td>{r.dateRec}</td>
                  <td>{r.priority}</td>
                  <td>{r.oicBy}</td>
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
                    : `No outgoing concern records for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <ConcernInDetailModal
          record={selectedRecord}
          subtitleBottom="Outgoing Concern"
          onClose={() => setSelectedRecord(null)}
          onUpdate={handleUpdate}
          onLogRwoc={handleLogRwoc}
          onPrintAgreement={() => {
            // TODO: wire to your print agreement flow
          }}
        />
      )}

      {dialog.show && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          type={dialog.type}
        />
      )}
    </div>
  );
};

export default ConcernOutgoing;
