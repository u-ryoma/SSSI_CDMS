const { getDb } = require("../config/db");

// In-memory "who is online" bookkeeping — same simple module-level state
// as the original single-file server. This is ephemeral presence info,
// not persisted data, so it doesn't need its own DB collection.
const heartbeats = {};
const userInfo = {};
const forceLogout = new Set(); // track who got auto logged out

const HEARTBEAT_TIMEOUT_MS = 60000;
const SWEEP_INTERVAL_MS = 30000;

// Sweeps every 30s for users whose heartbeat has gone stale (60s+) and
// force-logs them out, writing a "logged out" entry to the logs collection.
function startAutoLogoutJob() {
  setInterval(async () => {
    const now = Date.now();
    for (const [username, lastSeen] of Object.entries(heartbeats)) {
      if (now - lastSeen >= HEARTBEAT_TIMEOUT_MS) {
        try {
          const db = getDb();
          await db.collection("logs").insertOne({
            username,
            name: userInfo[username]?.name || username,
            role: userInfo[username]?.role || "unknown",
            action: "logged out",
            timestamp: new Date().toISOString(),
          });
          console.log(`Auto logged out: ${username}`);
        } catch (err) {
          console.error("Auto logout log error:", err);
        }
        forceLogout.add(username); // mark so next heartbeat/check tells the frontend
        delete heartbeats[username];
        delete userInfo[username];
      }
    }
  }, SWEEP_INTERVAL_MS);
}

module.exports = {
  heartbeats,
  userInfo,
  forceLogout,
  startAutoLogoutJob,
  HEARTBEAT_TIMEOUT_MS,
};
