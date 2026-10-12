// Signature images live in Cloudinary (cdms/Signatures/{role}-signature/
// {username}/). Finding them needs the Cloudinary API secret, so the browser
// asks the server: GET /api/signatures/:role/:username -> { url }.
// Returns the image URL, or "" if the person has no signature on file.
export async function fetchSignatureUrl(apiBase, role, username) {
  if (!role || !username) return "";
  try {
    const res = await fetch(
      `${apiBase}/api/signatures/${encodeURIComponent(role)}/${encodeURIComponent(username)}`,
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.url || "";
  } catch (err) {
    console.error("Failed to load signature:", err);
    return "";
  }
}

// The preparer is always a clerk for signature purposes.
export const fetchPreparerSignatureUrl = (apiBase, username) =>
  fetchSignatureUrl(apiBase, "clerk", username);
