// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { createPortal } from "react-dom";
// import jsQR from "jsqr";
// import "./CalibrationStandardLookUpModal.css";
// import CdmsModalHeader from "./CdmsModalHeader";

// /**
//  * CalibrationStandardLookupModal
//  *
//  * Opens when a user clicks a lookup (🔍) button in the Calibration
//  * Standard grid on IncomingCalibDetailsModal. Lets them search/filter
//  * existing calibration standards by Asset No., Status, or Description,
//  * scan a standard's QR code to identify it, and hand it back via
//  * onUseStandard.
//  *
//  * Fetches its own list of standards from GET /api/standards — the same
//  * endpoint the Asset Monitoring screen uses — so this modal is searching
//  * the actual set of assets/standards being tracked there, not a separate
//  * disconnected list. Works as a self-contained modal no matter where
//  * it's rendered from — the caller doesn't need to fetch/pass a
//  * `standards` prop. You can still pass `standards` explicitly (e.g. for
//  * tests or a cached list) and the internal fetch will be skipped.
//  *
//  * Code identification is QR-only now — there is no manual text/password
//  * entry for it. Clicking "Scan QR Code" either delegates to
//  * `onScanBarcode` (if the caller wired up an external/hardware scanner)
//  * or opens an in-modal camera view and decodes the QR itself via jsQR.
//  * A successful scan looks for an exact code match and fills the
//  * record's details into the form so it's ready to hand off via
//  * "Use Standard".
//  */
// const CalibrationStandardLookupModal = ({
//   onCancel,
//   onUseStandard, // (standardRecord) => void
//   onScanBarcode, // optional: () => Promise<string> | string, resolves to a Code
//   standards: standardsProp,
// }) => {
//   const [code, setCode] = useState(""); // holds the scanned code; never typed
//   const [assetNo, setAssetNo] = useState("");
//   const [status, setStatus] = useState("");
//   const [description, setDescription] = useState("");
//   const [serialNo, setSerialNo] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [dateCal, setDateCal] = useState("");
//   const [dateDue, setDateDue] = useState("");
//   const [selectedId, setSelectedId] = useState(null);

//   const [fetchedStandards, setFetchedStandards] = useState([]);
//   const [loading, setLoading] = useState(!standardsProp);
//   const [loadError, setLoadError] = useState(null);

//   const [codeNotFound, setCodeNotFound] = useState(false);
//   const [resultsVisible, setResultsVisible] = useState(false);

//   // --- QR camera scanning state ---
//   const [cameraOpen, setCameraOpen] = useState(false);
//   const [cameraError, setCameraError] = useState(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const rafRef = useRef(null);

//   const fetchStandards = useCallback(async () => {
//     setLoading(true);
//     setLoadError(null);
//     try {
//       const res = await fetch("/api/standards");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : [];
//       // Normalize to what this modal's UI expects. Asset Monitoring
//       // records use `standardId` as their primary key and don't always
//       // have a separate `code` field populated — fall back to
//       // standardId so every record is still searchable/selectable.
//       const normalized = list.map((s) => ({
//         ...s,
//         id: s.id || s._id || s.standardId,
//         code: s.code || s.standardId || "",
//       }));
//       setFetchedStandards(normalized);
//     } catch (err) {
//       console.error("Failed to load standards:", err);
//       setFetchedStandards([]);
//       setLoadError("Failed to load standards.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Only fetch if the caller didn't already hand us a list.
//   useEffect(() => {
//     if (!standardsProp) {
//       fetchStandards();
//     }
//   }, [standardsProp, fetchStandards]);

//   const standards = standardsProp || fetchedStandards;

//   const filteredStandards = useMemo(() => {
//     return standards.filter((s) => {
//       if (assetNo && !s.assetNo?.toLowerCase().includes(assetNo.toLowerCase()))
//         return false;
//       if (status && s.status !== status) return false;
//       if (
//         description &&
//         !s.description?.toLowerCase().includes(description.toLowerCase())
//       )
//         return false;
//       return true;
//     });
//   }, [standards, assetNo, status, description]);

//   const selectedStandard = filteredStandards.find((s) => s.id === selectedId);

//   // Fills the detail fields from a matched/clicked standard without
//   // touching the Code field itself.
//   const applyStandardDetails = (standard) => {
//     setSelectedId(standard.id);
//     setAssetNo(standard.assetNo || "");
//     setStatus(standard.status || "");
//     setDescription(standard.description || "");
//     setSerialNo(standard.serialNo || "");
//     setRemarks(standard.remarks || "");
//     setDateCal(standard.dateCal || "");
//     setDateDue(standard.dateDue || "");
//   };

//   const handleRowClick = (standard) => {
//     setCode(standard.code || "");
//     applyStandardDetails(standard);
//   };

//   // Looks up a scanned code against the loaded standards list. Called
//   // only from a successful QR/barcode scan now — there's no manual
//   // typed entry to trigger it from.
//   const lookupByCode = (value) => {
//     const trimmed = (value ?? "").trim().toLowerCase();

//     if (!trimmed) {
//       setCodeNotFound(false);
//       setResultsVisible(false);
//       return;
//     }

//     const match = standards.find((s) => s.code?.toLowerCase() === trimmed);
//     if (match) {
//       setCode(match.code || value);
//       applyStandardDetails(match);
//       setCodeNotFound(false);
//       setResultsVisible(true);
//     } else {
//       setCode(value);
//       setSelectedId(null);
//       setCodeNotFound(true);
//       setResultsVisible(false);
//     }
//   };

//   // --- Camera lifecycle ---

//   const stopCamera = useCallback(() => {
//     if (rafRef.current) {
//       cancelAnimationFrame(rafRef.current);
//       rafRef.current = null;
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setCameraOpen(false);
//   }, []);

//   const scanFrame = useCallback(() => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
//       rafRef.current = requestAnimationFrame(scanFrame);
//       return;
//     }

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     const result = jsQR(imageData.data, imageData.width, imageData.height);

//     if (result?.data) {
//       lookupByCode(result.data);
//       stopCamera();
//       return;
//     }

//     rafRef.current = requestAnimationFrame(scanFrame);
//   }, [stopCamera]);

//   const startCamera = useCallback(async () => {
//     setCameraError(null);
//     setCodeNotFound(false);
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });
//       streamRef.current = stream;
//       setCameraOpen(true);
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         await videoRef.current.play();
//       }
//       rafRef.current = requestAnimationFrame(scanFrame);
//     } catch (err) {
//       console.error("Failed to start camera:", err);
//       setCameraError(
//         "Couldn't access the camera. Check permissions and try again.",
//       );
//       setCameraOpen(false);
//     }
//   }, [scanFrame]);

//   // Clean up the camera if the modal unmounts while scanning.
//   useEffect(() => {
//     return () => stopCamera();
//   }, [stopCamera]);

//   const handleScanQrCode = async () => {
//     if (onScanBarcode) {
//       const scannedCode = await onScanBarcode();
//       if (scannedCode) lookupByCode(scannedCode);
//       return;
//     }
//     startCamera();
//   };

//   const handleUseStandardClick = () => {
//     if (!selectedStandard) return;
//     onUseStandard?.(selectedStandard);
//   };

//   return createPortal(
//     <div className="csl-modal-overlay" onClick={onCancel}>
//       <div className="csl-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader title="CALIBRATION STANDARD" onClose={onCancel} />

//         <div className="csl-modal-body">
//           <div className="csl-field-row">
//             <label>Code</label>
//             <div className="csl-qr-area">
//               {!cameraOpen ? (
//                 <button
//                   type="button"
//                   className="csl-qr-scan-btn"
//                   onClick={handleScanQrCode}
//                 >
//                   📷 Scan QR Code
//                 </button>
//               ) : (
//                 <div className="csl-qr-video-wrapper">
//                   <video
//                     ref={videoRef}
//                     className="csl-qr-video"
//                     muted
//                     playsInline
//                   />
//                   <canvas ref={canvasRef} style={{ display: "none" }} />
//                   <button
//                     type="button"
//                     className="csl-qr-cancel-btn"
//                     onClick={stopCamera}
//                   >
//                     Cancel Scan
//                   </button>
//                 </div>
//               )}
//               {code && !codeNotFound && (
//                 <div className="csl-qr-code-value">Scanned: {code}</div>
//               )}
//             </div>
//             {cameraError && (
//               <div className="csl-code-not-found">{cameraError}</div>
//             )}
//             {codeNotFound && (
//               <div className="csl-code-not-found">
//                 No standard found for that code.
//               </div>
//             )}
//           </div>

//           <div className="csl-inline-row">
//             <label>Asset No.</label>
//             <input
//               type="text"
//               value={assetNo}
//               onChange={(e) => setAssetNo(e.target.value)}
//             />
//             <label>Status</label>
//             <select value={status} onChange={(e) => setStatus(e.target.value)}>
//               <option value="">-- Select --</option>
//               <option value="Active">Active</option>
//               <option value="Retired">Retired</option>
//               <option value="Under Repair">Under Repair</option>
//             </select>
//           </div>

//           <div className="csl-field-row">
//             <label>Description</label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               rows={3}
//             />
//           </div>

//           <div className="csl-field-row">
//             <label>Serial No.</label>
//             <input
//               type="text"
//               value={serialNo}
//               onChange={(e) => setSerialNo(e.target.value)}
//             />
//           </div>

//           <div className="csl-field-row">
//             <label>Remarks</label>
//             <textarea
//               value={remarks}
//               onChange={(e) => setRemarks(e.target.value)}
//               rows={2}
//             />
//           </div>

//           <div className="csl-inline-row csl-date-row">
//             <label>Date Cal</label>
//             <input
//               type="date"
//               value={dateCal}
//               onChange={(e) => setDateCal(e.target.value)}
//             />
//             <label>Date Due</label>
//             <input
//               type="date"
//               value={dateDue}
//               onChange={(e) => setDateDue(e.target.value)}
//             />
//           </div>

//           <div className="csl-results-list">
//             {!resultsVisible ? null : loading ? (
//               <div className="csl-results-empty">
//                 Loading calibration standards...
//               </div>
//             ) : loadError ? (
//               <div className="csl-results-empty">
//                 {loadError}{" "}
//                 <button type="button" onClick={fetchStandards}>
//                   Retry
//                 </button>
//               </div>
//             ) : filteredStandards.length > 0 ? (
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Code</th>
//                     <th>Asset No.</th>
//                     <th>Description</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredStandards.map((s) => (
//                     <tr
//                       key={s.id}
//                       className={s.id === selectedId ? "csl-row-selected" : ""}
//                       onClick={() => handleRowClick(s)}
//                     >
//                       <td>{s.code}</td>
//                       <td>{s.assetNo}</td>
//                       <td>{s.description}</td>
//                       <td>{s.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <div className="csl-results-empty">
//                 No calibration standards match your search.
//               </div>
//             )}
//           </div>

//           <div className="csl-footer">
//             <div className="csl-footer-right">
//               <button
//                 type="button"
//                 className="csl-use-btn"
//                 disabled={!selectedStandard}
//                 onClick={handleUseStandardClick}
//               >
//                 Use Standard
//               </button>
//               <button
//                 type="button"
//                 className="csl-cancel-btn"
//                 onClick={onCancel}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default CalibrationStandardLookupModal;
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import jsQR from "jsqr";
import "./CalibrationStandardLookUpModal.css";
import CdmsModalHeader from "./CdmsModalHeader";
import { decodeStandardQr } from "../AssetMonitoring/StandardQrCode";

/**
 * CalibrationStandardLookupModal
 *
 * Opens when a user clicks a lookup (🔍) button in the Calibration
 * Standard grid on IncomingCalibDetailsModal. Lets them search/filter
 * existing calibration standards by Asset No., Status, or Description,
 * scan a standard's QR code to identify it, and hand it back via
 * onUseStandard.
 *
 * Fetches its own list of standards from GET /api/standards — the same
 * endpoint the Asset Monitoring screen uses — so this modal is searching
 * the actual set of assets/standards being tracked there, not a separate
 * disconnected list. Works as a self-contained modal no matter where
 * it's rendered from — the caller doesn't need to fetch/pass a
 * `standards` prop. You can still pass `standards` explicitly (e.g. for
 * tests or a cached list) and the internal fetch will be skipped.
 *
 * Code identification is QR-only — there is no manual text/password
 * entry for it. Clicking "Scan QR Code" either delegates to
 * `onScanBarcode` (if the caller wired up an external/hardware scanner)
 * or opens an in-modal camera view and decodes the QR itself via jsQR.
 * The QR encodes the standard's full record (see standardQrCode.js), so
 * a successful scan populates the form directly via decodeStandardQr —
 * it doesn't need to depend on `/api/standards` having loaded, though
 * matching against the fetched list (by code) is still used to prefer
 * the freshest copy of the record when one is available.
 */
const CalibrationStandardLookupModal = ({
  onCancel,
  onUseStandard, // (standardRecord) => void
  onScanBarcode, // optional: () => Promise<string> | string, resolves to raw QR text
  standards: standardsProp,
}) => {
  const [code, setCode] = useState(""); // holds the scanned code; never typed
  const [assetNo, setAssetNo] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [dateCal, setDateCal] = useState("");
  const [dateDue, setDateDue] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // The record decoded straight from the QR — used as a fallback so
  // "Use Standard" still works even if the fetched standards list is
  // slow, stale, or offline.
  const [scannedStandard, setScannedStandard] = useState(null);

  const [fetchedStandards, setFetchedStandards] = useState([]);
  const [loading, setLoading] = useState(!standardsProp);
  const [loadError, setLoadError] = useState(null);

  const [codeNotFound, setCodeNotFound] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);

  // --- QR camera scanning state ---
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const fetchStandards = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/standards");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      // Normalize to what this modal's UI expects. Asset Monitoring
      // records use `standardId` as their primary key and don't always
      // have a separate `code` field populated — fall back to
      // standardId so every record is still searchable/selectable.
      const normalized = list.map((s) => ({
        ...s,
        id: s.id || s._id || s.standardId,
        code: s.code || s.standardId || "",
      }));
      setFetchedStandards(normalized);
    } catch (err) {
      console.error("Failed to load standards:", err);
      setFetchedStandards([]);
      setLoadError("Failed to load standards.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch if the caller didn't already hand us a list.
  useEffect(() => {
    if (!standardsProp) {
      fetchStandards();
    }
  }, [standardsProp, fetchStandards]);

  const standards = standardsProp || fetchedStandards;

  const filteredStandards = useMemo(() => {
    return standards.filter((s) => {
      if (assetNo && !s.assetNo?.toLowerCase().includes(assetNo.toLowerCase()))
        return false;
      if (status && s.status !== status) return false;
      if (
        description &&
        !s.description?.toLowerCase().includes(description.toLowerCase())
      )
        return false;
      return true;
    });
  }, [standards, assetNo, status, description]);

  // Prefer the freshest copy from the fetched list (by code) when it's
  // available; otherwise fall back to what was decoded straight off the
  // QR so scanning still works if /api/standards hasn't loaded yet.
  const selectedStandard =
    filteredStandards.find((s) => s.id === selectedId) || scannedStandard;

  // Fills the detail fields from a matched/clicked standard without
  // touching the Code field itself.
  const applyStandardDetails = (standard) => {
    setSelectedId(standard.id);
    setAssetNo(standard.assetNo || "");
    setStatus(standard.status || "");
    setDescription(standard.description || "");
    setSerialNo(standard.serialNo || "");
    setRemarks(standard.remarks || "");
    setDateCal(standard.dateCal || "");
    setDateDue(standard.dateDue || "");
  };

  const handleRowClick = (standard) => {
    setCode(standard.code || "");
    setScannedStandard(null);
    applyStandardDetails(standard);
  };

  // Decodes scanned QR text into a full standard record and populates
  // the form from it. If a matching record also exists in the fetched
  // /api/standards list (by code), that copy is preferred as the
  // "source of truth" going forward (see selectedStandard above) —
  // the QR's own data is kept as a fallback via scannedStandard.
  const applyScannedCode = (rawText) => {
    const decoded = decodeStandardQr(rawText);
    if (!decoded) {
      setSelectedId(null);
      setScannedStandard(null);
      setCodeNotFound(true);
      setResultsVisible(false);
      return;
    }

    setCode(decoded.code);
    setScannedStandard(decoded);
    applyStandardDetails(decoded);
    setCodeNotFound(false);
    setResultsVisible(true); // shows the filtered table underneath too, if useful
  };

  // --- Camera lifecycle ---

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height);

    if (result?.data) {
      applyScannedCode(result.data);
      stopCamera();
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCodeNotFound(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraOpen(true); // video element mounts on next render; effect below attaches the stream
    } catch (err) {
      console.error("Failed to start camera:", err);
      setCameraError(
        "Couldn't access the camera. Check permissions and try again.",
      );
      setCameraOpen(false);
    }
  }, []);

  // Attach the stream once the <video> element actually exists in the DOM
  // (i.e. after cameraOpen flips true and React re-renders). Doing this
  // inline inside startCamera doesn't work because videoRef.current is
  // still null at that point — the video element hasn't mounted yet.
  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch((err) => {
      console.error("Failed to play video stream:", err);
    });

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [cameraOpen, scanFrame]);

  // Clean up the camera if the modal unmounts while scanning.
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleScanQrCode = async () => {
    if (onScanBarcode) {
      const scannedText = await onScanBarcode();
      if (scannedText) applyScannedCode(scannedText);
      return;
    }
    startCamera();
  };

  const handleUseStandardClick = () => {
    if (!selectedStandard) return;
    onUseStandard?.(selectedStandard);
  };

  return createPortal(
    <div className="csl-modal-overlay" onClick={onCancel}>
      <div className="csl-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader title="CALIBRATION STANDARD" onClose={onCancel} />

        <div className="csl-modal-body">
          <div className="csl-field-row">
            <label>Code</label>
            <div className="csl-qr-area">
              {!cameraOpen ? (
                <button
                  type="button"
                  className="csl-qr-scan-btn"
                  onClick={handleScanQrCode}
                >
                  📷 Scan QR Code
                </button>
              ) : (
                <div className="csl-qr-video-wrapper">
                  <video
                    ref={videoRef}
                    className="csl-qr-video"
                    muted
                    playsInline
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <button
                    type="button"
                    className="csl-qr-cancel-btn"
                    onClick={stopCamera}
                  >
                    Cancel Scan
                  </button>
                </div>
              )}
              {code && !codeNotFound && (
                <div className="csl-qr-code-value">Scanned: {code}</div>
              )}
            </div>
            {cameraError && (
              <div className="csl-code-not-found">{cameraError}</div>
            )}
            {codeNotFound && (
              <div className="csl-code-not-found">
                That QR code isn't a recognized calibration standard.
              </div>
            )}
          </div>

          <div className="csl-inline-row">
            <label>Asset No.</label>
            <input
              type="text"
              value={assetNo}
              onChange={(e) => setAssetNo(e.target.value)}
            />
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="Active">Active</option>
              <option value="Retired">Retired</option>
              <option value="Under Repair">Under Repair</option>
            </select>
          </div>

          <div className="csl-field-row">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="csl-field-row">
            <label>Serial No.</label>
            <input
              type="text"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
            />
          </div>

          <div className="csl-field-row">
            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
            />
          </div>

          <div className="csl-inline-row csl-date-row">
            <label>Date Cal</label>
            <input
              type="date"
              value={dateCal}
              onChange={(e) => setDateCal(e.target.value)}
            />
            <label>Date Due</label>
            <input
              type="date"
              value={dateDue}
              onChange={(e) => setDateDue(e.target.value)}
            />
          </div>

          <div className="csl-results-list">
            {!resultsVisible ? null : loading ? (
              <div className="csl-results-empty">
                Loading calibration standards...
              </div>
            ) : loadError ? (
              <div className="csl-results-empty">
                {loadError}{" "}
                <button type="button" onClick={fetchStandards}>
                  Retry
                </button>
              </div>
            ) : filteredStandards.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Asset No.</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStandards.map((s) => (
                    <tr
                      key={s.id}
                      className={s.id === selectedId ? "csl-row-selected" : ""}
                      onClick={() => handleRowClick(s)}
                    >
                      <td>{s.code}</td>
                      <td>{s.assetNo}</td>
                      <td>{s.description}</td>
                      <td>{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="csl-results-empty">
                No calibration standards match your search.
              </div>
            )}
          </div>

          <div className="csl-footer">
            <div className="csl-footer-right">
              <button
                type="button"
                className="csl-use-btn"
                disabled={!selectedStandard}
                onClick={handleUseStandardClick}
              >
                Use Standard
              </button>
              <button
                type="button"
                className="csl-cancel-btn"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CalibrationStandardLookupModal;
