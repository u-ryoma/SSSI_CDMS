const { getDb } = require("../config/db");

/**
 * Writes one entry to the "logs" collection (the one the System Activity
 * page reads). Same fields as the login/logout entries, plus module, type
 * and details. Timestamp stays an ISO string, like the login entries.
 */
async function logActivity({
  username = "unknown",
  name = "",
  role = "",
  action,
  module = "System",
  type = "other", // login | logout | create | update | delete | other
  details = "",
  ip = "",
}) {
  try {
    await getDb().collection("logs").insertOne({
      username,
      name,
      role,
      action,
      module,
      type,
      details,
      ip,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // logging must never break the actual request
    console.error("logActivity failed:", err.message);
  }
}

module.exports = { logActivity };
