// import React, { useState, useRef } from "react";
// import { createPortal } from "react-dom";
// import "./ForPrintFinalDetailsModal.css";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";

// const API = import.meta.env.VITE_API_URL;

// /**
//  * ForPrintFinalDetailsModal
//  *
//  * Read-only "final certificate" review screen shown when a row is
//  * clicked in PrintFinal.jsx. Layout follows the same left/mid/dates
//  * column pattern as ForCheckingSigDetailsModal, but drops the
//  * calibration-standard grid and accreditation/procedure section, and
//  * swaps the primary action for printing the final certificate.
//  *
//  * "Print Final Certificate & Print PDF File" downloads the most
//  * recently uploaded document for this job (the file Checking SIG
//  * uploaded via its own "Update" step) converted to PDF, so what gets
//  * printed is the reviewed/edited version, not a blank template.
//  *
//  * "Update" requires re-uploading a PDF backup copy (presumably the
//  * physically-signed/printed certificate, scanned back in) before it
//  * moves the job forward — same upload-then-confirm pattern
//  * ForCheckingOICDetailsModal's "Update" uses, but restricted to .pdf
//  * since this stage is specifically archiving the printed certificate.
//  *
//  * NOTE ON IMPORT PATHS: this assumes ForPrintFinalDetailsModal.jsx sits
//    flat in src/pages/OnGoingCalibration/ alongside PrintFinal.jsx, same
//    as ForCheckingSigDetailsModal.jsx. Adjust the CdmsModalHeader,
//    ConfirmDialog, and JobFolderModal import paths if your folder
//    structure differs.
//  */
// const ForPrintFinalDetailsModal = ({
//   jobForm,
//   onClose,
//   onOpenCamera,
//   onOpenFolder,
//   onPrintFinalCertificate,
//   onUpdate,
//   onLogForRetyping,
//   isUpdateEnabled = false,
// }) => {
//   // ---- Confirm dialog (same pattern as the other stage modals) ----
//   const [dialog, setDialog] = useState({
//     show: false,
//     title: "",
//     message: "",
//     onConfirm: null,
//     onCancel: null,
//     confirmLabel: "Confirm",
//     cancelLabel: "Cancel",
//     type: "default",
//   });

//   const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

//   const showConfirm = (title, message, onConfirm, type = "default") => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm,
//       onCancel: hideDialog,
//       confirmLabel: "Confirm",
//       cancelLabel: "Cancel",
//       type,
//     });
//   };

//   // Reused for plain info/error messages (single OK button, no Cancel),
//   // same shape as ForCheckingOICDetailsModal's showError.
//   const showError = (title, message) => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm: hideDialog,
//       onCancel: null,
//       confirmLabel: "OK",
//       cancelLabel: "Cancel",
//       type: "danger",
//     });
//   };

//   // --- Find + download the latest uploaded document as PDF ----------
//   // Pulls from GET /job-folder/:jobNumber/files (every file under this
//   // job's Cloudinary folder), filters to the "documents" subfolder, and
//   // takes the most recent one — same resolution ForCheckingOICDetails-
//   // Modal uses, which is exactly what Checking SIG's own "Update" step
//   // last saved there. That raw file (xlsx) is then converted server-
//   // side to PDF via GET /templates/download-pdf.
//   const [isDownloading, setIsDownloading] = useState(false);

//   const fetchLatestDocument = async () => {
//     const res = await fetch(
//       `${API}/api/uploads/job-folder/${encodeURIComponent(
//         jobForm.jobNumber,
//       )}/files`,
//     );
//     const data = await res.json().catch(() => ({}));
//     if (!res.ok || !data.success) {
//       throw new Error(
//         data.message || `Failed to list job files (${res.status})`,
//       );
//     }

//     const documents = (data.files || []).filter((f) => {
//       const segments = f.publicId?.split("/") || [];
//       return segments.includes("documents");
//     });

//     documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     return documents[0] || null;
//   };

//   const handleDownloadFinalPdf = async () => {
//     if (!jobForm.jobNumber) {
//       showError(
//         "No Job Number",
//         "This record has no job number yet, so no file can be downloaded.",
//       );
//       return false;
//     }

//     setIsDownloading(true);
//     try {
//       const doc = await fetchLatestDocument();
//       if (!doc) {
//         showError(
//           "No File Found",
//           "No uploaded document was found for this job. It may not have been submitted yet in Checking SIG.",
//         );
//         return false;
//       }

//       const filename = `${jobForm.jobNumber} - Final Certificate`;

//       const res = await fetch(
//         `${API}/api/uploads/templates/download-pdf?publicId=${encodeURIComponent(
//           doc.publicId,
//         )}&filename=${encodeURIComponent(filename)}`,
//       );
//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         throw new Error(
//           errData.message || `PDF conversion failed with ${res.status}`,
//         );
//       }

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${filename}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);

//       return true;
//     } catch (err) {
//       console.error("Failed to download final certificate PDF:", err);
//       showError(
//         "Download Failed",
//         "The final certificate could not be prepared as a PDF. Please try again.",
//       );
//       return false;
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const handlePrintFinalCertificateClick = () => {
//     showConfirm(
//       "Print Final Certificate",
//       `Are you sure you want to print the final certificate for Job Number ${jobForm.jobNumber}? This will download it as a PDF.`,
//       async () => {
//         hideDialog();
//         const downloaded = await handleDownloadFinalPdf();
//         if (downloaded) {
//           onPrintFinalCertificate?.();
//         }
//       },
//       "default",
//     );
//   };

//   // --- Update: upload the printed/signed PDF back as a backup copy --
//   // Same pattern as ForCheckingOICDetailsModal's Update: clicking opens
//   // a hidden file input first; only once that upload succeeds does the
//   // confirm dialog appear, and only confirming that calls onUpdate.
//   // Restricted to .pdf here since this stage is archiving the actual
//   // printed/signed certificate, not another editable working copy.
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const handleUpdateButtonClick = () => {
//     if (!jobForm.jobNumber) {
//       showError(
//         "No Job Number",
//         "This record has no job number yet, so a file can't be uploaded.",
//       );
//       return;
//     }
//     fileInputRef.current?.click();
//   };

//   const handleFileSelected = async (e) => {
//     const file = e.target.files?.[0];
//     e.target.value = "";
//     if (!file) return;

//     if (!file.name.toLowerCase().endsWith(".pdf")) {
//       showError(
//         "Invalid File Type",
//         "Please upload a PDF file for this backup.",
//       );
//       return;
//     }

//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await fetch(
//         `${API}/api/uploads/job-document/${encodeURIComponent(
//           jobForm.jobNumber,
//         )}`,
//         {
//           method: "POST",
//           body: formData,
//         },
//       );

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || !data.success) {
//         throw new Error(data.message || `Upload failed with ${res.status}`);
//       }

//       showConfirm(
//         "Confirm Update",
//         `Are you sure you want to update Job Number ${jobForm.jobNumber}?`,
//         () => {
//           hideDialog();
//           onUpdate?.();
//         },
//         "default",
//       );
//     } catch (err) {
//       console.error("Failed to upload PDF backup:", err);
//       showError(
//         "Upload Failed",
//         "The PDF backup could not be uploaded. Please try again.",
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleLogForRetypingClick = () => {
//     showConfirm(
//       "Log for Re-Typing",
//       `Are you sure you want to send Job Number ${jobForm.jobNumber} back for re-typing? This will return it to the typist.`,
//       () => {
//         hideDialog();
//         onLogForRetyping?.();
//       },
//       "danger",
//     );
//   };

//   const handleExitClick = () => {
//     showConfirm(
//       "Confirm Exit",
//       "Are you sure you want to exit this report?",
//       () => {
//         hideDialog();
//         onClose();
//       },
//     );
//   };

//   const [showFolder, setShowFolder] = useState(false);

//   const handleOpenFolderClick = () => {
//     onOpenFolder?.();
//     setShowFolder(true);
//   };

//   return (
//     <>
//       {createPortal(
//         <div className="pfc-modal-overlay" onClick={handleExitClick}>
//           <div
//             className="pfc-modal-wrapper"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <CdmsModalHeader
//               title="PRINT FINAL CERTIFICATE"
//               onClose={handleExitClick}
//             />

//             <div className="pfc-modal-scroll">
//               <div className="pfc-top-meta">
//                 <div className="pfc-meta-row">
//                   <label>Job Number</label>
//                   <input type="text" value={jobForm.jobNumber || ""} disabled />
//                 </div>
//                 <div className="pfc-meta-row">
//                   <label>Date Received</label>
//                   <input type="text" value={jobForm.dateRec || ""} disabled />
//                 </div>
//               </div>

//               <div className="pfc-body">
//                 <div className="pfc-col pfc-col-left">
//                   <div className="pfc-field">
//                     <label>Company</label>
//                     <textarea
//                       value={jobForm.companyName || ""}
//                       rows={2}
//                       disabled
//                     />
//                   </div>
//                   <div className="pfc-field">
//                     <label>Description</label>
//                     <div className="pfc-input-with-btn">
//                       <textarea
//                         value={jobForm.description || ""}
//                         rows={2}
//                         disabled
//                       />
//                       <button type="button" className="pfc-lookup-btn" disabled>
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="pfc-field">
//                     <label>Brand</label>
//                     <input type="text" value={jobForm.brand || ""} disabled />
//                   </div>
//                   <div className="pfc-field">
//                     <label>Model</label>
//                     <input type="text" value={jobForm.model || ""} disabled />
//                   </div>
//                   <div className="pfc-field">
//                     <label>Serial No.</label>
//                     <input
//                       type="text"
//                       value={jobForm.serialNo || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="pfc-field">
//                     <label>Remarks</label>
//                     <textarea value={jobForm.remarks || ""} rows={2} disabled />
//                   </div>
//                 </div>

//                 <div className="pfc-col pfc-col-mid">
//                   <div className="pfc-inline-field">
//                     <label>OIC</label>
//                     <input type="text" value={jobForm.oicBy || ""} disabled />
//                   </div>
//                   <div className="pfc-inline-field">
//                     <label>SIG</label>
//                     <input type="text" value={jobForm.sig || ""} disabled />
//                   </div>
//                   <div className="pfc-inline-field">
//                     <label>Frequency</label>
//                     <input
//                       type="text"
//                       value={jobForm.frequency || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="pfc-field">
//                     <label>Con Cert</label>
//                     <div className="pfc-input-with-btn">
//                       <input
//                         type="text"
//                         value={jobForm.contactCert || ""}
//                         disabled
//                       />
//                       <button type="button" className="pfc-lookup-btn" disabled>
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="pfc-field">
//                     <label>Uncertainty</label>
//                     <input
//                       type="text"
//                       value={jobForm.uncertainty || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="pfc-field">
//                     <label>Range</label>
//                     <textarea value={jobForm.range || ""} rows={2} disabled />
//                   </div>
//                   <div className="pfc-field">
//                     <label>Concern</label>
//                     <textarea value={jobForm.concern || ""} rows={3} disabled />
//                   </div>
//                 </div>

//                 <div className="pfc-col pfc-col-dates">
//                   <div className="pfc-inline-field">
//                     <label>Date Cal</label>
//                     <input type="text" value={jobForm.dateCal || ""} disabled />
//                   </div>
//                   <div className="pfc-inline-field">
//                     <label>Date Due</label>
//                     <input type="text" value={jobForm.dateDue || ""} disabled />
//                   </div>
//                   <div className="pfc-inline-field">
//                     <label>Priority</label>
//                     <input
//                       type="text"
//                       value={jobForm.priority || ""}
//                       disabled
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="pfc-camera-actions">
//                 <button type="button" onClick={onOpenCamera}>
//                   Open Camera
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleOpenFolderClick}
//                   disabled={!jobForm.jobNumber}
//                   title={
//                     !jobForm.jobNumber
//                       ? "No job number on this record yet"
//                       : undefined
//                   }
//                   style={
//                     !jobForm.jobNumber
//                       ? { opacity: 0.5, cursor: "not-allowed" }
//                       : {}
//                   }
//                 >
//                   Open Folder
//                 </button>
//               </div>

//               {/* FOOTER ACTIONS */}
//               <div className="pfc-footer">
//                 <div className="pfc-footer-row">
//                   <button
//                     type="button"
//                     className="pfc-primary-btn"
//                     onClick={handlePrintFinalCertificateClick}
//                     disabled={isDownloading}
//                     title="Downloads the latest uploaded document as a PDF, then unlocks Update"
//                   >
//                     {isDownloading
//                       ? "Preparing PDF..."
//                       : "Print Final Certificate & Print PDF File"}
//                   </button>

//                   {/* Hidden file input — opened by the visible Update
//                       button below via fileInputRef. */}
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileSelected}
//                     accept=".pdf"
//                     style={{ display: "none" }}
//                   />
//                   <button
//                     type="button"
//                     onClick={handleUpdateButtonClick}
//                     disabled={!isUpdateEnabled || isUploading}
//                     title="Upload the printed/signed PDF as a backup, then confirm to update"
//                   >
//                     {isUploading ? "Uploading..." : "Update"}
//                   </button>
//                   <button type="button" onClick={handleExitClick}>
//                     Exit
//                   </button>
//                 </div>
//                 <div className="pfc-footer-row pfc-footer-row-secondary">
//                   <button type="button" onClick={handleLogForRetypingClick}>
//                     Log for Re-Typing
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {dialog.show && (
//             <ConfirmDialog
//               title={dialog.title}
//               message={dialog.message}
//               onConfirm={dialog.onConfirm}
//               onCancel={dialog.onCancel}
//               confirmLabel={dialog.confirmLabel}
//               cancelLabel={dialog.cancelLabel}
//               type={dialog.type}
//             />
//           )}
//         </div>,
//         document.body,
//       )}

//       {showFolder && jobForm.jobNumber && (
//         <ReceiptFolderModal
//           jobNumber={jobForm.jobNumber}
//           onClose={() => setShowFolder(false)}
//         />
//       )}
//     </>
//   );
// };

// export default ForPrintFinalDetailsModal;
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./ForPrintFinalDetailsModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// Adjust this path to wherever CameraCaptureModal actually lives in your
// tree (same component the other stage modals use).
import CameraCaptureModal from "../jobreceipt/CameraCaptureModal";

const API = import.meta.env.VITE_API_URL;

// Converts a base64 dataURL (what CameraCaptureModal produces, from
// either canvas.toDataURL or FileReader.readAsDataURL) into a Blob, so it
// can be sent as multipart/form-data to the equipment-photo upload route.
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return res.blob();
};

/**
 * ForPrintFinalDetailsModal
 *
 * Read-only "final certificate" review screen shown when a row is
 * clicked in PrintFinal.jsx. Layout follows the same left/mid/dates
 * column pattern as ForCheckingSigDetailsModal, but drops the
 * calibration-standard grid and accreditation/procedure section, and
 * swaps the primary action for printing the final certificate.
 *
 * "Print Final Certificate & Print PDF File" downloads the most
 * recently uploaded document for this job (the file Checking SIG
 * uploaded via its own "Update" step) converted to PDF, so what gets
 * printed is the reviewed/edited version, not a blank template.
 *
 * "Update" requires re-uploading a PDF backup copy (presumably the
 * physically-signed/printed certificate, scanned back in) before it
 * moves the job forward — same upload-then-confirm pattern
 * ForCheckingOICDetailsModal's "Update" uses, but restricted to .pdf
 * since this stage is specifically archiving the printed certificate.
 *
 * NOTE ON IMPORT PATHS: this assumes ForPrintFinalDetailsModal.jsx sits
   flat in src/pages/OnGoingCalibration/ alongside PrintFinal.jsx, same
   as ForCheckingSigDetailsModal.jsx. Adjust the CdmsModalHeader,
   ConfirmDialog, and JobFolderModal import paths if your folder
   structure differs.
 */
const ForPrintFinalDetailsModal = ({
  jobForm,
  onClose,
  onOpenCamera,
  onOpenFolder,
  onPrintFinalCertificate,
  onUpdate,
  onLogForRetyping,
  isUpdateEnabled = false,
}) => {
  // ---- Confirm dialog (same pattern as the other stage modals) ----
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

  // Reused for plain info/error messages (single OK button, no Cancel),
  // same shape as ForCheckingOICDetailsModal's showError.
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

  // --- Find + download the latest uploaded document as PDF ----------
  // Pulls from GET /job-folder/:jobNumber/files (every file under this
  // job's Cloudinary folder), filters to the "documents" subfolder, and
  // takes the most recent one — same resolution ForCheckingOICDetails-
  // Modal uses, which is exactly what Checking SIG's own "Update" step
  // last saved there. That raw file (xlsx) is then converted server-
  // side to PDF via GET /templates/download-pdf.
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchLatestDocument = async () => {
    const res = await fetch(
      `${API}/api/uploads/job-folder/${encodeURIComponent(
        jobForm.jobNumber,
      )}/files`,
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(
        data.message || `Failed to list job files (${res.status})`,
      );
    }

    const documents = (data.files || []).filter((f) => {
      const segments = f.publicId?.split("/") || [];
      return segments.includes("documents");
    });

    documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return documents[0] || null;
  };

  const handleDownloadFinalPdf = async () => {
    if (!jobForm.jobNumber) {
      showError(
        "No Job Number",
        "This record has no job number yet, so no file can be downloaded.",
      );
      return false;
    }

    setIsDownloading(true);
    try {
      const doc = await fetchLatestDocument();
      if (!doc) {
        showError(
          "No File Found",
          "No uploaded document was found for this job. It may not have been submitted yet in Checking SIG.",
        );
        return false;
      }

      const filename = `${jobForm.jobNumber} - Final Certificate`;

      const res = await fetch(
        `${API}/api/uploads/templates/download-pdf?publicId=${encodeURIComponent(
          doc.publicId,
        )}&filename=${encodeURIComponent(filename)}`,
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || `PDF conversion failed with ${res.status}`,
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error("Failed to download final certificate PDF:", err);
      showError(
        "Download Failed",
        "The final certificate could not be prepared as a PDF. Please try again.",
      );
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintFinalCertificateClick = () => {
    showConfirm(
      "Print Final Certificate",
      `Are you sure you want to print the final certificate for Job Number ${jobForm.jobNumber}? This will download it as a PDF.`,
      async () => {
        hideDialog();
        const downloaded = await handleDownloadFinalPdf();
        if (downloaded) {
          onPrintFinalCertificate?.();
        }
      },
      "default",
    );
  };

  // --- Update: upload the printed/signed PDF back as a backup copy --
  // Same pattern as ForCheckingOICDetailsModal's Update: clicking opens
  // a hidden file input first; only once that upload succeeds does the
  // confirm dialog appear, and only confirming that calls onUpdate.
  // Restricted to .pdf here since this stage is archiving the actual
  // printed/signed certificate, not another editable working copy.
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpdateButtonClick = () => {
    if (!jobForm.jobNumber) {
      showError(
        "No Job Number",
        "This record has no job number yet, so a file can't be uploaded.",
      );
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showError(
        "Invalid File Type",
        "Please upload a PDF file for this backup.",
      );
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${API}/api/uploads/job-document/${encodeURIComponent(
          jobForm.jobNumber,
        )}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Upload failed with ${res.status}`);
      }

      showConfirm(
        "Confirm Update",
        `Are you sure you want to update Job Number ${jobForm.jobNumber}?`,
        () => {
          hideDialog();
          onUpdate?.();
        },
        "default",
      );
    } catch (err) {
      console.error("Failed to upload PDF backup:", err);
      showError(
        "Upload Failed",
        "The PDF backup could not be uploaded. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogForRetypingClick = () => {
    showConfirm(
      "Log for Re-Typing",
      `Are you sure you want to send Job Number ${jobForm.jobNumber} back for re-typing? This will return it to the typist.`,
      () => {
        hideDialog();
        onLogForRetyping?.();
      },
      "danger",
    );
  };

  const handleExitClick = () => {
    showConfirm(
      "Confirm Exit",
      "Are you sure you want to exit this report?",
      () => {
        hideDialog();
        onClose();
      },
    );
  };

  const [showFolder, setShowFolder] = useState(false);

  const handleOpenFolderClick = () => {
    onOpenFolder?.();
    setShowFolder(true);
  };

  // --- Equipment photo capture ---------------------------------------
  // Same pattern as ForCheckingSigDetailsModal: this modal owns the full
  // open -> capture -> upload chain itself instead of leaving it to the
  // parent. onOpenCamera is still called first, if passed, purely so a
  // parent that wants to know "camera was opened" (e.g. for logging)
  // still can. No local photoUrls array is kept here — this screen has
  // no photo carousel of its own, captured photos are only ever viewed
  // via "Open Folder" above.
  const [showCamera, setShowCamera] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const handleOpenCameraClick = () => {
    onOpenCamera?.();

    if (!jobForm.jobNumber) {
      showError(
        "No Job Number",
        "This record has no job number yet, so a photo can't be saved.",
      );
      return;
    }
    setShowCamera(true);
  };

  const handleCameraCapture = async (photos) => {
    setShowCamera(false);
    if (!photos || photos.length === 0) return;

    setIsUploadingPhotos(true);
    try {
      for (const dataUrl of photos) {
        const blob = await dataUrlToBlob(dataUrl);
        const formData = new FormData();
        formData.append("photo", blob, `photo_${Date.now()}.jpg`);

        const res = await fetch(
          `${API}/api/uploads/equipment-photo/${encodeURIComponent(
            jobForm.jobNumber,
          )}`,
          { method: "POST", body: formData },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data?.message || "Photo upload failed");
        }
      }
    } catch (err) {
      console.error("Failed to upload captured photo(s):", err);
      showError(
        "Upload Failed",
        "One or more captured photos could not be saved. Please try taking the photo again.",
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  return (
    <>
      {createPortal(
        <div className="pfc-modal-overlay" onClick={handleExitClick}>
          <div
            className="pfc-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <CdmsModalHeader
              title="PRINT FINAL CERTIFICATE"
              onClose={handleExitClick}
            />

            <div className="pfc-modal-scroll">
              <div className="pfc-top-meta">
                <div className="pfc-meta-row">
                  <label>Job Number</label>
                  <input type="text" value={jobForm.jobNumber || ""} disabled />
                </div>
                <div className="pfc-meta-row">
                  <label>Date Received</label>
                  <input type="text" value={jobForm.dateRec || ""} disabled />
                </div>
              </div>

              <div className="pfc-body">
                <div className="pfc-col pfc-col-left">
                  <div className="pfc-field">
                    <label>Company</label>
                    <textarea
                      value={jobForm.companyName || ""}
                      rows={2}
                      disabled
                    />
                  </div>
                  <div className="pfc-field">
                    <label>Description</label>
                    <div className="pfc-input-with-btn">
                      <textarea
                        value={jobForm.description || ""}
                        rows={2}
                        disabled
                      />
                      <button type="button" className="pfc-lookup-btn" disabled>
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="pfc-field">
                    <label>Brand</label>
                    <input type="text" value={jobForm.brand || ""} disabled />
                  </div>
                  <div className="pfc-field">
                    <label>Model</label>
                    <input type="text" value={jobForm.model || ""} disabled />
                  </div>
                  <div className="pfc-field">
                    <label>Serial No.</label>
                    <input
                      type="text"
                      value={jobForm.serialNo || ""}
                      disabled
                    />
                  </div>
                  <div className="pfc-field">
                    <label>Remarks</label>
                    <textarea value={jobForm.remarks || ""} rows={2} disabled />
                  </div>
                </div>

                <div className="pfc-col pfc-col-mid">
                  <div className="pfc-inline-field">
                    <label>OIC</label>
                    <input type="text" value={jobForm.oicBy || ""} disabled />
                  </div>
                  <div className="pfc-inline-field">
                    <label>SIG</label>
                    <input type="text" value={jobForm.sig || ""} disabled />
                  </div>
                  <div className="pfc-inline-field">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={jobForm.frequency || ""}
                      disabled
                    />
                  </div>
                  <div className="pfc-field">
                    <label>Con Cert</label>
                    <div className="pfc-input-with-btn">
                      <input
                        type="text"
                        value={jobForm.contactCert || ""}
                        disabled
                      />
                      <button type="button" className="pfc-lookup-btn" disabled>
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="pfc-field">
                    <label>Uncertainty</label>
                    <input
                      type="text"
                      value={jobForm.uncertainty || ""}
                      disabled
                    />
                  </div>
                  <div className="pfc-field">
                    <label>Range</label>
                    <textarea value={jobForm.range || ""} rows={2} disabled />
                  </div>
                  <div className="pfc-field">
                    <label>Concern</label>
                    <textarea value={jobForm.concern || ""} rows={3} disabled />
                  </div>
                </div>

                <div className="pfc-col pfc-col-dates">
                  <div className="pfc-inline-field">
                    <label>Date Cal</label>
                    <input type="text" value={jobForm.dateCal || ""} disabled />
                  </div>
                  <div className="pfc-inline-field">
                    <label>Date Due</label>
                    <input type="text" value={jobForm.dateDue || ""} disabled />
                  </div>
                  <div className="pfc-inline-field">
                    <label>Priority</label>
                    <input
                      type="text"
                      value={jobForm.priority || ""}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="pfc-camera-actions">
                <button
                  type="button"
                  onClick={handleOpenCameraClick}
                  disabled={isUploadingPhotos}
                >
                  {isUploadingPhotos ? "Saving Photo..." : "Open Camera"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenFolderClick}
                  disabled={!jobForm.jobNumber}
                  title={
                    !jobForm.jobNumber
                      ? "No job number on this record yet"
                      : undefined
                  }
                  style={
                    !jobForm.jobNumber
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  Open Folder
                </button>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pfc-footer">
                <div className="pfc-footer-row">
                  <button
                    type="button"
                    className="pfc-primary-btn"
                    onClick={handlePrintFinalCertificateClick}
                    disabled={isDownloading}
                    title="Downloads the latest uploaded document as a PDF, then unlocks Update"
                  >
                    {isDownloading
                      ? "Preparing PDF..."
                      : "Print Final Certificate & Print PDF File"}
                  </button>

                  {/* Hidden file input — opened by the visible Update
                      button below via fileInputRef. */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    accept=".pdf"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={handleUpdateButtonClick}
                    disabled={!isUpdateEnabled || isUploading}
                    title="Upload the printed/signed PDF as a backup, then confirm to update"
                  >
                    {isUploading ? "Uploading..." : "Update"}
                  </button>
                  <button type="button" onClick={handleExitClick}>
                    Exit
                  </button>
                </div>
                <div className="pfc-footer-row pfc-footer-row-secondary">
                  <button type="button" onClick={handleLogForRetypingClick}>
                    Log for Re-Typing
                  </button>
                </div>
              </div>
            </div>
          </div>

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
        </div>,
        document.body,
      )}

      {showFolder && jobForm.jobNumber && (
        <ReceiptFolderModal
          jobNumber={jobForm.jobNumber}
          onClose={() => setShowFolder(false)}
        />
      )}

      {/* CAMERA MODAL — captures 1+ photos, each uploaded straight to
          this job's Cloudinary equipment-photos folder on capture (see
          handleCameraCapture above). Nothing here needs to hold onto
          the returned URLs locally since this screen has no photo
          carousel of its own — captured photos are visible afterward
          via "Open Folder" above. */}
      {showCamera && (
        <CameraCaptureModal
          onClose={handleCameraClose}
          onCapture={handleCameraCapture}
          contextLabel={jobForm.jobNumber}
        />
      )}
    </>
  );
};

export default ForPrintFinalDetailsModal;
