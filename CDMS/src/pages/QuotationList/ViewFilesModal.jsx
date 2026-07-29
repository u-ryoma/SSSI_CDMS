import React from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import "./ViewFilesModal.css";

/**
 * ViewFilesModal
 *
 * Read-only modal that lists whichever files AddQuotationModal already
 * has in local state (staff template, client proof), styled as a
 * year-grouped grid of file cards — icon, filename, bold label, date —
 * matching the "Standard Files" look used elsewhere in the app. No
 * fetch involved: the parent passes in the same file data it already
 * has, this just presents it differently.
 *
 * Props:
 * - quotationId: shown as the subtitle under the modal title (assumes
 *   CdmsModalHeader accepts an optional `subtitle` prop — if it
 *   doesn't render, CdmsModalHeader needs that support added).
 * - files: array of { label, name, url, date? }
 *     - label: short bold caption (e.g. "Quotation Template")
 *     - name: the actual filename
 *     - url: Cloudinary link
 *     - date: optional ISO/date string used to group by year; files
 *       without a date fall into an "Undated" group.
 * - onClose: closes the modal
 */

const FILE_ICONS = {
  pdf: "📕",
  doc: "📄",
  docx: "📄",
  xls: "📊",
  xlsx: "📊",
  csv: "📊",
};

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

const getExtension = (name = "") => {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx + 1).toLowerCase();
};

const FileIcon = ({ name, url }) => {
  const ext = getExtension(name);
  if (IMAGE_EXTS.includes(ext)) {
    return (
      <div className="vfm-icon-box">
        <img src={url} alt={name} />
      </div>
    );
  }
  return <div className="vfm-icon-box">{FILE_ICONS[ext] || "📁"}</div>;
};

// Groups files by the year portion of their `date` field (falls back to
// "Undated" when no date is provided), then sorts groups newest-first.
const groupByYear = (files) => {
  const groups = {};
  files.forEach((f) => {
    const year = f.date ? new Date(f.date).getFullYear() : "Undated";
    if (!groups[year]) groups[year] = [];
    groups[year].push(f);
  });
  return Object.keys(groups)
    .sort((a, b) => (b === "Undated" ? -1 : a === "Undated" ? 1 : b - a))
    .map((year) => ({ year, files: groups[year] }));
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const ViewFilesModal = ({ quotationId, files = [], onClose }) => {
  const yearGroups = groupByYear(files);

  return (
    <div className="cdms-overlay" role="dialog" aria-modal="true">
      <div className="cdms-modal cdms-modal-small">
        <CdmsModalHeader
          title="STANDARD FILES"
          subtitle={quotationId}
          onClose={onClose}
        />

        <div className="vfm-body">
          {yearGroups.length === 0 ? (
            <div className="vfm-empty">
              No files attached to this quotation yet.
            </div>
          ) : (
            yearGroups.map((group) => (
              <div className="vfm-year-group" key={group.year}>
                <h3 className="vfm-year-header">{group.year}</h3>
                <hr className="vfm-divider" />
                <div className="vfm-grid">
                  {group.files.map((f) => (
                    <a
                      key={f.url}
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="vfm-card"
                    >
                      <FileIcon name={f.name} url={f.url} />
                      <div className="vfm-filename">{f.name}</div>
                      <div className="vfm-label">{f.label}</div>
                      {formatDate(f.date) && (
                        <div className="vfm-date">{formatDate(f.date)}</div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cdms-modal-footer">
          <div className="cdms-footer-right">
            <button className="cdms-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFilesModal;
