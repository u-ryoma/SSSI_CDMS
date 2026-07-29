import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

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
// RECEIPT FOLDER MODAL — "Open Folder" on AddReceiptModal
// =====================
// Fetches the Cloudinary folder contents for every job number on this
// receipt (in parallel) and renders them grouped under each job number,
// reusing the same /api/uploads/job-folder/:jobNumber/files route that
// JobFolderModal (per-job) already uses.
const ReceiptFolderModal = ({ jobNumbers, onClose }) => {
  const [groups, setGroups] = useState([]); // [{ jobNumber, files, error }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.all(
        jobNumbers.map(async (job) => {
          const jn = job.jobNumber;
          try {
            const res = await fetch(
              `${API}/api/uploads/job-folder/${encodeURIComponent(jn)}/files`,
            );
            const data = await res.json();
            return {
              jobNumber: jn,
              files: data.success ? data.files || [] : [],
              error: data.success ? "" : data.message || "Failed to load.",
            };
          } catch (err) {
            console.error(`Failed to fetch folder for ${jn}:`, err);
            return { jobNumber: jn, files: [], error: "Failed to load." };
          }
        }),
      );
      if (!cancelled) {
        setGroups(results);
        setLoading(false);
      }
    };

    if (jobNumbers?.length) fetchAll();
    else setLoading(false);

    return () => {
      cancelled = true;
    };
  }, [jobNumbers]);

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <div
        className="jn-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px" }}
      >
        {/* FIXED HEADER */}
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">JOB RECEIPT FOLDER</span>
              <span className="jr-modal-title-main">All Job Numbers</span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* GROUPED FILE LIST */}
        <div className="jn-modal-scroll" style={{ padding: "16px" }}>
          {loading && <p>Loading folder contents...</p>}

          {!loading && groups.length === 0 && (
            <p>No job numbers on this receipt yet.</p>
          )}

          {!loading &&
            groups.map((group) => (
              <div key={group.jobNumber} style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 8px" }}>{group.jobNumber}</h4>

                {group.error && <p className="jr-error">{group.error}</p>}

                {!group.error && group.files.length === 0 && (
                  <p style={{ color: "#777", margin: 0 }}>
                    No files uploaded yet for this job number.
                  </p>
                )}

                {!group.error && group.files.length > 0 && (
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
                      {group.files.map((f) => (
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
            ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReceiptFolderModal;
