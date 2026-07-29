// const cloudinary = require("../config/cloudinary");
// const streamifier = require("streamifier");

// /**
//  * Uploads a buffer (from multer memoryStorage) to Cloudinary.
//  *
//  * @param {Buffer} buffer - file buffer from req.file.buffer
//  * @param {Object} options
//  * @param {"image"|"raw"} options.resourceType - "image" for photos/signatures,
//  *        "raw" for xlsx/xls calibration files
//  * @param {string} options.folder - e.g. "cdms/equipment-photos/SSS/0001/26"
//  * @param {string} [options.publicId] - optional custom filename (no extension needed)
//  * @param {boolean} [options.invalidate] - bust CDN cache on overwrite so a
//  *        replaced file (e.g. same publicId re-uploaded) shows up immediately
//  *        instead of a stale cached version lingering. Defaults to true
//  *        whenever a publicId is given, since that's the overwrite case.
//  * @returns {Promise<Object>} Cloudinary upload result (secure_url, public_id, etc.)
//  */
// function uploadBufferToCloudinary(
//   buffer,
//   { resourceType, folder, publicId, invalidate },
// ) {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         resource_type: resourceType,
//         folder,
//         public_id: publicId,
//         overwrite: true, // lets a stage's file be replaced on re-upload
//         invalidate: invalidate ?? Boolean(publicId),
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       },
//     );
//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// }

// module.exports = { uploadBufferToCloudinary };
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * Uploads a buffer (from multer memoryStorage) to Cloudinary.
 *
 * @param {Buffer} buffer - file buffer from req.file.buffer
 * @param {Object} options
 * @param {"image"|"raw"} options.resourceType - "image" for photos/signatures,
 *        "raw" for xlsx/xls calibration files
 * @param {string} options.folder - e.g. "cdms/equipment-photos/SSS/0001/26"
 * @param {string} [options.publicId] - optional custom filename (no extension needed)
 * @param {boolean} [options.invalidate] - bust CDN cache on overwrite so a
 *        replaced file (e.g. same publicId re-uploaded) shows up immediately
 *        instead of a stale cached version lingering. Defaults to true
 *        whenever a publicId is given, since that's the overwrite case.
 * @returns {Promise<Object>} Cloudinary upload result (secure_url, public_id, etc.)
 */
function uploadBufferToCloudinary(
  buffer,
  { resourceType, folder, publicId, invalidate },
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        public_id: publicId,
        overwrite: true, // lets a stage's file be replaced on re-upload
        invalidate: invalidate ?? Boolean(publicId),
        // Explicitly disable Cloudinary's filename-uniquification. When a
        // publicId is passed in, we ALWAYS want that exact public_id used
        // — never a randomized "_vxbc8c"-style suffix appended on top of
        // it, and never a public_id derived from the original uploaded
        // filename instead. Without these two flags this is Cloudinary's
        // implicit default behavior (which, for an explicit public_id,
        // should already be a no-op) — but making it explicit removes any
        // ambiguity and protects against exactly the "duplicate file
        // instead of overwrite" symptom this was added to rule out.
        unique_filename: false,
        use_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

module.exports = { uploadBufferToCloudinary };
