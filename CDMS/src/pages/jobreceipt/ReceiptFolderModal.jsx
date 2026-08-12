// import React, { useEffect, useState } from "react";
// import { createPortal } from "react-dom";

// const API = import.meta.env.VITE_API_URL;

// const getCategoryLabel = (folder) => {
//   if (folder?.includes("/equipment-photos")) return "Equipment Photo";
//   if (folder?.includes("/documents")) return "Document";
//   return "File";
// };

// const isPhoto = (f) =>
//   f.folder?.includes("/equipment-photos") ||
//   /\.(jpe?g|png|gif|webp)$/i.test(f.publicId || "");

// const formatBytes = (bytes) => {
//   if (bytes === undefined || bytes === null) return "";
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// };

// // =====================
// // RECEIPT FOLDER MODAL — "Open Folder" on AddReceiptModal
// // =====================
// // Fetches the Cloudinary folder contents for every job number on this
// // receipt (in parallel) and renders them grouped under each job number,
// // reusing the same /api/uploads/job-folder/:jobNumber/files route that
// // JobFolderModal (per-job) already uses.
// //
// // Equipment photos (a job can now have several, since CameraCaptureModal
// // captures multiple shots per session) get their own thumbnail grid up
// // top per job, click-to-open-full-size. Everything else (documents, any
// // non-photo file) stays in the table below, same as before.
// const ReceiptFolderModal = ({ jobNumbers, onClose }) => {
//   const [groups, setGroups] = useState([]); // [{ jobNumber, files, error }]
//   const [loading, setLoading] = useState(true);
//   const [lightboxUrl, setLightboxUrl] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchAll = async () => {
//       setLoading(true);
//       const results = await Promise.all(
//         jobNumbers.map(async (job) => {
//           const jn = job.jobNumber;
//           try {
//             const res = await fetch(
//               `${API}/api/uploads/job-folder/${encodeURIComponent(jn)}/files`,
//             );
//             const data = await res.json();
//             return {
//               jobNumber: jn,
//               files: data.success ? data.files || [] : [],
//               error: data.success ? "" : data.message || "Failed to load.",
//             };
//           } catch (err) {
//             console.error(`Failed to fetch folder for ${jn}:`, err);
//             return { jobNumber: jn, files: [], error: "Failed to load." };
//           }
//         }),
//       );
//       if (!cancelled) {
//         setGroups(results);
//         setLoading(false);
//       }
//     };

//     if (jobNumbers?.length) fetchAll();
//     else setLoading(false);

//     return () => {
//       cancelled = true;
//     };
//   }, [jobNumbers]);

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <div
//         className="jn-modal-wrapper"
//         onClick={(e) => e.stopPropagation()}
//         style={{ maxWidth: "720px" }}
//       >
//         {/* FIXED HEADER */}
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">JOB RECEIPT FOLDER</span>
//               <span className="jr-modal-title-main">All Job Numbers</span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {/* GROUPED FILE LIST */}
//         <div className="jn-modal-scroll" style={{ padding: "16px" }}>
//           {loading && <p>Loading folder contents...</p>}

//           {!loading && groups.length === 0 && (
//             <p>No job numbers on this receipt yet.</p>
//           )}

//           {!loading &&
//             groups.map((group) => {
//               const photos = group.files.filter(isPhoto);
//               const otherFiles = group.files.filter((f) => !isPhoto(f));

//               return (
//                 <div key={group.jobNumber} style={{ marginBottom: "20px" }}>
//                   <h4 style={{ margin: "0 0 8px" }}>{group.jobNumber}</h4>

//                   {group.error && <p className="jr-error">{group.error}</p>}

//                   {!group.error && group.files.length === 0 && (
//                     <p style={{ color: "#777", margin: 0 }}>
//                       No files uploaded yet for this job number.
//                     </p>
//                   )}

//                   {/* PHOTO THUMBNAIL GRID */}
//                   {photos.length > 0 && (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexWrap: "wrap",
//                         gap: 8,
//                         marginBottom: otherFiles.length > 0 ? 12 : 0,
//                       }}
//                     >
//                       {photos.map((f) => (
//                         <button
//                           key={f.publicId}
//                           type="button"
//                           onClick={() => setLightboxUrl(f.url)}
//                           title={f.publicId.split("/").pop()}
//                           style={{
//                             padding: 0,
//                             border: "1px solid #ccc",
//                             borderRadius: 4,
//                             width: 84,
//                             height: 84,
//                             cursor: "pointer",
//                             overflow: "hidden",
//                             background: "#f4f4f2",
//                           }}
//                         >
//                           <img
//                             src={f.url}
//                             alt={f.publicId.split("/").pop()}
//                             style={{
//                               width: "100%",
//                               height: "100%",
//                               objectFit: "cover",
//                               display: "block",
//                             }}
//                           />
//                         </button>
//                       ))}
//                     </div>
//                   )}

//                   {/* NON-PHOTO FILES (documents, etc.) */}
//                   {otherFiles.length > 0 && (
//                     <table className="jr-job-table">
//                       <thead>
//                         <tr>
//                           <th>Type</th>
//                           <th>File</th>
//                           <th>Size</th>
//                           <th>Uploaded</th>
//                           <th></th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {otherFiles.map((f) => (
//                           <tr key={f.publicId}>
//                             <td>{getCategoryLabel(f.folder)}</td>
//                             <td>{f.publicId.split("/").pop()}</td>
//                             <td>{formatBytes(f.bytes)}</td>
//                             <td>
//                               {f.createdAt
//                                 ? new Date(f.createdAt).toLocaleDateString()
//                                 : ""}
//                             </td>
//                             <td>
//                               <a
//                                 href={f.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                               >
//                                 View
//                               </a>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>
//               );
//             })}
//         </div>
//       </div>

//       {/* LIGHTBOX — full-size preview of a clicked thumbnail */}
//       {lightboxUrl && (
//         <div
//           onClick={() => setLightboxUrl(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0, 0, 0, 0.75)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 2000,
//             padding: 24,
//             cursor: "zoom-out",
//           }}
//         >
//           <img
//             src={lightboxUrl}
//             alt="Full size"
//             style={{
//               maxWidth: "100%",
//               maxHeight: "100%",
//               borderRadius: 6,
//               boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
//             }}
//           />
//         </div>
//       )}
//     </div>,
//     document.body,
//   );
// };

// export default ReceiptFolderModal;
import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

// =====================
// RECEIPT FOLDER MODAL — MASTER "Open Folder" / "View Files" component
// =====================
// Originally just AddReceiptModal's "Open Folder" (fetches Cloudinary
// files for every job number on a receipt, grouped). Now the single
// shared component for ALL "show me the files for this job" surfaces
// across the app:
//   - AddReceiptModal "Open Folder"        -> jobNumbers={[...]}
//   - JobNumberModal "Open Folder"          -> jobNumber="SSS-0001-26"
//   - IncomingCalibDetailsModal "View Files"-> jobNumber + unitPhotoUrls
//     (+ optional templateVersionHistory section)
// JobFolderModal.jsx and JobFilesModal.jsx are retired — delete them and
// point their callers here instead.
//
// jobNumbers accepts either plain strings or the {jobNumber} job objects
// AddReceiptModal already has lying around; jobNumber (singular) is a
// shorthand for the one-job case so callers don't need to wrap it in an
// array.
//
// PHOTOS pulled out of each job's Cloudinary file list get their own
// thumbnail grid. Clicking one opens a lightbox with prev/next buttons
// (and arrow-key support) to browse every photo for THAT job number —
// nav is scoped per job so browsing stays predictable with multiple
// jobs shown at once.
//
// unitPhotoUrls (optional) — for callers tracking photos on local form
// state (e.g. IncomingCalibDetailsModal's photoUrls) rather than relying
// on the Cloudinary fetch below. Rendered as its own "Unit Photo"
// section with the same grid + lightbox, kept separate from the
// Cloudinary-fetched list so the two sources are never silently merged.
//
// templateVersionHistory (optional) — passthrough section, omitted
// entirely when not provided.

const getCategoryLabel = (folder) => {
  if (folder?.includes("/equipment-photos")) return "Equipment Photo";
  if (folder?.includes("/documents")) return "Document";
  return "File";
};

// resourceType is the reliable signal here — Cloudinary image uploads
// don't carry their extension in publicId (that's a separate `format`
// field returned alongside it, so a regex against publicId never
// matches), and on Dynamic Folder mode accounts the Search API's legacy
// `folder` string can come back empty/inconsistent even for files that
// really do live under .../equipment-photos/. The backend's
// job-folder/:jobNumber/files route already returns resourceType per
// file (set at upload time: "image" for equipment photos, "raw" for
// PDFs/documents/calibration-procedure templates), so check that first
// and keep the folder/extension checks only as a fallback.
const isPhoto = (f) =>
  f.resourceType === "image" ||
  f.folder?.includes("/equipment-photos") ||
  /\.(jpe?g|png|gif|webp)$/i.test(f.publicId || "");

const formatBytes = (bytes) => {
  if (bytes === undefined || bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const normalizeJobNumbers = (jobNumber, jobNumbers) => {
  if (jobNumber) return [jobNumber];
  if (!jobNumbers) return [];
  return jobNumbers
    .map((j) => (typeof j === "string" ? j : j?.jobNumber))
    .filter(Boolean);
};

// Full-size photo view with prev/next nav (click or arrow keys) + a
// counter. `photos` is scoped to whichever grid was clicked (one job's
// photos, or the unitPhotoUrls section) — never mixed across groups.
const PhotoLightbox = ({ photos, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  if (!photos.length) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 24,
        cursor: "zoom-out",
      }}
    >
      <img
        src={photos[index]}
        alt={`Photo ${index + 1} of ${photos.length}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          borderRadius: 6,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          cursor: "default",
        }}
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            title="Previous photo"
            style={{
              position: "absolute",
              top: "50%",
              left: 24,
              transform: "translateY(-50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            title="Next photo"
            style={{
              position: "absolute",
              top: "50%",
              right: 24,
              transform: "translateY(-50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            &rsaquo;
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 13,
              padding: "3px 10px",
              borderRadius: 12,
            }}
          >
            {index + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
};

// A row of clickable thumbnails; onOpen(idx) opens the lightbox at that
// position within `photos`.
const PhotoGrid = ({ photos, onOpen }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {photos.map((url, idx) => (
      <button
        key={url + idx}
        type="button"
        onClick={() => onOpen(idx)}
        title={`Photo ${idx + 1}`}
        style={{
          padding: 0,
          border: "1px solid #ccc",
          borderRadius: 4,
          width: 84,
          height: 84,
          cursor: "pointer",
          overflow: "hidden",
          background: "#f4f4f2",
        }}
      >
        <img
          src={url}
          alt={`Photo ${idx + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </button>
    ))}
  </div>
);

const ReceiptFolderModal = ({
  onClose,
  jobNumber, // single-job shorthand
  jobNumbers, // multi-job — strings or {jobNumber} objects
  title = "JOB RECEIPT FOLDER",

  // Optional local-state photo section (e.g. IncomingCalibDetailsModal's
  // form.photoUrls) shown above the Cloudinary-fetched groups.
  unitPhotoUrls,

  // Optional passthrough section, omitted entirely when not provided.
  templateVersionHistory,
  isLoadingFileHistory,
  currentTemplatePublicId,
  buildTemplateDownloadUrl,
}) => {
  const jobs = normalizeJobNumbers(jobNumber, jobNumbers);
  const isMulti = jobs.length > 1;

  const [groups, setGroups] = useState([]); // [{ jobNumber, photos, otherFiles, error }]
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { photos, startIndex }

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.all(
        jobs.map(async (jn) => {
          try {
            const res = await fetch(
              `${API}/api/uploads/job-folder/${encodeURIComponent(jn)}/files`,
            );
            const data = await res.json();
            const files = data.success ? data.files || [] : [];
            return {
              jobNumber: jn,
              photos: files.filter(isPhoto).map((f) => f.url),
              otherFiles: files.filter((f) => !isPhoto(f)),
              error: data.success ? "" : data.message || "Failed to load.",
            };
          } catch (err) {
            console.error(`Failed to fetch folder for ${jn}:`, err);
            return {
              jobNumber: jn,
              photos: [],
              otherFiles: [],
              error: "Failed to load folder contents.",
            };
          }
        }),
      );
      if (!cancelled) {
        setGroups(results);
        setLoading(false);
      }
    };

    if (jobs.length > 0) fetchAll();
    else setLoading(false);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs.join(",")]);

  return (
    <>
      {createPortal(
        <div className="jr-modal-overlay" onClick={onClose}>
          <div
            className="jn-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: isMulti ? "720px" : "640px" }}
          >
            {/* FIXED HEADER */}
            <div className="jr-modal-header">
              <div className="jr-modal-header-left">
                <div className="jr-cdms-logo">CDMS</div>
                <div className="jr-modal-title">
                  <span className="jr-modal-title-sub">{title}</span>
                  <span className="jr-modal-title-main">
                    {isMulti ? "All Job Numbers" : jobs[0] || "—"}
                  </span>
                </div>
              </div>
              <button className="jr-modal-close" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="jn-modal-scroll" style={{ padding: "16px" }}>
              {/* UNIT PHOTO — only when a caller passes locally-tracked
                  photos (e.g. IncomingCalibDetailsModal's photoUrls) */}
              {unitPhotoUrls !== undefined && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 8px" }}>Unit Photo</h4>
                  {unitPhotoUrls?.length > 0 ? (
                    <PhotoGrid
                      photos={unitPhotoUrls}
                      onOpen={(idx) =>
                        setLightbox({ photos: unitPhotoUrls, startIndex: idx })
                      }
                    />
                  ) : (
                    <p style={{ color: "#777", margin: 0 }}>
                      No photo uploaded.
                    </p>
                  )}
                </div>
              )}

              {loading && <p>Loading folder contents...</p>}

              {!loading && jobs.length === 0 && (
                <p>No job numbers to show yet.</p>
              )}

              {!loading &&
                groups.map((group) => (
                  <div key={group.jobNumber} style={{ marginBottom: "20px" }}>
                    <h4 style={{ margin: "0 0 8px" }}>
                      {isMulti ? group.jobNumber : "Job Number Files"}
                    </h4>

                    {group.error && <p className="jr-error">{group.error}</p>}

                    {!group.error &&
                      group.photos.length === 0 &&
                      group.otherFiles.length === 0 && (
                        <p style={{ color: "#777", margin: 0 }}>
                          No files uploaded yet for this job number.
                        </p>
                      )}

                    {/* PHOTO THUMBNAIL GRID */}
                    {group.photos.length > 0 && (
                      <div
                        style={{
                          marginBottom: group.otherFiles.length > 0 ? 12 : 0,
                        }}
                      >
                        <PhotoGrid
                          photos={group.photos}
                          onOpen={(idx) =>
                            setLightbox({
                              photos: group.photos,
                              startIndex: idx,
                            })
                          }
                        />
                      </div>
                    )}

                    {/* NON-PHOTO FILES (documents, etc.) */}
                    {group.otherFiles.length > 0 && (
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
                          {group.otherFiles.map((f) => (
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

              {/* CALIBRATION PROCEDURE TEMPLATE HISTORY — optional */}
              {templateVersionHistory !== undefined && (
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

                  {!isLoadingFileHistory &&
                    templateVersionHistory?.length > 0 && (
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
                                    ? new Date(
                                        version.uploadedAt,
                                      ).toLocaleDateString()
                                    : ""}
                                </td>
                                <td>
                                  {url && (
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Download
                                    </a>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {lightbox &&
        createPortal(
          <PhotoLightbox
            photos={lightbox.photos}
            startIndex={lightbox.startIndex}
            onClose={() => setLightbox(null)}
          />,
          document.body,
        )}
    </>
  );
};

export default ReceiptFolderModal;
