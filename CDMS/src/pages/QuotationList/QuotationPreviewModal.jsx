// import React, { useRef, useState } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import QuotationDocument from "./QuotationDocument";
// import { documentElementToPdfBlob } from "./quotationPdf";
// import { buildDefaultContent } from "./quotationTemplateDefaults";
// import "./QuotationPreviewModal.css";

// /**
//  * QuotationPreviewModal
//  *
//  * Shows the quotation exactly as it will look on paper (logo, header boxes,
//  * table, notes, 19 conditions, signature block) and lets the user click
//  * into any text to edit it. Nothing is saved to the server from here — on
//  * "Apply" the edited content is handed back to the parent, which decides
//  * what to do with it (AddQuotationModal stores it with the form;
//  * QuotationDetailsModal saves it or moves the quotation to sending).
//  *
//  * Props
//  *  quotation  – { quotationId, date, preparedBy, approvedBy?, ...signature urls }
//  *  content    – the working content object (already normalized by the parent)
//  *  readOnly   – view-only (e.g. when the record is locked)
//  *  title      – header text (default "QUOTATION PREVIEW")
//  *  applyLabel – text of the confirm button (default "Apply Changes")
//  *  onApply    – (content) => void
//  *  onClose    – () => void
//  */
// const QuotationPreviewModal = ({
//   quotation,
//   content: initialContent,
//   readOnly = false,
//   title = "QUOTATION PREVIEW",
//   applyLabel = "Apply Changes",
//   onApply,
//   onClose,
// }) => {
//   const [content, setContent] = useState(initialContent);
//   const [dirty, setDirty] = useState(false);
//   const [overflowing, setOverflowing] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const docRef = useRef(null);
//   // Always holds the newest content, so Apply can read it synchronously
//   // right after the focused field's blur handler has committed its edit.
//   const latestRef = useRef(initialContent);

//   const handleChange = (next) => {
//     latestRef.current = next;
//     setContent(next);
//     setDirty(true);
//   };

//   // B / I / U act on the current text selection inside the document.
//   // onMouseDown + preventDefault keeps the selection from being lost when
//   // the toolbar button is pressed.
//   const format = (cmd) => (e) => {
//     e.preventDefault();
//     document.execCommand(cmd, false, null);
//   };

//   const handleReset = () => {
//     if (
//       !window.confirm(
//         "Reset the quotation text back to the standard template? Your edits will be lost.",
//       )
//     ) {
//       return;
//     }
//     // keep header-block values, restore everything else
//     handleChange(buildDefaultContent(content.fields));
//   };

//   const handleClose = () => {
//     if (dirty && !readOnly && !window.confirm("Discard your unsaved edits?")) {
//       return;
//     }
//     onClose();
//   };

//   // Lets the user check the final look without saving anything.
//   const handleDownloadPdf = async () => {
//     if (exporting || !docRef.current) return;
//     setExporting(true);
//     try {
//       // make sure the field being typed in has committed (blur) first
//       document.activeElement?.blur?.();
//       await new Promise((r) => setTimeout(r, 50));
//       const blob = await documentElementToPdfBlob(docRef.current);
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${(quotation.quotationId || "quotation").replace(/\//g, "-")}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Failed to export PDF:", err);
//       alert("Failed to generate the PDF preview. Please try again.");
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handleApply = () => {
//     // blur() synchronously fires the field's onBlur -> handleChange,
//     // which updates latestRef before we read it.
//     document.activeElement?.blur?.();
//     onApply(latestRef.current);
//   };

//   return (
//     <div className="qpm-overlay" role="dialog" aria-modal="true">
//       <div className="qpm-modal">
//         <CdmsModalHeader title={title} onClose={handleClose} />

//         <div className="qpm-toolbar">
//           {!readOnly && (
//             <>
//               <div className="qpm-toolbar-group">
//                 <button
//                   type="button"
//                   className="qpm-tool"
//                   title="Bold"
//                   onMouseDown={format("bold")}
//                 >
//                   <b>B</b>
//                 </button>
//                 <button
//                   type="button"
//                   className="qpm-tool"
//                   title="Italic"
//                   onMouseDown={format("italic")}
//                 >
//                   <i>I</i>
//                 </button>
//                 <button
//                   type="button"
//                   className="qpm-tool"
//                   title="Underline"
//                   onMouseDown={format("underline")}
//                 >
//                   <u>U</u>
//                 </button>
//               </div>
//               <span className="qpm-hint">
//                 Click any text on the page to edit it. Select text and use B / I
//                 / U to format.
//               </span>
//             </>
//           )}
//           {readOnly && <span className="qpm-hint">View only</span>}
//           <div className="qpm-toolbar-spacer" />
//           {!readOnly && (
//             <button type="button" className="qpm-btn" onClick={handleReset}>
//               Reset to Template
//             </button>
//           )}
//           <button
//             type="button"
//             className="qpm-btn"
//             onClick={handleDownloadPdf}
//             disabled={exporting}
//             title="Preview how the final PDF will look (nothing is saved)"
//           >
//             {exporting ? "Generating..." : "Download PDF Preview"}
//           </button>
//         </div>

//         {overflowing && (
//           <div className="qpm-warning">
//             The quotation no longer fits on 2 pages — some content may be cut
//             off in the PDF. Remove a row or shorten some text to fit.
//           </div>
//         )}

//         <div className="qpm-scroll">
//           <QuotationDocument
//             ref={docRef}
//             content={content}
//             onChange={handleChange}
//             readOnly={readOnly}
//             meta={quotation}
//             onOverflow={setOverflowing}
//           />
//         </div>

//         <div className="qpm-footer">
//           <button type="button" className="qpm-btn" onClick={handleClose}>
//             {readOnly ? "Close" : "Cancel"}
//           </button>
//           {!readOnly && (
//             <button
//               type="button"
//               className="qpm-btn qpm-btn-primary"
//               onClick={handleApply}
//             >
//               {applyLabel}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuotationPreviewModal;
import React, { useRef, useState } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import QuotationDocument from "./QuotationDocument";
import ConfirmDialog from "../../components/ConfirmDialog"; // CHANGED
import { documentElementToPdfBlob } from "./quotationPdf";
import { buildDefaultContent } from "./quotationTemplateDefaults";
import "./QuotationPreviewModal.css";

/**
 * QuotationPreviewModal
 *
 * Shows the quotation exactly as it will look on paper (logo, header boxes,
 * table, notes, 19 conditions, signature block) and lets the user click
 * into any text to edit it. Nothing is saved to the server from here — on
 * "Apply" the edited content is handed back to the parent, which decides
 * what to do with it (AddQuotationModal stores it with the form;
 * QuotationDetailsModal saves it or moves the quotation to sending).
 *
 * Props
 *  quotation  – { quotationId, date, preparedBy, approvedBy?, ...signature urls }
 *  content    – the working content object (already normalized by the parent)
 *  readOnly   – view-only (e.g. when the record is locked)
 *  title      – header text (default "QUOTATION PREVIEW")
 *  applyLabel – text of the confirm button (default "Apply Changes")
 *  onApply    – (content) => void
 *  onClose    – () => void
 */
const QuotationPreviewModal = ({
  quotation,
  content: initialContent,
  readOnly = false,
  title = "QUOTATION PREVIEW",
  applyLabel = "Apply Changes",
  onApply,
  onClose,
}) => {
  const [content, setContent] = useState(initialContent);
  const [dirty, setDirty] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dialog, setDialog] = useState(null); // CHANGED
  const docRef = useRef(null);
  // Always holds the newest content, so Apply can read it synchronously
  // right after the focused field's blur handler has committed its edit.
  const latestRef = useRef(initialContent);

  const handleChange = (next) => {
    latestRef.current = next;
    setContent(next);
    setDirty(true);
  };

  // B / I / U act on the current text selection inside the document.
  // onMouseDown + preventDefault keeps the selection from being lost when
  // the toolbar button is pressed.
  const format = (cmd) => (e) => {
    e.preventDefault();
    document.execCommand(cmd, false, null);
  };

  // CHANGED: was window.confirm(...)
  const handleReset = () => {
    setDialog({
      title: "Reset to template?",
      message:
        "Reset the quotation text back to the standard template? Your edits will be lost.",
      type: "danger",
      confirmLabel: "Reset",
      cancelLabel: "Cancel",
      onConfirm: () => {
        setDialog(null);
        // keep header-block values, restore everything else
        handleChange(buildDefaultContent(content.fields));
      },
      onCancel: () => setDialog(null),
    });
  };

  // CHANGED: was window.confirm(...)
  const handleClose = () => {
    if (dirty && !readOnly) {
      setDialog({
        title: "Discard changes?",
        message: "Discard your unsaved edits?",
        type: "danger",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        onConfirm: () => {
          setDialog(null);
          onClose();
        },
        onCancel: () => setDialog(null),
      });
      return;
    }
    onClose();
  };

  // Lets the user check the final look without saving anything.
  const handleDownloadPdf = async () => {
    if (exporting || !docRef.current) return;
    setExporting(true);
    try {
      // make sure the field being typed in has committed (blur) first
      document.activeElement?.blur?.();
      await new Promise((r) => setTimeout(r, 50));
      const blob = await documentElementToPdfBlob(docRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(quotation.quotationId || "quotation").replace(/\//g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      // CHANGED: was alert(...)
      setDialog({
        title: "PDF preview failed",
        message: "Failed to generate the PDF preview. Please try again.",
        type: "danger",
        confirmLabel: "OK",
        onConfirm: () => setDialog(null),
      });
    } finally {
      setExporting(false);
    }
  };

  const handleApply = () => {
    // blur() synchronously fires the field's onBlur -> handleChange,
    // which updates latestRef before we read it.
    document.activeElement?.blur?.();
    onApply(latestRef.current);
  };

  return (
    <div className="qpm-overlay" role="dialog" aria-modal="true">
      <div className="qpm-modal">
        <CdmsModalHeader title={title} onClose={handleClose} />

        <div className="qpm-toolbar">
          {!readOnly && (
            <>
              <div className="qpm-toolbar-group">
                <button
                  type="button"
                  className="qpm-tool"
                  title="Bold"
                  onMouseDown={format("bold")}
                >
                  <b>B</b>
                </button>
                <button
                  type="button"
                  className="qpm-tool"
                  title="Italic"
                  onMouseDown={format("italic")}
                >
                  <i>I</i>
                </button>
                <button
                  type="button"
                  className="qpm-tool"
                  title="Underline"
                  onMouseDown={format("underline")}
                >
                  <u>U</u>
                </button>
              </div>
              <span className="qpm-hint">
                Click any text on the page to edit it. Select text and use B / I
                / U to format.
              </span>
            </>
          )}
          {readOnly && <span className="qpm-hint">View only</span>}
          <div className="qpm-toolbar-spacer" />
          {!readOnly && (
            <button type="button" className="qpm-btn" onClick={handleReset}>
              Reset to Template
            </button>
          )}
          <button
            type="button"
            className="qpm-btn"
            onClick={handleDownloadPdf}
            disabled={exporting}
            title="Preview how the final PDF will look (nothing is saved)"
          >
            {exporting ? "Generating..." : "Download PDF Preview"}
          </button>
        </div>

        {overflowing && (
          <div className="qpm-warning">
            The quotation no longer fits on 2 pages — some content may be cut
            off in the PDF. Remove a row or shorten some text to fit.
          </div>
        )}

        <div className="qpm-scroll">
          <QuotationDocument
            ref={docRef}
            content={content}
            onChange={handleChange}
            readOnly={readOnly}
            meta={quotation}
            onOverflow={setOverflowing}
          />
        </div>

        <div className="qpm-footer">
          <button type="button" className="qpm-btn" onClick={handleClose}>
            {readOnly ? "Close" : "Cancel"}
          </button>
          {!readOnly && (
            <button
              type="button"
              className="qpm-btn qpm-btn-primary"
              onClick={handleApply}
            >
              {applyLabel}
            </button>
          )}
        </div>
      </div>

      {/* CHANGED */}
      {dialog && <ConfirmDialog {...dialog} />}
    </div>
  );
};

export default QuotationPreviewModal;
