// const multer = require("multer");

// // Memory storage — file arrives as a Buffer on req.file.buffer, never
// // written to disk. Necessary because Render's filesystem is ephemeral
// // (wiped on every redeploy/restart), so disk storage would silently lose
// // files. The buffer is streamed straight to Cloudinary in the route.
// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 15 * 1024 * 1024 }, // 15MB cap per file
//   fileFilter: (req, file, cb) => {
//     const allowed = [
//       "image/jpeg",
//       "image/png",
//       "image/webp",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
//       "application/vnd.ms-excel", // legacy .xls
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
//       "application/msword", // legacy .doc
//       "application/pdf",
//     ];
//     if (allowed.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Unsupported file type: " + file.mimetype), false);
//     }
//   },
// });

// module.exports = upload;
const multer = require("multer");
const path = require("path");

// Memory storage — file arrives as a Buffer on req.file.buffer, never
// written to disk. Necessary because Render's filesystem is ephemeral
// (wiped on every redeploy/restart), so disk storage would silently lose
// files. The buffer is streamed straight to Cloudinary in the route.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // legacy .xls
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // legacy .doc
  "application/pdf",
  "application/json", // .json (For Typing auto-backup)
];

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB cap per file
  fileFilter: (req, file, cb) => {
    // Some browsers send .json with an empty or octet-stream MIME type,
    // so also accept it by extension.
    const isJsonByName =
      path.extname(file.originalname || "").toLowerCase() === ".json";

    if (ALLOWED_MIME_TYPES.includes(file.mimetype) || isJsonByName) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type: " + file.mimetype), false);
    }
  },
});

module.exports = upload;
