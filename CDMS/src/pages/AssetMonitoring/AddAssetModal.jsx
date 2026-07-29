// import React, { useEffect, useRef, useState } from "react";

// import "./AddAssetModal.css";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import CameraModal from "./CameraModal";
// import ViewFilesModal from "./ViewFilesModal";

// const AddAssetModal = ({
//   isOpen,
//   formData,
//   onChange,
//   onClose,
//   onSubmit,
//   onOpenCamera,
//   onOpenFolder,
//   onShowAssetHistory,
//   onModificationHistory,
//   onForCalibration,
//   onExit,
//   imagePreviewUrl,
//   isEditingExisting,
//   subtitleBottom,
// }) => {
//   const fileInputRef = useRef(null);
//   const [isCameraOpen, setIsCameraOpen] = useState(false);
//   const [isViewFilesOpen, setIsViewFilesOpen] = useState(false);

//   // A photo the user just captured but hasn't saved yet. It only lives
//   // here — { dataUrl, blob } — and is NOT written into formData, since
//   // formData.photoUrl is reserved for the final Cloudinary URL. The
//   // dataUrl is what gets shown in the viewer in the meantime; the blob
//   // travels up to the parent on submit so it can be uploaded there.
//   const [pendingPhoto, setPendingPhoto] = useState(null);

//   // Reset any pending (unsaved) capture whenever the modal is (re)opened,
//   // whether that's for a brand new standard or for editing an existing
//   // one. Without this, a photo captured in one modal session would still
//   // be sitting in state the next time the modal opens.
//   useEffect(() => {
//     if (isOpen) {
//       setPendingPhoto(null);
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const handlePhotoCaptured = ({ dataUrl, blob }) => {
//     setPendingPhoto({ dataUrl, blob });
//     setIsCameraOpen(false);
//   };

//   // Files live in Cloudinary under a folder keyed by standardId, so
//   // there's nothing to show until the standard has actually been saved
//   // at least once.
//   const handleViewFiles = () => {
//     if (!formData.standardId) {
//       alert("Save this standard first before viewing its files.");
//       return;
//     }
//     setIsViewFilesOpen(true);
//   };

//   // Prefer a freshly captured (not-yet-uploaded) photo, then fall back to
//   // whatever photo URL is already saved on this standard, then whatever
//   // preview the parent passed in.
//   const displayedImage =
//     pendingPhoto?.dataUrl || formData.photoUrl || imagePreviewUrl;

//   // Wrap the parent's onSubmit so the pending photo's raw blob rides
//   // along with the form submit event. The parent is responsible for
//   // uploading it (to Cloudinary via the backend) before saving the
//   // standard record.
//   const handleFormSubmit = (e) => {
//     onSubmit(e, pendingPhoto?.blob || null);
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="cdms-modal" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader
//           title="CALIBRATION STANDARD INFORMATION DETAILS"
//           subtitleBottom={subtitleBottom || "Asset Monitoring"}
//           onClose={onClose}
//         />

//         <form onSubmit={handleFormSubmit}>
//           <div className="cdms-modal-body">
//             <div className="cdms-form-grid">
//               {/* LEFT COLUMN */}
//               <div className="cdms-form-column">
//                 <div className="cdms-section-title">Asset Details</div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Code</span>
//                   <input
//                     type="text"
//                     name="code"
//                     className="cdms-underline-input"
//                     value={formData.code}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Description</span>
//                   <input
//                     type="text"
//                     name="description"
//                     className="cdms-underline-input"
//                     value={formData.description}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Brand</span>
//                   <input
//                     type="text"
//                     name="brand"
//                     className="cdms-underline-input"
//                     value={formData.brand}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Model</span>
//                   <input
//                     type="text"
//                     name="model"
//                     className="cdms-underline-input"
//                     value={formData.model}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Serial No.</span>
//                   <input
//                     type="text"
//                     name="serialNo"
//                     className="cdms-underline-input"
//                     value={formData.serialNo}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Remarks</span>
//                   <input
//                     type="text"
//                     name="remarks"
//                     className="cdms-underline-input"
//                     value={formData.remarks}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Cycle</span>
//                   <select
//                     name="cycle"
//                     className="cdms-underline-input"
//                     value={formData.cycle}
//                     onChange={onChange}
//                   >
//                     <option value="1 Year">1 Year</option>
//                     <option value="2 Years">2 Years</option>
//                     <option value="6 Months">6 Months</option>
//                   </select>
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Centre</span>
//                   <input
//                     type="text"
//                     name="centre"
//                     className="cdms-underline-input"
//                     value={formData.centre}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Range</span>
//                   <input
//                     type="text"
//                     name="range"
//                     className="cdms-underline-input"
//                     value={formData.range}
//                     onChange={onChange}
//                   />
//                 </div>
//               </div>

//               {/* RIGHT COLUMN */}
//               <div className="cdms-form-column">
//                 <div className="cdms-section-title">Calibration Details</div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Standard ID</span>
//                   <input
//                     type="text"
//                     name="standardId"
//                     className="cdms-underline-input"
//                     value={formData.standardId}
//                     onChange={onChange}
//                     required
//                     placeholder="e.g. STD-0001"
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Asset No.</span>
//                   <input
//                     type="text"
//                     name="assetNo"
//                     className="cdms-underline-input"
//                     value={formData.assetNo}
//                     onChange={onChange}
//                     required
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Status</span>
//                   <select
//                     name="status"
//                     className="cdms-underline-input"
//                     value={formData.status}
//                     onChange={onChange}
//                   >
//                     <option value="Active">Active</option>
//                     <option value="Inactive">Inactive</option>
//                     <option value="Retired">Retired</option>
//                   </select>
//                 </div>

//                 <div className="cdms-field-spacer" />

//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Date Cal</span>
//                   <input
//                     type="date"
//                     name="dateCal"
//                     className="cdms-underline-input"
//                     value={formData.dateCal}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Date Due</span>
//                   <input
//                     type="date"
//                     name="dateDue"
//                     className="cdms-underline-input"
//                     value={formData.dateDue}
//                     onChange={onChange}
//                   />
//                 </div>

//                 <div className="cdms-field-spacer" />

//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Location</span>
//                   {/* <input
//                     type="text"
//                     name="location"
//                     className="cdms-underline-input"
//                     value={formData.location}
//                     onChange={onChange}
//                   /> */}
//                   <select
//                     name="location"
//                     className="cdms-underline-input"
//                     value={formData.location}
//                     onChange={onChange}
//                   >
//                     <option value="">Select Location</option>
//                     <option value="dimensional">Dimensional</option>
//                     <option value="physical metrology">
//                       Physical Metrology
//                     </option>
//                     <option value="electrical and temperature">
//                       Electrical and Temperature
//                     </option>
//                     <option value="temperature">Temperature</option>
//                   </select>
//                 </div>

//                 <div className="cdms-field-spacer" />

//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Calib Officer</span>
//                   <select
//                     name="calibOfficer"
//                     className="cdms-underline-input"
//                     value={formData.calibOfficer}
//                     onChange={onChange}
//                   >
//                     <option value="">Select Officer</option>
//                     <option value="ASR">ASR</option>
//                     <option value="RCL">RCL</option>
//                   </select>
//                 </div>

//                 {/* Calib Status now stacks above the For Calibration button
//                     so the full select text is visible */}
//                 <div className="cdms-field">
//                   <span className="cdms-field-label">Calib Status</span>
//                   <select
//                     name="calibStatus"
//                     className="cdms-underline-input"
//                     value={formData.calibStatus}
//                     onChange={onChange}
//                   >
//                     <option value="Active">Active</option>
//                     <option value="For Calibration">For Calibration</option>
//                     <option value="Expired">Expired</option>
//                   </select>
//                 </div>
//                 <button
//                   type="button"
//                   className="btn-for-calibration btn-for-calibration-stacked"
//                   onClick={onForCalibration}
//                 >
//                   For Calibration
//                 </button>
//               </div>

//               {/* IMAGE VIEWER */}
//               <div className="cdms-image-viewer">
//                 <div className="cdms-section-title">Asset Photo</div>
//                 <div className="cdms-image-frame">
//                   {displayedImage ? (
//                     <img src={displayedImage} alt="Asset" />
//                   ) : (
//                     <div className="cdms-image-placeholder">No Image</div>
//                   )}
//                 </div>
//                 {pendingPhoto && (
//                   <div className="cdms-image-pending-note">
//                     New photo — will upload on{" "}
//                     {isEditingExisting ? "Update" : "Save"}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* BOTTOM ACTIONS - all footer buttons now live together, inline */}
//             <div className="cdms-bottom-actions">
//               <button
//                 type="button"
//                 className="btn-outline"
//                 onClick={() => setIsCameraOpen(true)}
//               >
//                 Open Camera
//               </button>
//               <button
//                 type="button"
//                 className="btn-outline"
//                 onClick={handleViewFiles}
//               >
//                 View Files
//               </button>
//               <button
//                 type="button"
//                 className="btn-link"
//                 onClick={onShowAssetHistory}
//               >
//                 Show Asset History
//               </button>
//               <button
//                 type="button"
//                 className="btn-link"
//                 onClick={onModificationHistory}
//               >
//                 Modification History
//               </button>

//               {/* Only ONE of these ever shows: "Save" for a brand-new
//                   standard (Add New), "Update" for an existing one (row
//                   click). Both are type="submit" so either one triggers
//                   the same onSubmit/handleSubmit — only the label and
//                   visibility differ based on isEditingExisting. */}
//               {!isEditingExisting && (
//                 <button type="submit" className="btn-link">
//                   Save
//                 </button>
//               )}
//               {isEditingExisting && (
//                 <button type="submit" className="btn-link">
//                   Update
//                 </button>
//               )}

//               <button
//                 type="button"
//                 className="btn-link"
//                 onClick={onExit || onClose}
//               >
//                 Exit
//               </button>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: "none" }}
//               />
//             </div>
//           </div>
//         </form>

//         <CameraModal
//           isOpen={isCameraOpen}
//           onClose={() => setIsCameraOpen(false)}
//           onCapture={handlePhotoCaptured}
//         />

//         <ViewFilesModal
//           isOpen={isViewFilesOpen}
//           onClose={() => setIsViewFilesOpen(false)}
//           standardId={formData.standardId}
//         />
//       </div>
//     </div>
//   );
// };

// export default AddAssetModal;
import React, { useEffect, useRef, useState } from "react";

import "./AddAssetModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import CameraModal from "./CameraModal";
import ViewFilesModal from "./ViewFilesModal";

const AddAssetModal = ({
  isOpen,
  formData,
  onChange,
  onClose,
  onSubmit,
  onOpenCamera,
  onOpenFolder,
  onShowAssetHistory,
  onModificationHistory,
  onForCalibration,
  onExit,
  imagePreviewUrl,
  isEditingExisting,
  subtitleBottom,
}) => {
  const fileInputRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isViewFilesOpen, setIsViewFilesOpen] = useState(false);

  // Code is masked by default (used as a lookup key elsewhere — the
  // Calibration Standard search in IncomingCalibDetailsModal — not meant
  // to be read casually off the screen). Toggled via the eye button next
  // to the field, same idea as a password field's show/hide.
  const [showCode, setShowCode] = useState(false);

  // A photo the user just captured but hasn't saved yet. It only lives
  // here — { dataUrl, blob } — and is NOT written into formData, since
  // formData.photoUrl is reserved for the final Cloudinary URL. The
  // dataUrl is what gets shown in the viewer in the meantime; the blob
  // travels up to the parent on submit so it can be uploaded there.
  const [pendingPhoto, setPendingPhoto] = useState(null);

  // Reset any pending (unsaved) capture whenever the modal is (re)opened,
  // whether that's for a brand new standard or for editing an existing
  // one. Without this, a photo captured in one modal session would still
  // be sitting in state the next time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setPendingPhoto(null);
    }
  }, [isOpen]);

  // Also reset the reveal state every time the modal (re)opens, so
  // switching between standards (or opening a fresh Add New) never
  // leaves a previous standard's code sitting revealed on screen.
  useEffect(() => {
    if (isOpen) {
      setShowCode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoCaptured = ({ dataUrl, blob }) => {
    setPendingPhoto({ dataUrl, blob });
    setIsCameraOpen(false);
  };

  // Files live in Cloudinary under a folder keyed by standardId, so
  // there's nothing to show until the standard has actually been saved
  // at least once.
  const handleViewFiles = () => {
    if (!formData.standardId) {
      alert("Save this standard first before viewing its files.");
      return;
    }
    setIsViewFilesOpen(true);
  };

  // Prefer a freshly captured (not-yet-uploaded) photo, then fall back to
  // whatever photo URL is already saved on this standard, then whatever
  // preview the parent passed in.
  const displayedImage =
    pendingPhoto?.dataUrl || formData.photoUrl || imagePreviewUrl;

  // Wrap the parent's onSubmit so the pending photo's raw blob rides
  // along with the form submit event. The parent is responsible for
  // uploading it (to Cloudinary via the backend) before saving the
  // standard record.
  const handleFormSubmit = (e) => {
    onSubmit(e, pendingPhoto?.blob || null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cdms-modal" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title="CALIBRATION STANDARD INFORMATION DETAILS"
          subtitleBottom={subtitleBottom || "Asset Monitoring"}
          onClose={onClose}
        />

        <form onSubmit={handleFormSubmit}>
          <div className="cdms-modal-body">
            <div className="cdms-form-grid">
              {/* LEFT COLUMN */}
              <div className="cdms-form-column">
                <div className="cdms-section-title">Asset Details</div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Code</span>
                  <div className="cdms-input-with-toggle">
                    <input
                      type={showCode ? "text" : "password"}
                      name="code"
                      className="cdms-underline-input"
                      value={formData.code}
                      onChange={onChange}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="cdms-toggle-visibility-btn"
                      title={showCode ? "Hide code" : "Show code"}
                      onClick={() => setShowCode((prev) => !prev)}
                    >
                      {showCode ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Description</span>
                  <input
                    type="text"
                    name="description"
                    className="cdms-underline-input"
                    value={formData.description}
                    onChange={onChange}
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Brand</span>
                  <input
                    type="text"
                    name="brand"
                    className="cdms-underline-input"
                    value={formData.brand}
                    onChange={onChange}
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Model</span>
                  <input
                    type="text"
                    name="model"
                    className="cdms-underline-input"
                    value={formData.model}
                    onChange={onChange}
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Serial No.</span>
                  <input
                    type="text"
                    name="serialNo"
                    className="cdms-underline-input"
                    value={formData.serialNo}
                    onChange={onChange}
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Remarks</span>
                  <input
                    type="text"
                    name="remarks"
                    className="cdms-underline-input"
                    value={formData.remarks}
                    onChange={onChange}
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Cycle</span>
                  <select
                    name="cycle"
                    className="cdms-underline-input"
                    value={formData.cycle}
                    onChange={onChange}
                  >
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="6 Months">6 Months</option>
                  </select>
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Centre</span>
                  <input
                    type="text"
                    name="centre"
                    className="cdms-underline-input"
                    value={formData.centre}
                    onChange={onChange}
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Range</span>
                  <input
                    type="text"
                    name="range"
                    className="cdms-underline-input"
                    value={formData.range}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="cdms-form-column">
                <div className="cdms-section-title">Calibration Details</div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Standard ID</span>
                  <input
                    type="text"
                    name="standardId"
                    className="cdms-underline-input"
                    value={formData.standardId}
                    onChange={onChange}
                    required
                    placeholder="e.g. STD-0001"
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Asset No.</span>
                  <input
                    type="text"
                    name="assetNo"
                    className="cdms-underline-input"
                    value={formData.assetNo}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Status</span>
                  <select
                    name="status"
                    className="cdms-underline-input"
                    value={formData.status}
                    onChange={onChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div className="cdms-field-spacer" />

                <div className="cdms-field">
                  <span className="cdms-field-label">Date Cal</span>
                  <input
                    type="date"
                    name="dateCal"
                    className="cdms-underline-input"
                    value={formData.dateCal}
                    onChange={onChange}
                  />
                </div>
                <div className="cdms-field">
                  <span className="cdms-field-label">Date Due</span>
                  <input
                    type="date"
                    name="dateDue"
                    className="cdms-underline-input"
                    value={formData.dateDue}
                    onChange={onChange}
                  />
                </div>

                <div className="cdms-field-spacer" />

                <div className="cdms-field">
                  <span className="cdms-field-label">Location</span>
                  {/* <input
                    type="text"
                    name="location"
                    className="cdms-underline-input"
                    value={formData.location}
                    onChange={onChange}
                  /> */}
                  <select
                    name="location"
                    className="cdms-underline-input"
                    value={formData.location}
                    onChange={onChange}
                  >
                    <option value="">Select Location</option>
                    <option value="dimensional">Dimensional</option>
                    <option value="physical metrology">
                      Physical Metrology
                    </option>
                    <option value="electrical and temperature">
                      Electrical and Temperature
                    </option>
                    <option value="temperature">Temperature</option>
                  </select>
                </div>

                <div className="cdms-field-spacer" />

                <div className="cdms-field">
                  <span className="cdms-field-label">Calib Officer</span>
                  <select
                    name="calibOfficer"
                    className="cdms-underline-input"
                    value={formData.calibOfficer}
                    onChange={onChange}
                  >
                    <option value="">Select Officer</option>
                    <option value="ASR">ASR</option>
                    <option value="RCL">RCL</option>
                  </select>
                </div>

                {/* Calib Status now stacks above the For Calibration button
                    so the full select text is visible */}
                <div className="cdms-field">
                  <span className="cdms-field-label">Calib Status</span>
                  <select
                    name="calibStatus"
                    className="cdms-underline-input"
                    value={formData.calibStatus}
                    onChange={onChange}
                  >
                    <option value="Active">Active</option>
                    <option value="For Calibration">For Calibration</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="btn-for-calibration btn-for-calibration-stacked"
                  onClick={onForCalibration}
                >
                  For Calibration
                </button>
              </div>

              {/* IMAGE VIEWER */}
              <div className="cdms-image-viewer">
                <div className="cdms-section-title">Asset Photo</div>
                <div className="cdms-image-frame">
                  {displayedImage ? (
                    <img src={displayedImage} alt="Asset" />
                  ) : (
                    <div className="cdms-image-placeholder">No Image</div>
                  )}
                </div>
                {pendingPhoto && (
                  <div className="cdms-image-pending-note">
                    New photo — will upload on{" "}
                    {isEditingExisting ? "Update" : "Save"}
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM ACTIONS - all footer buttons now live together, inline */}
            <div className="cdms-bottom-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setIsCameraOpen(true)}
              >
                Open Camera
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={handleViewFiles}
              >
                View Files
              </button>
              <button
                type="button"
                className="btn-link"
                onClick={onShowAssetHistory}
              >
                Show Asset History
              </button>
              <button
                type="button"
                className="btn-link"
                onClick={onModificationHistory}
              >
                Modification History
              </button>

              {/* Only ONE of these ever shows: "Save" for a brand-new
                  standard (Add New), "Update" for an existing one (row
                  click). Both are type="submit" so either one triggers
                  the same onSubmit/handleSubmit — only the label and
                  visibility differ based on isEditingExisting. */}
              {!isEditingExisting && (
                <button type="submit" className="btn-link">
                  Save
                </button>
              )}
              {isEditingExisting && (
                <button type="submit" className="btn-link">
                  Update
                </button>
              )}

              <button
                type="button"
                className="btn-link"
                onClick={onExit || onClose}
              >
                Exit
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </form>

        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handlePhotoCaptured}
        />

        <ViewFilesModal
          isOpen={isViewFilesOpen}
          onClose={() => setIsViewFilesOpen(false)}
          standardId={formData.standardId}
        />
      </div>
    </div>
  );
};

export default AddAssetModal;
