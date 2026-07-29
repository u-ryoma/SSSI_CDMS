// import React, { useMemo, useState } from "react";
// import { createPortal } from "react-dom";
// import "./CalibrationProcedureLookupModal.css";
// import CdmsModalHeader from "./CdmsModalHeader";

// const TEMPLATE_LIST = [
//   {
//     code: "CP-TEMP-001",
//     name: "General Calibration Procedure Template",
//     fileUrl: "/templates/general-calibration-procedure.docx",
//   },
//   {
//     code: "CP-TEMP-002",
//     name: "Dimensional Calibration Procedure Template",
//     fileUrl: "/templates/dimensional-calibration-procedure.docx",
//   },
//   {
//     code: "CP-TEMP-003",
//     name: "Electrical Calibration Procedure Template",
//     fileUrl: "/templates/electrical-calibration-procedure.docx",
//   },
// ];

// const CalibrationProcedureLookupModal = ({
//   onCancel,
//   onSelectTemplate,
//   templates = TEMPLATE_LIST,
// }) => {
//   const [search, setSearch] = useState("");

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return templates;
//     return templates.filter(
//       (t) =>
//         t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q),
//     );
//   }, [search, templates]);

//   const handleDownload = (e, template) => {
//     e.stopPropagation();
//   };

//   return createPortal(
//     <div className="cpl-modal-overlay" onClick={onCancel}>
//       <div className="cpl-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader
//           title="CALIBRATION PROCEDURE TEMPLATES"
//           onClose={onCancel}
//         />

//         <div className="cpl-modal-body">
//           <input
//             type="text"
//             className="cpl-search-input"
//             placeholder="Search templates..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             autoFocus
//           />

//           <div className="cpl-template-list">
//             {filtered.length === 0 && (
//               <div className="cpl-empty-state">No templates found.</div>
//             )}

//             {filtered.map((template) => (
//               <div
//                 key={template.code}
//                 className="cpl-template-row"
//                 onClick={() => onSelectTemplate?.(template)}
//               >
//                 <div className="cpl-template-info">
//                   <div className="cpl-template-name">{template.name}</div>
//                   <div className="cpl-template-code">{template.code}</div>
//                 </div>

//                 <a
//                   href={template.fileUrl}
//                   download
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="cpl-download-btn"
//                   onClick={(e) => handleDownload(e, template)}
//                   title="Download template"
//                 >
//                   ⬇ Download
//                 </a>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="cpl-modal-footer">
//           <button type="button" onClick={onCancel}>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default CalibrationProcedureLookupModal;
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./CalibrationProcedureLookUpModal.css";
import CdmsModalHeader from "./CdmsModalHeader";

/**
 * CalibrationProcedureLookupModal
 *
 * Lists calibration procedure templates fetched from the
 * "cdms/templates-for-calibration" Cloudinary folder (via
 * GET /api/uploads/templates), lets the user search/filter them by
 * name or code, and pick one to hand back via onSelectTemplate.
 *
 * A `templates` prop can still be passed in directly (e.g. for tests or
 * a cached list) to skip the internal fetch.
 */
const CalibrationProcedureLookupModal = ({
  onCancel,
  onSelectTemplate,
  templates: templatesProp,
}) => {
  const [search, setSearch] = useState("");

  const [fetchedTemplates, setFetchedTemplates] = useState([]);
  const [loading, setLoading] = useState(!templatesProp);
  const [loadError, setLoadError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/uploads/templates");
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to load templates");
      }
      setFetchedTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch (err) {
      console.error("Failed to load calibration procedure templates:", err);
      setFetchedTemplates([]);
      setLoadError("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!templatesProp) {
      fetchTemplates();
    }
  }, [templatesProp, fetchTemplates]);

  const templates = templatesProp || fetchedTemplates;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) || t.code?.toLowerCase().includes(q),
    );
  }, [search, templates]);

  const handleRowSelect = (template) => {
    onSelectTemplate?.(template);
  };

  return createPortal(
    <div className="cpl-modal-overlay" onClick={onCancel}>
      <div className="cpl-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title="CALIBRATION PROCEDURE TEMPLATES"
          onClose={onCancel}
        />

        <div className="cpl-modal-body">
          <input
            type="text"
            className="cpl-search-input"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <div className="cpl-template-list">
            {loading ? (
              <div className="cpl-empty-state">Loading templates...</div>
            ) : loadError ? (
              <div className="cpl-empty-state">
                {loadError}{" "}
                <button type="button" onClick={fetchTemplates}>
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="cpl-empty-state">No templates found.</div>
            ) : (
              filtered.map((template) => (
                <div
                  key={template.publicId || template.code}
                  className="cpl-template-row"
                  onClick={() => handleRowSelect(template)}
                >
                  <div className="cpl-template-info">
                    <div className="cpl-template-name">{template.name}</div>
                    <div className="cpl-template-code">{template.code}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cpl-modal-footer">
          <button type="button" onClick={onCancel}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CalibrationProcedureLookupModal;
