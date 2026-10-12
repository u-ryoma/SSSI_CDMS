import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  createElement,
} from "react";
import logo from "../QuotationList/sssi-logo.png"; // <- put sssi-logo.png here
import { sanitizeHtml } from "./sanitizeHtml";
import {
  DOC_META,
  DEFAULT_PAGE1_CONDITIONS,
  newItem,
} from "./quotationTemplateDefaults";
import "./QuotationDocument.css";

const TOTAL_PAGES = 2;

/* ------------------------------------------------------------------ */
/* Editable — a contentEditable text block                             */
/* ------------------------------------------------------------------ */
// The DOM is only rewritten when the incoming value really differs from
// what's already on screen, so the caret never jumps while typing. State
// is updated on blur (not every keystroke) for the same reason.
const Editable = ({
  html,
  onChange,
  readOnly,
  tag = "div",
  singleLine = false,
  className = "",
  placeholder,
}) => {
  const ref = useRef(null);

  // useLayoutEffect (not useEffect) so the text is in the DOM *before* the
  // parent's pagination measurement runs — child layout effects fire first.
  useLayoutEffect(() => {
    if (ref.current && ref.current.innerHTML !== (html || "")) {
      ref.current.innerHTML = html || "";
    }
  }, [html]);

  const handleBlur = () => {
    if (readOnly || !ref.current) return;
    const clean = sanitizeHtml(ref.current.innerHTML);
    if (clean !== (html || "")) onChange(clean);
  };

  const handleKeyDown = (e) => {
    if (singleLine && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  // Paste as plain text so Word/web styling never leaks into the document.
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand(
      "insertText",
      false,
      singleLine ? text.replace(/\s*\n\s*/g, " ") : text,
    );
  };

  return createElement(tag, {
    ref,
    className: `qp-editable ${className}`,
    contentEditable: !readOnly,
    suppressContentEditableWarning: true,
    spellCheck: false,
    "data-placeholder": placeholder || "",
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onPaste: handlePaste,
  });
};

/* ------------------------------------------------------------------ */
/* Header / footer, repeated on every page like the Word template      */
/* ------------------------------------------------------------------ */
const PageHeader = () => (
  <header className="qp-header">
    <img
      className="qp-logo"
      src={logo}
      alt="SSSI logo"
      crossOrigin="anonymous"
    />
    <div className="qp-header-center">
      <div className="qp-company">{DOC_META.companyName}</div>
      {DOC_META.addressLines.map((line) => (
        <div className="qp-address" key={line}>
          {line}
        </div>
      ))}
    </div>
    <div className="qp-header-boxes">
      <div className="qp-box qp-box-docinfo">
        <div>
          <b>DOC ID</b>: {DOC_META.docId}
        </div>
        <div>
          <b>ISSUE NO.</b> : {DOC_META.issueNo}
        </div>
        <div>
          <b>REVISION</b> : {DOC_META.revision}
        </div>
        <div>
          <b>DATE REV</b> : {DOC_META.dateRev}
        </div>
      </div>
      <div className="qp-box qp-box-title">
        <span className="qp-box-title-label">TITLE</span>
        <b>{DOC_META.title}</b>
      </div>
    </div>
  </header>
);

const PageFooter = ({ page }) => (
  <footer className="qp-footer">
    <div className="qp-footer-page">
      Page {page} of {TOTAL_PAGES}
    </div>
    <div className="qp-footer-right">
      <div className="qp-footer-docid">
        DOC ID: <b>{DOC_META.docId}</b>
      </div>
      <div className="qp-footer-web">{DOC_META.website}</div>
    </div>
  </footer>
);

/* ------------------------------------------------------------------ */
/* QuotationDocument                                                   */
/* ------------------------------------------------------------------ */
/**
 * Pure render of the quotation. Used by:
 *  - QuotationPreviewModal (editable, readOnly=false)
 *  - quotationPdf.js (readOnly, rendered off-screen and captured to PDF)
 *
 * Props
 *  content   – object from quotationTemplateDefaults.normalizeContent()
 *  onChange  – (nextContent) => void   (omit when readOnly)
 *  meta      – { quotationId, date, preparedBy, approvedBy,
 *               clerkSignatureUrl, adminSignatureUrl }
 *  readOnly  – disables editing and hides the add/remove controls
 *  onOverflow – (bool) => void, true when the content no longer fits in 2 pages
 */
const QuotationDocument = React.forwardRef(function QuotationDocument(
  { content, onChange, meta = {}, readOnly = false, onOverflow },
  rootRef,
) {
  const [split, setSplit] = useState(DEFAULT_PAGE1_CONDITIONS);
  const page1BodyRef = useRef(null);
  const page2BodyRef = useRef(null);

  const patch = (changes) => onChange?.({ ...content, ...changes });
  const setField = (key) => (val) =>
    patch({ fields: { ...content.fields, [key]: val } });
  const setNote = (i) => (val) =>
    patch({ notes: content.notes.map((n, idx) => (idx === i ? val : n)) });
  const setCondition = (i) => (val) =>
    patch({
      conditions: content.conditions.map((c, idx) => (idx === i ? val : c)),
    });
  const setItem = (i, key) => (val) =>
    patch({
      items: content.items.map((it, idx) =>
        idx === i ? { ...it, [key]: val } : it,
      ),
    });
  const removeItem = (i) =>
    patch({ items: content.items.filter((_, idx) => idx !== i) });

  // --- Automatic pagination -----------------------------------------
  // Page 1 holds the header block, the items table, the notes and the
  // first N conditions. When the table grows (more instruments) or text is
  // lengthened, page 1 overflows — so we push conditions to page 2 one at a
  // time until it fits again. Resetting whenever the row count changes lets
  // it pull conditions back when rows are removed.
  const prevRowCount = useRef(content.items.length);
  useEffect(() => {
    if (prevRowCount.current !== content.items.length) {
      prevRowCount.current = content.items.length;
      setSplit(DEFAULT_PAGE1_CONDITIONS);
    }
  }, [content.items.length]);

  useLayoutEffect(() => {
    const el = page1BodyRef.current;
    if (el && el.scrollHeight > el.clientHeight + 1 && split > 0) {
      setSplit((s) => s - 1);
    }
    const el2 = page2BodyRef.current;
    if (el && el2 && onOverflow) {
      // page 1 can only be "really" full once every condition has already
      // been pushed to page 2 and it still doesn't fit
      const p1Full = split === 0 && el.scrollHeight > el.clientHeight + 1;
      const p2Full = el2.scrollHeight > el2.clientHeight + 1;
      onOverflow(p1Full || p2Full);
    }
  });

  const page1Conditions = content.conditions.slice(0, split);
  const page2Conditions = content.conditions.slice(split);

  const renderCondition = (text, absoluteIndex) => (
    <div className="qp-condition" key={absoluteIndex}>
      <span className="qp-condition-no">{absoluteIndex + 1}.</span>
      <Editable
        html={text}
        onChange={setCondition(absoluteIndex)}
        readOnly={readOnly}
        className="qp-condition-text"
      />
    </div>
  );

  const line = (label, key) => (
    <div className="qp-line">
      <span className="qp-label">{label}</span>
      <Editable
        html={content.fields[key]}
        onChange={setField(key)}
        readOnly={readOnly}
        singleLine
        tag="span"
        className="qp-line-value"
      />
    </div>
  );

  return (
    <div className="qp-doc" ref={rootRef}>
      {/* ============================ PAGE 1 ============================ */}
      <section className="qp-page" data-page="1">
        <PageHeader />
        <div className="qp-body" ref={page1BodyRef}>
          <div className="qp-ref">{meta.quotationId}</div>
          <div className="qp-line">
            <span className="qp-label">Date :</span>
            <span className="qp-line-value">{meta.date}</span>
          </div>

          <div className="qp-gap" />
          {line("Company Name :", "companyName")}
          {line("Company Address :", "companyAddress")}
          <div className="qp-gap" />
          {line("Attn :", "contactName")}
          {line("Ref# :", "reference")}

          <div className="qp-gap" />
          <div className="qp-line">
            <span className="qp-label">Re:</span>
            <Editable
              html={content.re}
              onChange={(v) => patch({ re: v })}
              readOnly={readOnly}
              singleLine
              tag="span"
              className="qp-line-value"
            />
          </div>

          <div className="qp-gap" />
          <div>Dear Sir/Madam:</div>
          <div className="qp-gap" />
          <Editable
            html={content.intro}
            onChange={(v) => patch({ intro: v })}
            readOnly={readOnly}
            className="qp-intro"
          />

          <div className="qp-gap" />
          <Editable
            html={content.calibrationOf}
            onChange={(v) => patch({ calibrationOf: v })}
            readOnly={readOnly}
            singleLine
          />

          {/* Items table */}
          <table className="qp-table">
            <thead>
              <tr>
                <th className="qp-col-item">ITEM#</th>
                <th>INSTRUMENTS</th>
                <th className="qp-col-price">UNIT PRICE</th>
              </tr>
            </thead>
            <tbody>
              {content.items.map((it, i) => (
                <tr key={it.id || i}>
                  <td className="qp-col-item">
                    {i + 1}
                    {!readOnly && content.items.length > 1 && (
                      <button
                        type="button"
                        className="qp-row-remove qp-no-print"
                        title="Remove this row"
                        onClick={() => removeItem(i)}
                      >
                        ×
                      </button>
                    )}
                  </td>
                  <td>
                    <Editable
                      html={it.instrument}
                      onChange={setItem(i, "instrument")}
                      readOnly={readOnly}
                      className="qp-cell"
                      placeholder="Instrument description"
                    />
                  </td>
                  <td className="qp-col-price">
                    <Editable
                      html={it.unitPrice}
                      onChange={setItem(i, "unitPrice")}
                      readOnly={readOnly}
                      className="qp-cell qp-cell-price"
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && (
            <button
              type="button"
              className="qp-add-row qp-no-print"
              onClick={() => patch({ items: [...content.items, newItem()] })}
            >
              + Add instrument row
            </button>
          )}

          {/* Notes */}
          <div className="qp-gap" />
          <div className="qp-notes">
            {content.notes.map((n, i) => (
              <div className="qp-note" key={i}>
                <span className="qp-note-no">
                  {i === 0 ? "NOTE:" : ""} {i + 1}.
                </span>
                <Editable
                  html={n}
                  onChange={setNote(i)}
                  readOnly={readOnly}
                  className="qp-note-text"
                />
              </div>
            ))}
          </div>

          {/* Conditions (first part) */}
          <div className="qp-gap" />
          <Editable
            html={content.conditionsTitle}
            onChange={(v) => patch({ conditionsTitle: v })}
            readOnly={readOnly}
            singleLine
          />
          <Editable
            html={content.conditionsSub}
            onChange={(v) => patch({ conditionsSub: v })}
            readOnly={readOnly}
            singleLine
          />
          {page1Conditions.map((c, i) => renderCondition(c, i))}

          {/* Running reference at the bottom of page 1, as in the template */}
          <div className="qp-page1-tail">
            <div className="qp-ref">{meta.quotationId}</div>
            <div className="qp-line">
              <span className="qp-label">Date :</span>
              <span className="qp-line-value">{meta.date}</span>
            </div>
          </div>
        </div>
        <PageFooter page={1} />
      </section>

      {/* ============================ PAGE 2 ============================ */}
      <section className="qp-page" data-page="2">
        <PageHeader />
        <div className="qp-body" ref={page2BodyRef}>
          {page2Conditions.map((c, i) => renderCondition(c, split + i))}

          <div className="qp-gap" />
          <Editable
            html={content.thankYou}
            onChange={(v) => patch({ thankYou: v })}
            readOnly={readOnly}
            singleLine
            className="qp-thanks"
          />

          <div className="qp-signatures">
            <div className="qp-sig-col">
              <div>Prepared by:</div>
              <div className="qp-sig-slot">
                {meta.clerkSignatureUrl && (
                  <img
                    src={meta.clerkSignatureUrl}
                    alt=""
                    crossOrigin="anonymous"
                  />
                )}
              </div>
              <div className="qp-sig-name">{meta.preparedBy}</div>
            </div>
            <div className="qp-sig-col qp-sig-col-right">
              <div>CONFORME</div>
              <div className="qp-sig-slot" />
              <div className="qp-sig-name">{content.fields.contactName}</div>
            </div>
          </div>

          <div className="qp-signatures qp-signatures-admin">
            <div className="qp-sig-col">
              <div className="qp-sig-slot">
                {meta.adminSignatureUrl && (
                  <img
                    src={meta.adminSignatureUrl}
                    alt=""
                    crossOrigin="anonymous"
                  />
                )}
              </div>
              <div>
                Approved by: <span>{meta.approvedBy || ""}</span>
              </div>
            </div>
          </div>
        </div>
        <PageFooter page={2} />
      </section>
    </div>
  );
});

export default QuotationDocument;
