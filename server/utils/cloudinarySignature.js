const cloudinary = require("../config/cloudinary");

// Maps a person's role to which Cloudinary signature folder to look in.
// Only clerk (preparer) and admin (approver) matter for quotations.
const ROLE_TO_SIGNATURE_FOLDER = {
  clerk: "clerk-signature",
  admin: "sig-signature",
  owner: "sig-signature", // owner approves the same way admin does
};

// Fetches the single signature image inside
// cdms/Signatures/{role}-signature/{username}/ and returns it as a
// Buffer, or null if nothing matches. Uses the Search API (not
// api.resources with a prefix) because this Cloudinary account uses
// Dynamic Folders — folder path is stored as `asset_folder` metadata,
// not encoded into public_id, so prefix-matching never finds anything.
async function getSignatureImageBuffer(role, username) {
  const folderKey = ROLE_TO_SIGNATURE_FOLDER[role];
  if (!folderKey || !username) return null;

  const folderPath = `cdms/Signatures/${folderKey}/${username}`;

  try {
    const result = await cloudinary.search
      .expression(`asset_folder="${folderPath}"`)
      .max_results(1)
      .execute();

    console.log(
      `Signature lookup for ${folderPath}:`,
      result.resources?.length,
      "files found",
    );

    const file = result.resources?.[0];
    if (!file) return null;

    const imageRes = await fetch(file.secure_url);
    if (!imageRes.ok) return null;

    const arrayBuffer = await imageRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error(`Failed to fetch signature for ${role}/${username}:`, err);
    return null;
  }
}

module.exports = { getSignatureImageBuffer };
