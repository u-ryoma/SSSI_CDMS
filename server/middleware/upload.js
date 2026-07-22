const multer = require("multer");

// Memory storage — file arrives as a Buffer on req.file.buffer, never
// written to disk. Necessary because Render's filesystem is ephemeral
// (wiped on every redeploy/restart), so disk storage would silently lose
// files. The buffer is streamed straight to Cloudinary in the route.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB cap per file
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // legacy .xls
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // legacy .doc
      "application/pdf",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type: " + file.mimetype), false);
    }
  },
});

module.exports = upload;
