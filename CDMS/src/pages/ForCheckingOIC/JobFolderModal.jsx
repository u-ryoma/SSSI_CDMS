import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

// Maps a Cloudinary resource's subfolder to a simple display label —
// falls back to a generic "File" label for anything added outside this
// app's own upload routes (e.g. dragged in manually via the console).
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
// JOB FOLDER MODAL — "Open Folder" contents (ForCheckingOIC)
// =====================
// Lists every file Cloudinary has under cdms/job-numbers/<jobNumber>/**
// (both equipment-photos and documents subfolders), fetched fresh every
// time the modal opens so it always reflects what's actually in
// Cloudinary, not a stale local cache. Purely a viewer — uploads happen
// elsewhere (Open Camera / Upload PDF), not here.
//
// Same component/design as the JobFolderModal used by JobNumberModal
// and ForTypingDetailsModal — kept as its own file here since this
// folder (ForCheckingOIC) isn't guaranteed to share a directory with
// those. If it turns out this folder CAN already import one of those
// via a relative path, delete this duplicate and point the import
// there instead — two copies drifting out of sync is worse than one
// shared file.
const JobFolderModal = ({ jobNumber, onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchFiles = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API}/api/uploads/job-folder/${encodeURIComponent(jobNumber)}/files`,
        );
        const data = await res.json();
        if (!cancelled) {
          if (data.success) {
            setFiles(data.files || []);
          } else {
            setError(data.message || "Failed to load folder contents.");
          }
        }
      } catch (err) {
        console.error("Failed to fetch job folder files:", err);
        if (!cancelled) {
          setError("Failed to load folder contents.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (jobNumber) fetchFiles();

    return () => {
      cancelled = true;
    };
  }, [jobNumber]);

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
              <span className="jr-modal-title-sub">JOB FOLDER</span>
              <span className="jr-modal-title-main">{jobNumber}</span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* FILE LIST */}
        <div className="jn-modal-scroll" style={{ padding: "16px" }}>
          {loading && <p>Loading folder contents...</p>}

          {!loading && error && <p className="jr-error">{error}</p>}

          {!loading && !error && files.length === 0 && (
            <p>No files uploaded yet for this job number.</p>
          )}

          {!loading && !error && files.length > 0 && (
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
                {files.map((f) => (
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
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default JobFolderModal;
