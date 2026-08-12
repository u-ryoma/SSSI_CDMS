// StandardQrCode.js
//
// Single source of truth for what goes into a calibration standard's QR
// code, so the generator (StandardQrCodeDisplay / Asset Monitoring) and
// the reader (CalibrationStandardLookupModal's camera scanner) never
// drift out of sync on field names or shape.

const QR_FIELDS = [
  "code",
  "assetNo",
  "description",
  "serialNo",
  "remarks",
  "status",
  "dateCal",
  "dateDue",
];

export const encodeStandardQr = (standard) => {
  const payload = { v: 1 };
  QR_FIELDS.forEach((key) => {
    payload[key] = standard[key] ?? "";
  });
  return JSON.stringify(payload);
};

export const decodeStandardQr = (text) => {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || !data.code) return null;
    const standard = { id: data.code };
    QR_FIELDS.forEach((key) => {
      standard[key] = data[key] ?? "";
    });
    return standard;
  } catch {
    return null;
  }
};
