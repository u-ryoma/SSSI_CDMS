// Simple header-based role gate (mirrors the inline check that used to
// live directly in the upload-signed route). Reads role off the
// `x-user-role` header since this app doesn't have real session-based
// auth yet.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.headers["x-user-role"])) {
      return res
        .status(403)
        .json({ success: false, message: "Checker role required" });
    }
    next();
  };
}

module.exports = { requireRole };
