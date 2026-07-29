// import React, { useState, useEffect, useCallback } from "react";
// import "./assetmonitoring.css";
// import AddAssetModal from "./AssetMonitoring/AddAssetModal";

// const SEARCH_FIELDS = {
//   standardId: "standardId",
//   assetNo: "assetNo",
//   description: "description",
// };

// const initialFormState = {
//   standardId: "",
//   assetNo: "",
//   description: "",
//   brand: "",
//   model: "",
//   serialNo: "",
//   range: "",
//   dateCal: "",
//   dateDue: "",
//   cycle: "1 Year",
//   centre: "",
//   code: "",
//   remarks: "",
//   status: "Active",
//   location: "",
//   calibOfficer: "",
//   calibStatus: "Active",
// };

// export default function StdForCertification() {
//   const [standards, setStandards] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchField, setSearchField] = useState("standardId");
//   const [searchTerm, setSearchTerm] = useState("");

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState(initialFormState);

//   const fetchStandards = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/standards/for-certification");
//       const data = await res.json();
//       setStandards(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to load standards for certification:", err);
//       setStandards([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStandards();
//   }, [fetchStandards]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Rows here always represent an existing standard, so opening the
//   // modal is always an edit (never a brand-new record).
//   const handleRowClick = (asset) => {
//     setFormData({ ...initialFormState, ...asset });
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setFormData(initialFormState);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch(
//         `/api/standards/${encodeURIComponent(formData.standardId)}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(formData),
//         },
//       );
//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Save failed");
//       }

//       handleCloseModal();
//       fetchStandards();
//     } catch (err) {
//       console.error("Failed to save standard:", err);
//       alert(
//         err.message ||
//           "Failed to save. Please check the required fields and try again.",
//       );
//     }
//   };

//   const handleForCalibration = async () => {
//     if (!formData.standardId) return;
//     try {
//       await fetch(
//         `/api/standards/${encodeURIComponent(formData.standardId)}/for-calibration`,
//         { method: "PUT" },
//       );
//       setFormData((prev) => ({ ...prev, calibStatus: "For Calibration" }));
//       fetchStandards();
//     } catch (err) {
//       console.error("Failed to flag for calibration:", err);
//     }
//   };

//   const handleShowAssetHistory = async () => {
//     if (!formData.standardId) return;
//     try {
//       const res = await fetch(
//         `/api/standards/${encodeURIComponent(formData.standardId)}/history`,
//       );
//       const history = await res.json();
//       console.log("Asset history:", history);
//     } catch (err) {
//       console.error("Failed to load asset history:", err);
//     }
//   };

//   const handleModificationHistory = async () => {
//     if (!formData.standardId) return;
//     try {
//       const res = await fetch(
//         `/api/standards/${encodeURIComponent(formData.standardId)}/history`,
//       );
//       const history = await res.json();
//       const modificationsOnly = history.filter((h) => h.action === "Updated");
//       console.log("Modification history:", modificationsOnly);
//     } catch (err) {
//       console.error("Failed to load modification history:", err);
//     }
//   };

//   const filtered = standards.filter((s) => {
//     if (!searchTerm.trim()) return true;
//     const field = SEARCH_FIELDS[searchField] || "standardId";
//     return (s[field] || "")
//       .toString()
//       .toLowerCase()
//       .includes(searchTerm.trim().toLowerCase());
//   });

//   const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

//   return (
//     <div className="calibration-container">
//       {/* HEADER */}
//       <header className="calibration-header">
//         <h2>STANDARD FOR CERTIFICATION</h2>
//       </header>

//       {/* SEARCH BAR */}
//       <div className="calibration-search">
//         <select
//           value={searchField}
//           onChange={(e) => setSearchField(e.target.value)}
//         >
//           <option value="standardId">Standard ID</option>
//           <option value="assetNo">Asset No</option>
//           <option value="description">Description</option>
//         </select>
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <button onClick={fetchStandards}>Refresh</button>
//       </div>

//       {/* TABLE */}
//       <div className="calibration-table-wrapper">
//         <table className="calibration-table">
//           <thead>
//             <tr>
//               <th>Standard ID</th>
//               <th>Asset No</th>
//               <th>Description</th>
//               <th>Brand</th>
//               <th>Model</th>
//               <th>Serial No.</th>
//               <th>Range</th>
//               <th>Date Cal</th>
//               <th>Date Due</th>
//               <th>Cycle</th>
//               <th>Centre</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan={11}>Loading...</td>
//               </tr>
//             ) : filtered.length === 0 ? (
//               <tr>
//                 <td colSpan={11}>No standards found.</td>
//               </tr>
//             ) : (
//               filtered.map((s) => (
//                 <tr
//                   key={s._id || s.standardId}
//                   onClick={() => handleRowClick(s)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <td>{s.standardId}</td>
//                   <td>{s.assetNo}</td>
//                   <td>{s.description}</td>
//                   <td>{s.brand}</td>
//                   <td>{s.model}</td>
//                   <td>{s.serialNo}</td>
//                   <td>{s.range}</td>
//                   <td>{formatDate(s.dateCal)}</td>
//                   <td>{formatDate(s.dateDue)}</td>
//                   <td>{s.cycle}</td>
//                   <td>{s.centre}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* DETAILS / EDIT MODAL — always in "update" mode here since every
//           row is an existing standard. */}
//       <AddAssetModal
//         isOpen={isModalOpen}
//         formData={formData}
//         onChange={handleChange}
//         onClose={handleCloseModal}
//         onSubmit={handleSubmit}
//         onForCalibration={handleForCalibration}
//         onShowAssetHistory={handleShowAssetHistory}
//         onModificationHistory={handleModificationHistory}
//         isEditingExisting={true}
//       />
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback } from "react";
import "./assetmonitoring.css";
import AddAssetModal from "./AssetMonitoring/AddAssetModal";

const SEARCH_FIELDS = {
  standardId: "standardId",
  assetNo: "assetNo",
  description: "description",
};

const initialFormState = {
  standardId: "",
  assetNo: "",
  description: "",
  brand: "",
  model: "",
  serialNo: "",
  range: "",
  dateCal: "",
  dateDue: "",
  cycle: "1 Year",
  centre: "",
  code: "",
  remarks: "",
  status: "Active",
  location: "",
  calibOfficer: "",
  calibStatus: "Active",
};

export default function StdForCertification() {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchField, setSearchField] = useState("standardId");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const fetchStandards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/standards/for-certification");
      const data = await res.json();
      setStandards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load standards for certification:", err);
      setStandards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandards();
  }, [fetchStandards]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Rows here always represent an existing standard, so opening the
  // modal is always an edit (never a brand-new record).
  const handleRowClick = (asset) => {
    setFormData({ ...initialFormState, ...asset });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/standards/${encodeURIComponent(formData.standardId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Save failed");
      }

      handleCloseModal();
      fetchStandards();
    } catch (err) {
      console.error("Failed to save standard:", err);
      alert(
        err.message ||
          "Failed to save. Please check the required fields and try again.",
      );
    }
  };

  const handleForCalibration = async () => {
    if (!formData.standardId) return;
    try {
      await fetch(
        `/api/standards/${encodeURIComponent(formData.standardId)}/for-calibration`,
        { method: "PUT" },
      );
      setFormData((prev) => ({ ...prev, calibStatus: "For Calibration" }));
      fetchStandards();
    } catch (err) {
      console.error("Failed to flag for calibration:", err);
    }
  };

  const handleShowAssetHistory = async () => {
    if (!formData.standardId) return;
    try {
      const res = await fetch(
        `/api/standards/${encodeURIComponent(formData.standardId)}/history`,
      );
      const history = await res.json();
      console.log("Asset history:", history);
    } catch (err) {
      console.error("Failed to load asset history:", err);
    }
  };

  const handleModificationHistory = async () => {
    if (!formData.standardId) return;
    try {
      const res = await fetch(
        `/api/standards/${encodeURIComponent(formData.standardId)}/history`,
      );
      const history = await res.json();
      const modificationsOnly = history.filter((h) => h.action === "Updated");
      console.log("Modification history:", modificationsOnly);
    } catch (err) {
      console.error("Failed to load modification history:", err);
    }
  };

  const filtered = standards.filter((s) => {
    if (!searchTerm.trim()) return true;
    const field = SEARCH_FIELDS[searchField] || "standardId";
    return (s[field] || "")
      .toString()
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
  });

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <div className="calibration-container">
      {/* HEADER */}
      <header className="calibration-header">
        <h2>STANDARD FOR CERTIFICATION</h2>
      </header>

      {/* SEARCH BAR */}
      <div className="calibration-search">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value="standardId">Standard ID</option>
          <option value="assetNo">Asset No</option>
          <option value="description">Description</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={fetchStandards}>Refresh</button>
      </div>

      {/* TABLE */}
      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Standard ID</th>
              <th>Asset No</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No.</th>
              <th>Range</th>
              <th>Date Cal</th>
              <th>Date Due</th>
              <th>Cycle</th>
              <th>Centre</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11}>Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={11}>No standards found.</td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s._id || s.standardId}
                  onClick={() => handleRowClick(s)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{s.standardId}</td>
                  <td>{s.assetNo}</td>
                  <td>{s.description}</td>
                  <td>{s.brand}</td>
                  <td>{s.model}</td>
                  <td>{s.serialNo}</td>
                  <td>{s.range}</td>
                  <td>{formatDate(s.dateCal)}</td>
                  <td>{formatDate(s.dateDue)}</td>
                  <td>{s.cycle}</td>
                  <td>{s.centre}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILS / EDIT MODAL — always in "update" mode here since every
          row is an existing standard. */}
      <AddAssetModal
        isOpen={isModalOpen}
        formData={formData}
        onChange={handleChange}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onForCalibration={handleForCalibration}
        onShowAssetHistory={handleShowAssetHistory}
        onModificationHistory={handleModificationHistory}
        isEditingExisting={true}
        subtitleBottom="Standard For Certification"
      />
    </div>
  );
}
