import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// -----------------------------------------------------------------------
// ImageLightbox: full-screen zoom, opened by clicking the main preview.
// -----------------------------------------------------------------------
const ImageLightbox = ({ images, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const goNext = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, onClose]);

  if (!images.length) return null;

  return createPortal(
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        ✕
      </button>

      {images.length > 1 && (
        <button
          className="lightbox-nav lightbox-prev"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        >
          ‹
        </button>
      )}

      <img
        className="lightbox-image"
        src={images[index]}
        alt={`Job image ${index + 1} of ${images.length}`}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          className="lightbox-nav lightbox-next"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        >
          ›
        </button>
      )}

      {images.length > 1 && (
        <div className="lightbox-counter">
          {index + 1} / {images.length}
        </div>
      )}
    </div>,
    document.body,
  );
};

// -----------------------------------------------------------------------
// ImageViewerPanel: left-side panel — large preview + filmstrip thumbnails.
// Clicking the main preview opens the full-screen ImageLightbox.
// -----------------------------------------------------------------------
const ImageViewerPanel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goPrev = (e) => {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  };
  const goNext = (e) => {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % images.length);
  };

  return (
    <div className="tag-image-panel">
      <div className="tag-image-panel-header">
        Images{images.length > 0 && <span> ({images.length})</span>}
      </div>

      {images.length > 0 ? (
        <>
          <div className="tag-carousel">
            <div
              className="tag-carousel-track"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {images.map((src, i) => (
                <div
                  className="tag-carousel-slide"
                  key={i}
                  onClick={() => setLightboxOpen(true)}
                >
                  <img src={src} alt={`Job image ${i + 1}`} />
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  className="tag-image-nav tag-image-nav-prev"
                  onClick={goPrev}
                >
                  ‹
                </button>
                <button
                  className="tag-image-nav tag-image-nav-next"
                  onClick={goNext}
                >
                  ›
                </button>
                <div className="tag-image-counter">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}

            <div className="tag-image-zoom-hint">⤢ Click to enlarge</div>
          </div>

          {images.length > 1 && (
            <div className="tag-carousel-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`tag-carousel-dot${i === activeIndex ? " active" : ""}`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="tag-image-empty">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>No images available</span>
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          startIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

// -----------------------------------------------------------------------
// TaggingModal
// -----------------------------------------------------------------------
const TaggingModal = ({ record, onClose, onTagged }) => {
  const [concernPicTaken, setConcernPicTaken] = useState(
    record.concernTagged || false,
  );
  const [confirming, setConfirming] = useState(false);

  const handleMarkTagged = () => setConfirming(true);

  const handleConfirm = () => {
    onTagged(record, { concernPicTaken });
    setConfirming(false);
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="tag-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">INSTRUMENT TAGGING</span>
              <span className="jr-modal-title-sub">
                SCIENTIFIC STANDARDS SERVICES
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="tag-info-row">
          <div className="tag-info-item">
            <span className="tag-info-label">Job Number</span>
            <span className="tag-info-value">{record.jobNumber}</span>
          </div>
          <div className="tag-info-item">
            <span className="tag-info-label">Job Receipt ID</span>
            <span className="tag-info-value">{record.jobReceiptID}</span>
          </div>
          <div className="tag-info-item">
            <span className="tag-info-label">Date Rec</span>
            <span className="tag-info-value">{record.dateRec}</span>
          </div>
          <div className="tag-info-item">
            <span className="tag-info-label">Priority</span>
            <span
              className={`tag-priority tag-priority-${record.priority?.toLowerCase().replace(" ", "-")}`}
            >
              {record.priority}
            </span>
          </div>
        </div>

        <div className="tag-modal-scroll tag-modal-body">
          <div className="tag-details-panel">
            <div className="tag-details-section">
              <table className="tag-details-table">
                <tbody>
                  <tr>
                    <td className="tag-detail-label">Company</td>
                    <td className="tag-detail-value">{record.company}</td>
                    <td className="tag-detail-label">Brand</td>
                    <td className="tag-detail-value">{record.brand}</td>
                  </tr>
                  <tr>
                    <td className="tag-detail-label">Description</td>
                    <td className="tag-detail-value">{record.description}</td>
                    <td className="tag-detail-label">Model</td>
                    <td className="tag-detail-value">{record.model}</td>
                  </tr>
                  <tr>
                    <td className="tag-detail-label">Serial No.</td>
                    <td className="tag-detail-value">{record.serialNo}</td>
                    <td className="tag-detail-label">ETA</td>
                    <td className="tag-detail-value">{record.eta}</td>
                  </tr>
                  <tr>
                    <td className="tag-detail-label">Range</td>
                    <td className="tag-detail-value">{record.range}</td>
                    <td className="tag-detail-label">Uncertainty</td>
                    <td className="tag-detail-value">{record.uncertainty}</td>
                  </tr>
                  <tr>
                    <td className="tag-detail-label">Frequency</td>
                    <td className="tag-detail-value">{record.frequency}</td>
                    <td className="tag-detail-label">Voltage</td>
                    <td className="tag-detail-value">{record.voltage}</td>
                  </tr>
                  <tr>
                    <td className="tag-detail-label">Eval By</td>
                    <td className="tag-detail-value">{record.evalBy}</td>
                    <td className="tag-detail-label">Type</td>
                    <td className="tag-detail-value">
                      {record.type === "electrical"
                        ? "Electrical"
                        : "Mechanical"}
                    </td>
                  </tr>
                  <tr>
                    <td className="tag-detail-label">Remarks</td>
                    <td className="tag-detail-value" colSpan="3">
                      {record.remarks}
                    </td>
                  </tr>
                  <tr>
                    <td className="tag-detail-label">Concern</td>
                    <td className="tag-detail-value" colSpan="3">
                      {record.concern}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {confirming && (
              <div className="tag-confirm-prompt">
                <p>
                  Are you sure you want to mark this as tagged?
                  {concernPicTaken
                    ? " It will be moved to Incoming Concern."
                    : " It will be moved to Incoming Calibration."}
                </p>
                <div className="tag-confirm-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setConfirming(false)}
                  >
                    Cancel
                  </button>
                  <button className="confirm-btn" onClick={handleConfirm}>
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>

          <ImageViewerPanel images={record.images || []} />
        </div>

        <div className="tag-footer">
          <label className="tag-checkbox-label">
            <input
              type="checkbox"
              checked={concernPicTaken}
              onChange={(e) => setConcernPicTaken(e.target.checked)}
            />
            <span>Concern / PIC Taken</span>
          </label>
          <div className="tag-footer-actions">
            <button
              className="tag-btn-primary"
              onClick={handleMarkTagged}
              disabled={confirming}
            >
              Mark as Tagged & PIC Taken
            </button>
            <button className="jr-action-btn" onClick={onClose}>
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TaggingModal;
