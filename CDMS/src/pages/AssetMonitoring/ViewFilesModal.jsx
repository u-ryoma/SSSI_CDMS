// import React, { useEffect, useState } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";

// // Groups files by the year they were uploaded to Cloudinary (created_at),
// // newest year first, newest file first within each year.
// const groupByYear = (files) => {
//   const groups = {};
//   files.forEach((file) => {
//     const year = new Date(file.createdAt).getFullYear();
//     if (!groups[year]) groups[year] = [];
//     groups[year].push(file);
//   });
//   return Object.keys(groups)
//     .sort((a, b) => b - a)
//     .map((year) => ({ year, files: groups[year] }));
// };

// const ViewFilesModal = ({ isOpen, onClose, standardId }) => {
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!isOpen || !standardId) return;

//     // Must match the folder key used at upload time in AssetMonitoring.jsx
//     // (slashes swapped for underscores, since Standard IDs can contain
//     // real slashes that would otherwise break the URL route match).
//     const folderKey = standardId.replace(/\//g, "_");

//     setLoading(true);
//     setError("");

//     fetch(`/api/uploads/standard-photo/${encodeURIComponent(folderKey)}/files`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (!data.success) {
//           throw new Error(data.message || "Failed to load files");
//         }
//         setFiles(data.files || []);
//       })
//       .catch((err) => {
//         console.error("Failed to load files:", err);
//         setError("Couldn't load files. Please try again.");
//       })
//       .finally(() => setLoading(false));
//   }, [isOpen, standardId]);

//   if (!isOpen) return null;

//   const yearGroups = groupByYear(files);

//   return (
//     <div style={styles.overlay} onClick={onClose}>
//       <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader
//           title="STANDARD FILES"
//           subtitleBottom={standardId || "View Files"}
//           onClose={onClose}
//         />

//         <div style={styles.body}>
//           {loading && <div style={styles.status}>Loading files…</div>}
//           {!loading && error && <div style={styles.status}>{error}</div>}
//           {!loading && !error && files.length === 0 && (
//             <div style={styles.status}>
//               No files uploaded yet for this standard.
//             </div>
//           )}

//           {!loading &&
//             !error &&
//             yearGroups.map(({ year, files: yearFiles }) => (
//               <div key={year} style={styles.yearSection}>
//                 <div style={styles.yearHeader}>{year}</div>
//                 <div style={styles.grid}>
//                   {yearFiles.map((file) => (
//                     <a
//                       key={file.publicId}
//                       href={file.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       style={styles.thumbLink}
//                       title={new Date(file.createdAt).toLocaleString()}
//                     >
//                       <img src={file.url} alt="" style={styles.thumb} />
//                       <span style={styles.thumbDate}>
//                         {new Date(file.createdAt).toLocaleDateString()}
//                       </span>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             ))}
//         </div>

//         <div style={styles.actions}>
//           <button type="button" style={styles.outlineBtn} onClick={onClose}>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   overlay: {
//     position: "fixed",
//     inset: 0,
//     background: "rgba(0,0,0,0.6)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 1000,
//   },
//   modal: {
//     background: "#fff",
//     borderRadius: 8,
//     width: "min(700px, 92vw)",
//     maxHeight: "85vh",
//     display: "flex",
//     flexDirection: "column",
//     overflow: "hidden",
//     boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
//   },
//   body: {
//     padding: 20,
//     overflowY: "auto",
//     flex: 1,
//   },
//   status: {
//     padding: 24,
//     textAlign: "center",
//     color: "#666",
//   },
//   yearSection: {
//     marginBottom: 24,
//   },
//   yearHeader: {
//     fontWeight: 700,
//     fontSize: 16,
//     marginBottom: 12,
//     borderBottom: "2px solid #111",
//     paddingBottom: 6,
//   },
//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
//     gap: 12,
//   },
//   thumbLink: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     textDecoration: "none",
//     color: "#333",
//   },
//   thumb: {
//     width: "100%",
//     height: 90,
//     objectFit: "cover",
//     borderRadius: 6,
//     border: "1px solid #ddd",
//   },
//   thumbDate: {
//     fontSize: 11,
//     marginTop: 4,
//   },
//   actions: {
//     display: "flex",
//     justifyContent: "flex-end",
//     padding: 12,
//     background: "#f5f5f5",
//   },
//   outlineBtn: {
//     background: "#fff",
//     color: "#111",
//     border: "1px solid #ccc",
//     borderRadius: 6,
//     padding: "8px 16px",
//     cursor: "pointer",
//     fontWeight: 500,
//   },
// };

// export default ViewFilesModal;
import React, { useEffect, useState } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";

// Groups files by the year they were uploaded to Cloudinary (created_at),
// newest year first, newest file first within each year.
const groupByYear = (files) => {
  const groups = {};
  files.forEach((file) => {
    const year = new Date(file.createdAt).getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(file);
  });
  return Object.keys(groups)
    .sort((a, b) => b - a)
    .map((year) => ({ year, files: groups[year] }));
};

// publicId comes back as the full Cloudinary path, e.g.
// "cdms/standard-photos/AST_0034/photo_1785134376394". The folder part
// is already implied by which standard's modal you're looking at, so
// only show the base name — and that base name is guaranteed to match
// Cloudinary exactly, since it IS Cloudinary's public_id, not a
// separately-tracked name that could drift out of sync.
const fileNameFromPublicId = (publicId, format) => {
  if (!publicId) return "";
  const base = publicId.split("/").pop();
  return format ? `${base}.${format}` : base;
};

const ViewFilesModal = ({ isOpen, onClose, standardId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !standardId) return;

    // Must match the folder key used at upload time in AssetMonitoring.jsx
    // (slashes swapped for underscores, since Standard IDs can contain
    // real slashes that would otherwise break the URL route match).
    const folderKey = standardId.replace(/\//g, "_");

    setLoading(true);
    setError("");

    fetch(`/api/uploads/standard-photo/${encodeURIComponent(folderKey)}/files`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load files");
        }
        setFiles(data.files || []);
      })
      .catch((err) => {
        console.error("Failed to load files:", err);
        setError("Couldn't load files. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, standardId]);

  if (!isOpen) return null;

  const yearGroups = groupByYear(files);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title="STANDARD FILES"
          subtitleBottom={standardId || "View Files"}
          onClose={onClose}
        />

        <div style={styles.body}>
          {loading && <div style={styles.status}>Loading files…</div>}
          {!loading && error && <div style={styles.status}>{error}</div>}
          {!loading && !error && files.length === 0 && (
            <div style={styles.status}>
              No files uploaded yet for this standard.
            </div>
          )}

          {!loading &&
            !error &&
            yearGroups.map(({ year, files: yearFiles }) => (
              <div key={year} style={styles.yearSection}>
                <div style={styles.yearHeader}>{year}</div>
                <div style={styles.grid}>
                  {yearFiles.map((file) => {
                    const fileName = fileNameFromPublicId(
                      file.publicId,
                      file.format,
                    );
                    return (
                      <a
                        key={file.publicId}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.thumbLink}
                        title={`${fileName} — ${new Date(
                          file.createdAt,
                        ).toLocaleString()}`}
                      >
                        <img
                          src={file.url}
                          alt={fileName}
                          style={styles.thumb}
                        />
                        <span style={styles.thumbName}>{fileName}</span>
                        <span style={styles.thumbDate}>
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        <div style={styles.actions}>
          <button type="button" style={styles.outlineBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: 8,
    width: "min(700px, 92vw)",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  body: {
    padding: 20,
    overflowY: "auto",
    flex: 1,
  },
  status: {
    padding: 24,
    textAlign: "center",
    color: "#666",
  },
  yearSection: {
    marginBottom: 24,
  },
  yearHeader: {
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 12,
    borderBottom: "2px solid #111",
    paddingBottom: 6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    gap: 12,
  },
  thumbLink: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    color: "#333",
  },
  thumb: {
    width: "100%",
    height: 90,
    objectFit: "cover",
    borderRadius: 6,
    border: "1px solid #ddd",
  },
  thumbName: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  thumbDate: {
    fontSize: 11,
    color: "#777",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    padding: 12,
    background: "#f5f5f5",
  },
  outlineBtn: {
    background: "#fff",
    color: "#111",
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 500,
  },
};

export default ViewFilesModal;
