const express = require("express");
const { getSignatureImageUrl } = require("../utils/cloudinarySignature");

const router = express.Router();

// GET /api/signatures/:role/:username -> { url }
// url is "" when the person has no signature on file.
router.get("/:role/:username", async (req, res) => {
  try {
    const url = await getSignatureImageUrl(
      req.params.role,
      req.params.username,
    );
    res.json({ url });
  } catch (err) {
    console.error("Signature route failed:", err);
    res.json({ url: "" });
  }
});

module.exports = router;
