// import React, { useState, useEffect, useCallback } from "react";
// import "../assetmonitoring.css";
// import AddAssetModal from "./AddAssetModal";

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
//   photoUrl: "",
// };

// const CalibrationSystem = () => {
//   const [assets, setAssets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState(initialFormState);
//   const [isEditingExisting, setIsEditingExisting] = useState(false);
//   const [searchField, setSearchField] = useState("standardId");
//   const [searchQuery, setSearchQuery] = useState("");

//   const fetchAssets = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/standards");
//       const data = await res.json();
//       setAssets(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to load standards:", err);
//       setAssets([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAssets();
//   }, [fetchAssets]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Opens the modal empty, ready to create a brand new standard.
//   const handleOpenModal = () => {
//     setFormData(initialFormState);
//     setIsEditingExisting(false);
//     setIsModalOpen(true);
//   };

//   // Opens the modal pre-filled, ready to edit an existing standard.
//   const handleRowClick = (asset) => {
//     setFormData({ ...initialFormState, ...asset });
//     setIsEditingExisting(true);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setFormData(initialFormState);
//     setIsEditingExisting(false);
//   };

//   // Uploads a freshly captured photo (raw Blob) to the backend, which
//   // streams it to Cloudinary and hands back the secure URL. Kept
//   // separate from handleSubmit so the upload step and the save step
//   // each fail with their own clear error message.
//   //
//   // Mirrors the equipment-photo pattern: standardId is used purely as a
//   // Cloudinary folder key. If the user photographs a brand-new standard
//   // before Save (i.e. before standardId is necessarily final in Mongo),
//   // fall back to a "pending_<timestamp>" key so the upload still has
//   // somewhere to land.
//   const uploadPhoto = async (blob) => {
//     const folderKey = (formData.standardId || `pending_${Date.now()}`).replace(
//       /\//g,
//       "_",
//     );
//     const uploadForm = new FormData();
//     uploadForm.append("photo", blob, "asset-photo.jpg");

//     const res = await fetch(
//       `/api/uploads/standard-photo/${encodeURIComponent(folderKey)}`,
//       { method: "POST", body: uploadForm },
//     );
//     const data = await res.json();

//     if (!res.ok || !data.success) {
//       throw new Error(data.message || "Photo upload failed");
//     }

//     return data.url;
//   };

//   // Create (POST) if this is a brand new standard, otherwise update (PUT)
//   // the existing one. Whether it's new is now tracked explicitly via
//   // isEditingExisting, NOT by checking if standardId is empty — since
//   // standardId is a manually-typed field now, it's non-empty even for
//   // brand new records as soon as the user fills it in.
//   //
//   // If the user captured a new photo in this session, photoBlob is the
//   // raw image data handed up from AddAssetModal. It gets uploaded to
//   // Cloudinary first so the resulting URL can be saved alongside the
//   // rest of the standard's fields in one record.
//   const handleSubmit = async (e, photoBlob) => {
//     e.preventDefault();
//     try {
//       let photoUrl = formData.photoUrl;

//       if (photoBlob) {
//         photoUrl = await uploadPhoto(photoBlob);
//       }

//       const payload = { ...formData, photoUrl };

//       const isNew = !isEditingExisting;
//       const url = isNew
//         ? "/api/standards"
//         : `/api/standards/${encodeURIComponent(formData.standardId)}`;
//       const method = isNew ? "POST" : "PUT";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();

//       if (!res.ok || (!data.success && !data.standardId)) {
//         throw new Error(data.message || "Save failed");
//       }

//       handleCloseModal();
//       fetchAssets();
//     } catch (err) {
//       console.error("Failed to save standard:", err);
//       alert(
//         err.message ||
//           "Failed to save. Please check the required fields and try again.",
//       );
//     }
//   };

//   const handleForCalibration = async () => {
//     if (!formData.standardId) {
//       alert("Save this standard first before flagging it for calibration.");
//       return;
//     }
//     try {
//       await fetch(
//         `/api/standards/${encodeURIComponent(formData.standardId)}/for-calibration`,
//         { method: "PUT" },
//       );
//       setFormData((prev) => ({ ...prev, calibStatus: "For Calibration" }));
//       fetchAssets();
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
//       // Wire this into a history modal/panel when you're ready for one.
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
//       // Wire this into a history modal/panel when you're ready for one.
//     } catch (err) {
//       console.error("Failed to load modification history:", err);
//     }
//   };

//   const filteredAssets = assets.filter((asset) => {
//     if (!searchQuery) return true;
//     const value = asset[searchField] || "";
//     return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
//   });

//   const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

//   return (
//     <div className="calibration-container">
//       {/* HEADER */}
//       <header className="calibration-header">
//         <h2>ASSET MONITORING SYSTEM</h2>
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
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//         <button
//           onClick={() => {
//             setSearchQuery("");
//             fetchAssets();
//           }}
//         >
//           Refresh
//         </button>
//         <button className="add-new-btn" onClick={handleOpenModal}>
//           + Add New
//         </button>
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
//                 <td colSpan={11} style={{ textAlign: "center" }}>
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredAssets.length === 0 ? (
//               <tr>
//                 <td colSpan={11} style={{ textAlign: "center" }}>
//                   No records found.
//                 </td>
//               </tr>
//             ) : (
//               filteredAssets.map((asset) => (
//                 <tr
//                   key={asset._id || asset.standardId}
//                   onClick={() => handleRowClick(asset)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <td>{asset.standardId}</td>
//                   <td>{asset.assetNo}</td>
//                   <td>{asset.description}</td>
//                   <td>{asset.brand}</td>
//                   <td>{asset.model}</td>
//                   <td>{asset.serialNo}</td>
//                   <td>{asset.range}</td>
//                   <td>{formatDate(asset.dateCal)}</td>
//                   <td>{formatDate(asset.dateDue)}</td>
//                   <td>{asset.cycle}</td>
//                   <td>{asset.centre}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ADD / EDIT MODAL */}
//       <AddAssetModal
//         isOpen={isModalOpen}
//         formData={formData}
//         onChange={handleChange}
//         onClose={handleCloseModal}
//         onSubmit={handleSubmit}
//         onForCalibration={handleForCalibration}
//         onShowAssetHistory={handleShowAssetHistory}
//         onModificationHistory={handleModificationHistory}
//         isEditingExisting={isEditingExisting}
//         subtitleBottom="Asset Monitoring"
//       />
//     </div>
//   );
// };

// export default CalibrationSystem;
import React, { useState, useEffect, useCallback } from "react";
import "../assetmonitoring.css";
import AddAssetModal from "./AddAssetModal";

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
  photoUrl: "",
};

const CalibrationSystem = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [searchField, setSearchField] = useState("standardId");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/standards");
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load standards:", err);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Opens the modal empty, ready to create a brand new standard.
  const handleOpenModal = () => {
    setFormData(initialFormState);
    setIsEditingExisting(false);
    setIsModalOpen(true);
  };

  // Opens the modal pre-filled, ready to edit an existing standard.
  const handleRowClick = (asset) => {
    setFormData({ ...initialFormState, ...asset });
    setIsEditingExisting(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setIsEditingExisting(false);
  };

  // Uploads a freshly captured photo (raw Blob) to the backend, which
  // streams it to Cloudinary and hands back the secure URL. Kept
  // separate from handleSubmit so the upload step and the save step
  // each fail with their own clear error message.
  //
  // Mirrors the equipment-photo pattern: standardId is used purely as a
  // Cloudinary folder key. If the user photographs a brand-new standard
  // before Save (i.e. before standardId is necessarily final in Mongo),
  // fall back to a "pending_<timestamp>" key so the upload still has
  // somewhere to land.
  const uploadPhoto = async (blob) => {
    const folderKey = (formData.standardId || `pending_${Date.now()}`).replace(
      /\//g,
      "_",
    );
    const uploadForm = new FormData();
    uploadForm.append("photo", blob, "asset-photo.jpg");

    const res = await fetch(
      `/api/uploads/standard-photo/${encodeURIComponent(folderKey)}`,
      { method: "POST", body: uploadForm },
    );
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Photo upload failed");
    }

    return data.url;
  };

  // Explicitly creates (or confirms) the Cloudinary folder for a
  // standardId. Called on every Save/Update even when no photo was
  // taken this session — otherwise a folder only ever appeared as a
  // side effect of uploadPhoto, so standards saved without a photo
  // never got a folder at all. Non-fatal: a failure here shouldn't
  // block the actual record save.
  const ensureStandardFolder = async (standardId) => {
    const folderKey = standardId.replace(/\//g, "_");
    try {
      await fetch(
        `/api/uploads/standard-folder/${encodeURIComponent(folderKey)}`,
        { method: "POST" },
      );
    } catch (err) {
      console.error("Failed to ensure standard folder:", err);
    }
  };

  // Create (POST) if this is a brand new standard, otherwise update (PUT)
  // the existing one. Whether it's new is now tracked explicitly via
  // isEditingExisting, NOT by checking if standardId is empty — since
  // standardId is a manually-typed field now, it's non-empty even for
  // brand new records as soon as the user fills it in.
  //
  // If the user captured a new photo in this session, photoBlob is the
  // raw image data handed up from AddAssetModal. It gets uploaded to
  // Cloudinary first so the resulting URL can be saved alongside the
  // rest of the standard's fields in one record. If no photo was
  // captured, we still ensure a Cloudinary folder exists for this
  // standardId so every saved standard has one from the start.
  const handleSubmit = async (e, photoBlob) => {
    e.preventDefault();
    try {
      let photoUrl = formData.photoUrl;

      if (photoBlob) {
        photoUrl = await uploadPhoto(photoBlob);
      } else if (formData.standardId) {
        await ensureStandardFolder(formData.standardId);
      }

      const payload = { ...formData, photoUrl };

      const isNew = !isEditingExisting;
      const url = isNew
        ? "/api/standards"
        : `/api/standards/${encodeURIComponent(formData.standardId)}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || (!data.success && !data.standardId)) {
        throw new Error(data.message || "Save failed");
      }

      handleCloseModal();
      fetchAssets();
    } catch (err) {
      console.error("Failed to save standard:", err);
      alert(
        err.message ||
          "Failed to save. Please check the required fields and try again.",
      );
    }
  };

  const handleForCalibration = async () => {
    if (!formData.standardId) {
      alert("Save this standard first before flagging it for calibration.");
      return;
    }
    try {
      await fetch(
        `/api/standards/${encodeURIComponent(formData.standardId)}/for-calibration`,
        { method: "PUT" },
      );
      setFormData((prev) => ({ ...prev, calibStatus: "For Calibration" }));
      fetchAssets();
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
      // Wire this into a history modal/panel when you're ready for one.
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
      // Wire this into a history modal/panel when you're ready for one.
    } catch (err) {
      console.error("Failed to load modification history:", err);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    if (!searchQuery) return true;
    const value = asset[searchField] || "";
    return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  return (
    <div className="calibration-container">
      {/* HEADER */}
      <header className="calibration-header">
        <h2>ASSET MONITORING SYSTEM</h2>
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => {
            setSearchQuery("");
            fetchAssets();
          }}
        >
          Refresh
        </button>
        <button className="add-new-btn" onClick={handleOpenModal}>
          + Add New
        </button>
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
                <td colSpan={11} style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center" }}>
                  No records found.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr
                  key={asset._id || asset.standardId}
                  onClick={() => handleRowClick(asset)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{asset.standardId}</td>
                  <td>{asset.assetNo}</td>
                  <td>{asset.description}</td>
                  <td>{asset.brand}</td>
                  <td>{asset.model}</td>
                  <td>{asset.serialNo}</td>
                  <td>{asset.range}</td>
                  <td>{formatDate(asset.dateCal)}</td>
                  <td>{formatDate(asset.dateDue)}</td>
                  <td>{asset.cycle}</td>
                  <td>{asset.centre}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      <AddAssetModal
        isOpen={isModalOpen}
        formData={formData}
        onChange={handleChange}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onForCalibration={handleForCalibration}
        onShowAssetHistory={handleShowAssetHistory}
        onModificationHistory={handleModificationHistory}
        isEditingExisting={isEditingExisting}
        subtitleBottom="Asset Monitoring"
      />
    </div>
  );
};

export default CalibrationSystem;
