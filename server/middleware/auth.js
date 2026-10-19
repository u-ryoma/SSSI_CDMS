const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not logged in." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Session expired. Please log in again.",
    });
  }
};

const requireRole =
  (...roles) =>
  (req, res, next) => {
    const role = String(req.user?.role || "").toLowerCase();
    if (!roles.includes(role)) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required." });
    }
    next();
  };

module.exports = { requireAuth, requireRole };
