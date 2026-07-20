const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");

// ==========================
// EQUIPMENT PHOTO UPLOAD
// ==========================
// Called from CameraCaptureModal.jsx at capture time — before the job
// number document necessarily exists yet, since Save happens after the
// photo is taken. jobNumber is used purely as a Cloudinary folder key
// (e.g. "SSS/0001/26" or "pending_<timestamp>" if not yet reserved), NOT
// as a lookup into the jobnumbers collection. The frontend is responsible
// for taking the returned url and storing it on jobForm.photoUrl, which
// then gets saved to Mongo as part of the normal job number save flow.
router.post(
  "/equipment-photo/:jobNumber",
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No photo received" });
      }

      const jobNumber = decodeURIComponent(req.params.jobNumber);

      const result = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: "image",
        folder: `cdms/equipment-photos/${jobNumber}`,
        publicId: `photo_${Date.now()}`,
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error("Equipment photo upload failed:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
