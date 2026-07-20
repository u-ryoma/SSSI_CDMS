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
 * @returns {Promise<Object>} Cloudinary upload result (secure_url, public_id, etc.)
 */
function uploadBufferToCloudinary(buffer, { resourceType, folder, publicId }) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        public_id: publicId,
        overwrite: true, // lets a stage's file be replaced on re-upload
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
