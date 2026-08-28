const express = require("express");
const {
  heartbeats,
  userInfo,
  forceLogout,
} = require("../services/presenceService");

const router = express.Router();

router.post("/heartbeat", (req, res) => {
  const { username, name, role, active } = req.body;

  // Always check for a forced logout first, regardless of activity —
  // this is what lets an idle user's tab discover it's been logged out
  // and show the modal.
  if (forceLogout.has(username)) {
    forceLogout.delete(username);
    return res.json({ success: true, loggedOut: true });
  }

  // Only renew the "last seen" timestamp if the user was actually active.
  // This is what lets a truly idle user's heartbeat go stale and get
  // swept, even though their tab keeps polling.
  if (active) {
    heartbeats[username] = Date.now();
    if (name) userInfo[username] = { name, role };
  }

  res.json({ success: true, loggedOut: false });
});

router.get("/active-users", (req, res) => {
  const now = Date.now();
  const activeUsers = Object.entries(heartbeats)
    .filter(([_, lastSeen]) => now - lastSeen < 60000)
    .map(([username]) => username);
  res.json(activeUsers);
});

router.post("/logout", (req, res) => {
  const { username } = req.body;
  delete heartbeats[username];
  forceLogout.delete(username);
  res.json({ success: true });
});

module.exports = router;
