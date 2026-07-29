import React from "react";
import { createPortal } from "react-dom";

// Same folder -> label mapping JobFolderModal.jsx uses, so labeling
// stays consistent wherever job files are listed across the app.
const getCategoryLabel = (folder) => {
  if (folder?.includes("/equipment-photos")) return "Equipment Photo";
  if (folder?.includes("/documents")) return "Document";
  return "File";
};

const formatBytes = (bytes) => {
  if (bytes === undefined || bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// =====================
// JOB FILES MODAL — "View Files" on IncomingCalibDetailsModal
// =====================
// Same visual design as JobFolderModal.jsx's standalone "Open Folder"
// (jr-modal-overlay / jn-modal-wrapper / jr-job-table), extended with
// two extra sections specific to this screen: the unit photo, and the
// calibration procedure template's version history. The middle section
// — "Job Number Files" — shows exactly what JobFolderModal shows
// elsewhere in the app (equipment photos + documents from Cloudinary),
// so the two "view everything for this job number" surfaces look and
// behave the same way.
const JobFilesModal = ({
  jobNumber,
  onClose,

  photoUrl,

  jobFiles,
  isLoadingJobFiles,
  jobFilesError,

  templateVersionHistory,
  isLoadingFileHistory,
  currentTemplatePublicId,
  buildTemplateDownloadUrl,
}) => {
  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <div
        className="jn-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "640px" }}
      >
        {/* FIXED HEADER */}
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">JOB FILES</span>
              <span className="jr-modal-title-main">{jobNumber}</span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="jn-modal-scroll" style={{ padding: "16px" }}>
          {/* UNIT PHOTO */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 8px" }}>Unit Photo</h4>
            {photoUrl ? (
              <a href={photoUrl} target="_blank" rel="noopener noreferrer">
                View Photo
              </a>
            ) : (
              <p style={{ color: "#777", margin: 0 }}>No photo uploaded.</p>
            )}
          </div>

          {/* JOB NUMBER FILES — equipment photos + documents, same data
              as the standalone JobFolderModal "Open Folder" view. */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 8px" }}>Job Number Files</h4>

            {isLoadingJobFiles && <p>Loading folder contents...</p>}

            {!isLoadingJobFiles && jobFilesError && (
              <p className="jr-error">{jobFilesError}</p>
            )}

            {!isLoadingJobFiles &&
              !jobFilesError &&
              (jobFiles?.length ?? 0) === 0 && (
                <p style={{ color: "#777", margin: 0 }}>
                  No files uploaded yet for this job number.
                </p>
              )}

            {!isLoadingJobFiles && !jobFilesError && jobFiles?.length > 0 && (
              <table className="jr-job-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>File</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobFiles.map((f) => (
                    <tr key={f.publicId}>
                      <td>{getCategoryLabel(f.folder)}</td>
                      <td>{f.publicId.split("/").pop()}</td>
                      <td>{formatBytes(f.bytes)}</td>
                      <td>
                        {f.createdAt
                          ? new Date(f.createdAt).toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* CALIBRATION PROCEDURE TEMPLATE HISTORY */}
          <div>
            <h4 style={{ margin: "0 0 8px" }}>
              Calibration Procedure Template History
            </h4>

            {isLoadingFileHistory && <p>Loading...</p>}

            {!isLoadingFileHistory &&
              (templateVersionHistory?.length ?? 0) === 0 && (
                <p style={{ color: "#777", margin: 0 }}>
                  No uploaded versions found for this template yet.
                </p>
              )}

            {!isLoadingFileHistory && templateVersionHistory?.length > 0 && (
              <table className="jr-job-table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Uploaded By</th>
                    <th>Uploaded</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {templateVersionHistory.map((version, idx) => {
                    const url = buildTemplateDownloadUrl?.(version);
                    const isCurrent =
                      version.publicId === currentTemplatePublicId;
                    return (
                      <tr key={version.publicId || idx}>
                        <td>
                          v
                          {version.version ??
                            templateVersionHistory.length - idx}
                          {isCurrent ? " (current)" : ""}
                        </td>
                        <td>{version.uploadedBy || "—"}</td>
                        <td>
                          {version.uploadedAt
                            ? new Date(version.uploadedAt).toLocaleDateString()
                            : ""}
                        </td>
                        <td>{url && <a href={url}>Download</a>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default JobFilesModal;
