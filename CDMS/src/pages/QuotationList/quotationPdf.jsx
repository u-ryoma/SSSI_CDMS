import React, { createRef } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QuotationDocument from "./QuotationDocument";
import { normalizeContent } from "./quotationTemplateDefaults";

// npm i html2canvas jspdf

const waitFrames = (n = 2) =>
  new Promise((resolve) => {
    const tick = (left) =>
      left <= 0 ? resolve() : requestAnimationFrame(() => tick(left - 1));
    tick(n);
  });

const waitForImages = (root) =>
  Promise.all(
    Array.from(root.querySelectorAll("img")).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = img.onerror = res;
          }),
    ),
  );

/**
 * Captures every `.qp-page` inside `rootEl` into a Letter-size PDF.
 * Returns a Blob.
 */
export async function documentElementToPdfBlob(rootEl) {
  const pages = Array.from(rootEl.querySelectorAll(".qp-page"));
  if (pages.length === 0) throw new Error("No quotation pages to export");

  if (document.fonts?.ready) await document.fonts.ready;
  await waitForImages(rootEl);

  rootEl.classList.add("qp-capturing");
  try {
    await waitFrames(2);
    const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
    const pageW = pdf.internal.pageSize.getWidth(); // 612
    const pageH = pdf.internal.pageSize.getHeight(); // 792

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      if (i > 0) pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        pageW,
        pageH,
      );
    }
    return pdf.output("blob");
  } finally {
    rootEl.classList.remove("qp-capturing");
  }
}

/**
 * Builds the PDF straight from a saved quotation record — no modal needed.
 * Call this from the checker / "For Sending" action:
 *
 *   const blob = await renderQuotationPdfBlob(quotation);
 *   // then PUT it to your backend, see uploadQuotationPdf() below
 *
 * `quotation` is the record from GET /api/quotations/:id, i.e. it has
 * quotationId, date, companyName, address, contactName, reference,
 * preparedBy, quotationContent, and optionally approvedBy /
 * clerkSignatureUrl / adminSignatureUrl.
 */
export async function renderQuotationPdfBlob(quotation) {
  const content = normalizeContent(quotation.quotationContent, {
    companyName: quotation.companyName,
    companyAddress: quotation.address,
    contactName: quotation.contactName,
    reference: quotation.reference,
  });

  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:816px;pointer-events:none;";
  document.body.appendChild(host);
  const root = createRoot(host);
  const docRef = createRef();

  try {
    root.render(
      <QuotationDocument
        ref={docRef}
        readOnly
        content={content}
        meta={{
          quotationId: quotation.quotationId,
          date: formatQuotationDate(quotation.date),
          preparedBy: quotation.preparedBy,
          approvedBy: quotation.approvedBy,
          clerkSignatureUrl: quotation.clerkSignatureUrl,
          adminSignatureUrl: quotation.adminSignatureUrl,
        }}
      />,
    );
    // let React commit + the pagination layout-effect settle
    await waitFrames(4);
    return await documentElementToPdfBlob(docRef.current);
  } finally {
    root.unmount();
    host.remove();
  }
}

// Same MM/DD/YYYY format the modal shows.
export function formatQuotationDate(value) {
  const d = value ? new Date(value) : new Date();
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Convenience: render + upload in one call. Endpoint name is a suggestion —
 * see the backend notes. Returns the updated quotation from the server.
 */
export async function uploadQuotationPdf(apiBase, quotation) {
  const blob = await renderQuotationPdfBlob(quotation);
  const fd = new FormData();
  fd.append("file", blob, `${quotation.quotationId.replace(/\//g, "-")}.pdf`);
  const res = await fetch(
    `${apiBase}/api/quotations/${encodeURIComponent(quotation.quotationId)}/upload-pdf`,
    { method: "PUT", body: fd },
  );
  if (!res.ok) throw new Error("Failed to upload quotation PDF");
  const result = await res.json();
  if (!result.success) throw new Error("Failed to upload quotation PDF");
  return result.quotation;
}
