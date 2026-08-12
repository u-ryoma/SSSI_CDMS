// import React, { useState, useEffect, useMemo } from "react";
// import "../concernout.css";
// import ConcernInDetailModal from "./ConcernInDetailModal";

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

// const ConcernIncoming = () => {
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

//       // only tagged jobs where concernTagged is true
//       const merged = Array.isArray(jobs)
//         ? jobs
//             .filter((job) => job.tagged === true && job.concernTagged === true)
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
//       console.error("Failed to fetch incoming concern:", err);
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
//         <h2>INCOMING CONCERN</h2>
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
//                     : `No incoming concern records for ${selectedYear}`}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {selectedRecord && (
//         <ConcernInDetailModal
//           record={selectedRecord}
//           onClose={() => setSelectedRecord(null)}
//           onUpdate={() => {
//             // TODO: wire to your update endpoint, then refresh + close
//             setSelectedRecord(null);
//           }}
//           onOpenCamera={() => {
//             // TODO: wire to your camera capture flow
//           }}
//           onOpenFolder={() => {
//             // TODO: wire to your attachments/folder flow
//           }}
//           onPrintAgreement={() => {
//             // TODO: wire to your print agreement flow
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default ConcernIncoming;
import React, { useState, useEffect, useMemo } from "react";
import "../concernout.css";
import ConcernInDetailModal from "./ConcernInDetailModal";
// TODO: confirm this relative path matches where ConfirmDialog actually
// lives in your tree (mirrors the "../../components/ConfirmDialog"
// import used from IncomingCalibDetailsModal.jsx — adjust the number of
// "../" if ConcernIncoming.jsx sits at a different folder depth).
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

const ConcernIncoming = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Confirm/error dialog (replaces window.confirm/alert) ----------
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
        // Phone/email live on the Customer record, not the receipt —
        // TODO: confirm this is the right endpoint/shape for your API.
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
          // TODO: confirm the customer's ID field name (customerID vs _id)
          // matches whatever key the job receipt stores it under below.
          customersMap[c.customerID || c._id] = c;
        });
      }

      // only tagged jobs where concernTagged is true and it hasn't
      // already been promoted on to Outgoing Concern
      const merged = Array.isArray(jobs)
        ? jobs
            .filter(
              (job) =>
                job.tagged === true &&
                job.concernTagged === true &&
                job.outgoingConcernTagged !== true,
            )
            .map((job) => {
              const receipt = receiptsMap[job.jobReceiptID] || {};
              // TODO: confirm the field name the receipt uses to reference
              // its customer (assuming `customerID` here).
              const customer = customersMap[receipt.customerID] || {};
              return {
                jobNumber: job.jobNumber,
                jobReceiptID: job.jobReceiptID,
                dateRec: receipt.date || "",
                priority: job.priority || "",
                companyName: receipt.companyName || "",
                // Company's own contact person — used for the "Con Cert"
                // field in the modal (who the certificate is addressed to).
                contactName: receipt.contactName || "",
                description: job.description || "",
                brand: job.brand || "",
                model: job.model || "",
                serialNo: job.serialNo || "",
                eta: job.eta || "",
                remarks: job.remarks || "",
                concern: job.concern || "",
                taggedAt: job.taggedAt || "",
                // Staff member assigned to the job — blank for concerns
                // that came straight from Instrument Tagging, since
                // oicBy only gets set once a job is opened in Incoming
                // Calibration Details (see IncomingCalibDetailsModal).
                oicBy: job.oicBy || "",
                // Which flow flagged this concern:
                // "instrumentTag" -> InstrumentTag.jsx's checkbox (no
                //   OIC/SIG on the job yet).
                // "calibration"   -> IncomingCalibDetailsModal.jsx's
                //   "Job Number With Concern" button (OIC/SIG are real).
                // Set server-side by PUT /api/jobnumbers/tag. Used by
                // JobDetailsModal to decide whether to render OIC/SIG.
                concernSource: job.concernSource || "",
                // Not yet returned by /api/jobnumbers or /api/jobreceipts —
                // included here so JobDetailsModal picks them up once the
                // API starts sending them. Falls back to "--" until then.
                sig: job.sig || "",
                dateCal: job.dateCal || "",
                frequency: job.frequency || "",
                uncertainty: job.uncertainty || "",
                range: job.range || "",
                companyAddress: receipt.companyAddress || "",
                // Sourced from the linked Customer record, not the receipt.
                phoneNumber: customer.phoneNumber || customer.phone || "",
                email: customer.email || "",
                faxNumber: customer.faxNumber || receipt.faxNumber || "",
                vat: receipt.vat || "",
                photoUrl: job.photoUrl || "",
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

  // Promotes the job to the Outgoing Concern stage — same pattern as
  // tagged/concernTagged/ongoingTagged elsewhere in the app, just a new
  // flag (outgoingConcernTagged) set via the existing generic
  // PUT /api/jobnumbers/update-details route (no backend changes
  // needed, since that route already does a bare $set on whatever
  // fields are sent). Once set, this job drops out of the filter above
  // and needs to be picked up by a page querying
  // outgoingConcernTagged: true instead (see ConcernOutgoing.jsx).
  const handleUpdate = (updatedRecord) => {
    if (!updatedRecord?.jobNumber) {
      setSelectedRecord(null);
      return;
    }

    showConfirm(
      "Move to Outgoing Concern",
      `Are you sure you want to move Job Number ${updatedRecord.jobNumber} to Outgoing Concern? It will leave this Incoming Concern list.`,
      async () => {
        hideDialog();
        setIsUpdating(true);
        try {
          const res = await fetch(`${API}/api/jobnumbers/update-details`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobNumber: updatedRecord.jobNumber,
              outgoingConcernTagged: true,
              outgoingConcernTaggedAt: new Date().toISOString(),
            }),
          });
          const data = await res.json();
          if (!res.ok || data.success === false) {
            throw new Error(
              data?.message || "Failed to move job to Outgoing Concern",
            );
          }
          await fetchRecords();
          setSelectedRecord(null);
        } catch (err) {
          console.error("Failed to move job to Outgoing Concern:", err);
          showError(
            "Update Failed",
            "This job could not be moved to Outgoing Concern. Please try again.",
          );
        } finally {
          setIsUpdating(false);
        }
      },
      "default",
    );
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
                    : `No incoming concern records for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <ConcernInDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdate={handleUpdate}
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

export default ConcernIncoming;
