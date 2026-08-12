import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { encodeStandardQr } from "./StandardQrCode";

/**
 * StandardQrCodeDisplay
 *
 * Renders a calibration standard's QR code (encoding the full record via
 * encodeStandardQr) plus Download/Print actions. Used both as a live
 * preview inside the Add/Edit Asset modal and inside
 * PrintStandardQrModal for the "Print Label" flow from the Asset
 * Monitoring table.
 */
const StandardQrCodeDisplay = ({ standard, size = 160 }) => {
  const wrapperRef = useRef(null);

  const handleDownload = () => {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${standard.code || "standard"}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank", "width=400,height=500");
    if (!win) return; // popup blocked
    win.document.write(`
      <html>
        <head><title>${standard.code || "Standard"} Label</title></head>
        <body style="text-align:center;font-family:sans-serif;">
          <img src="${dataUrl}" />
          <p>${standard.code || ""}</p>
          <p>${standard.assetNo || ""} — ${standard.description || ""}</p>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  if (!standard?.code) {
    return (
      <div className="std-qr-empty">Enter/save a Code to generate a QR.</div>
    );
  }

  return (
    <div className="std-qr-wrapper">
      <div ref={wrapperRef}>
        <QRCodeCanvas value={encodeStandardQr(standard)} size={size} />
      </div>
      <div className="std-qr-actions">
        <button type="button" onClick={handleDownload}>
          Download
        </button>
        <button type="button" onClick={handlePrint}>
          Print Label
        </button>
      </div>
    </div>
  );
};

export default StandardQrCodeDisplay;
