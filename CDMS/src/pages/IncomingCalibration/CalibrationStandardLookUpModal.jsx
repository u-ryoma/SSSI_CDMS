// import React, { useState, useMemo } from "react";
// import { createPortal } from "react-dom";
// import "./CalibrationStandardLookUpModal.css";
// import CdmsModalHeader from "./CdmsModalHeader";

// /**
//  * CalibrationStandardLookupModal
//  *
//  * Opens when a user clicks a lookup (🔍) button in the Calibration
//  * Standard grid on IncomingCalibDetailsModal. Lets them search/filter
//  * existing calibration standards by Code, Asset No., or Description,
//  * pick one from the results list, and hand it back via onUseStandard.
//  *
//  * NOTE: `standards` should be the full list of calibration standardQ
//  * records fetched from your backend (e.g. GET /api/calibrationstandards).
//  * It's currently defaulted to an empty array — wire up a fetch (in the
//  * parent, or inside this component with useEffect) and pass the results
//  * in as this prop once the endpoint exists.
//  */
// const CalibrationStandardLookupModal = ({
//   onCancel,
//   onUseStandard, // (standardRecord) => void
//   onScanBarcode, // () => Promise<string> | string, resolves to a Code
//   standards = [],
// }) => {
//   const [code, setCode] = useState("");
//   const [assetNo, setAssetNo] = useState("");
//   const [status, setStatus] = useState("");
//   const [description, setDescription] = useState("");
//   const [serialNo, setSerialNo] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [dateCal, setDateCal] = useState("");
//   const [dateDue, setDateDue] = useState("");
//   const [selectedId, setSelectedId] = useState(null);

//   const filteredStandards = useMemo(() => {
//     return standards.filter((s) => {
//       if (code && !s.code?.toLowerCase().includes(code.toLowerCase()))
//         return false;
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
//   }, [standards, code, assetNo, status, description]);

//   const selectedStandard = filteredStandards.find((s) => s.id === selectedId);

//   const handleRowClick = (standard) => {
//     setSelectedId(standard.id);
//     // Reflect the selected row's details back into the top fields, same
//     // as the reference screenshot's behavior.
//     setCode(standard.code || "");
//     setAssetNo(standard.assetNo || "");
//     setStatus(standard.status || "");
//     setDescription(standard.description || "");
//     setSerialNo(standard.serialNo || "");
//     setRemarks(standard.remarks || "");
//     setDateCal(standard.dateCal || "");
//     setDateDue(standard.dateDue || "");
//   };

//   const handleScanBarcode = async () => {
//     const scannedCode = await onScanBarcode?.();
//     if (scannedCode) setCode(scannedCode);
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
//             <div className="csl-input-with-btn">
//               <input
//                 type="text"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//               />
//               <button
//                 type="button"
//                 className="csl-barcode-btn"
//                 title="Scan barcode"
//                 onClick={handleScanBarcode}
//               >
//                 ||||
//               </button>
//             </div>
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
//             {filteredStandards.length > 0 ? (
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
//                 No calibration standards to show yet — connect this modal to
//                 your standards list.
//               </div>
//             )}
//           </div>

//           <div className="csl-footer">
//             <button
//               type="button"
//               className="csl-scan-link"
//               onClick={handleScanBarcode}
//             >
//               Scan Barcode ...
//             </button>
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
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import "./CalibrationStandardLookUpModal.css";
import CdmsModalHeader from "./CdmsModalHeader";

/**
 * CalibrationStandardLookupModal
 *
 * Opens when a user clicks a lookup (🔍) button in the Calibration
 * Standard grid on IncomingCalibDetailsModal. Lets them search/filter
 * existing calibration standards by Code, Asset No., or Description,
 * pick one from the results list, and hand it back via onUseStandard.
 *
 * Fetches its own list of standards from GET /api/standards — the same
 * endpoint the Asset Monitoring screen uses — so this modal is searching
 * the actual set of assets/standards being tracked there, not a separate
 * disconnected list. Works as a self-contained modal no matter where
 * it's rendered from — the caller doesn't need to fetch/pass a
 * `standards` prop. You can still pass `standards` explicitly (e.g. for
 * tests or a cached list) and the internal fetch will be skipped.
 *
 * The Code field is masked (like a password input) — typing it doesn't
 * reveal or auto-populate anything. Details only populate once the user
 * clicks the lookup (🔍) button beside it (or presses Enter, or scans a
 * barcode), which looks for an exact code match and fills the record's
 * details into the form so it's ready to hand off via "Use Standard".
 */
const CalibrationStandardLookupModal = ({
  onCancel,
  onUseStandard, // (standardRecord) => void
  onScanBarcode, // () => Promise<string> | string, resolves to a Code
  standards: standardsProp,
}) => {
  const [code, setCode] = useState("");
  const [assetNo, setAssetNo] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [dateCal, setDateCal] = useState("");
  const [dateDue, setDateDue] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [fetchedStandards, setFetchedStandards] = useState([]);
  const [loading, setLoading] = useState(!standardsProp);
  const [loadError, setLoadError] = useState(null);

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
      if (code && !s.code?.toLowerCase().includes(code.toLowerCase()))
        return false;
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
  }, [standards, code, assetNo, status, description]);

  const selectedStandard = filteredStandards.find((s) => s.id === selectedId);

  // Fills the detail fields from a matched/clicked standard without
  // touching the Code field itself (the user is typically the one who
  // just typed it, or it's already correct from the row's own code).
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
    applyStandardDetails(standard);
  };

  // Explicit lookup triggered by the button beside the Code field (not
  // live as-you-type — the Code input is masked, so nothing should
  // populate until the user deliberately asks for it).
  const [codeNotFound, setCodeNotFound] = useState(false);

  // The results list stays hidden until the user actually looks
  // something up via the button beside Code (or Enter / barcode scan) —
  // it should never just show the full standards list by default.
  const [resultsVisible, setResultsVisible] = useState(false);

  const lookupByCode = (value) => {
    const trimmed = (value ?? code).trim().toLowerCase();

    // Nothing typed: never reveal the table (which would otherwise show
    // every standard, since an empty filter matches everything).
    if (!trimmed) {
      setCodeNotFound(false);
      setResultsVisible(false);
      return;
    }

    const match = standards.find((s) => s.code?.toLowerCase() === trimmed);
    if (match) {
      applyStandardDetails(match);
      setCodeNotFound(false);
      setResultsVisible(true);
    } else {
      setSelectedId(null);
      setCodeNotFound(true);
      // No match either — still nothing to show in the table.
      setResultsVisible(false);
    }
  };

  const handleCodeLookup = () => lookupByCode();

  const handleCodeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCodeLookup();
    }
  };

  const handleScanBarcode = async () => {
    const scannedCode = await onScanBarcode?.();
    if (scannedCode) {
      setCode(scannedCode);
      lookupByCode(scannedCode);
    }
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
            <div className="csl-input-with-btn">
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  const value = e.target.value;
                  setCode(value);
                  setCodeNotFound(false);
                  if (!value.trim()) setResultsVisible(false);
                }}
                onKeyDown={handleCodeKeyDown}
                autoComplete="off"
              />
              <button
                type="button"
                className="csl-lookup-btn"
                title="Look up code"
                onClick={handleCodeLookup}
              >
                🔍
              </button>
              <button
                type="button"
                className="csl-barcode-btn"
                title="Scan barcode"
                onClick={handleScanBarcode}
              >
                ||||
              </button>
            </div>
            {codeNotFound && (
              <div className="csl-code-not-found">
                No standard found for that code.
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
            <button
              type="button"
              className="csl-scan-link"
              onClick={handleScanBarcode}
            >
              Scan Barcode ...
            </button>
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
