const express = require("express");
// Adjust this path to wherever your mailer.js lives.
const { sendEmail } = require("../utils/mailer");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

// POST /api/agreements/send-email
// body: { to, subject, text, filename, pdfBase64 }
router.post("/send-email", async (req, res) => {
  try {
    const { to, subject, text, filename, pdfBase64 } = req.body || {};

    if (typeof to !== "string" || !EMAIL_RE.test(to.trim())) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A valid recipient email is required.",
        });
    }
    if (typeof pdfBase64 !== "string" || !pdfBase64) {
      return res
        .status(400)
        .json({ success: false, message: "The PDF attachment is missing." });
    }

    const pdf = Buffer.from(pdfBase64, "base64");
    if (pdf.length === 0 || pdf.subarray(0, 4).toString() !== "%PDF") {
      return res
        .status(400)
        .json({
          success: false,
          message: "The attachment is not a valid PDF.",
        });
    }
    if (pdf.length > MAX_PDF_BYTES) {
      return res
        .status(413)
        .json({ success: false, message: "The PDF is too large to email." });
    }

    const safeName = String(filename || "Conditions_of_Calibration.pdf")
      .replace(/[^\w.-]+/g, "-")
      .replace(/(\.pdf)?$/i, ".pdf");

    await sendEmail({
      to: to.trim(),
      subject: String(subject || "Conditions of Calibration").slice(0, 200),
      text: String(
        text || "Please find the attached Conditions of Calibration.",
      ),
      attachments: [{ filename: safeName, content: pdf }],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("send agreement email failed:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to send email.",
    });
  }
});

module.exports = router;
