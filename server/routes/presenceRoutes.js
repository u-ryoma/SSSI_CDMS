const express = require("express");
const { heartbeats, userInfo, forceLogout } = require("../services/presenceService");

const router = express.Router();

router.post("/heartbeat", (req, res) => {
  const { username, name, role } = req.body;

  // If this user was force-logged-out, tell the frontend and don't revive them
  if (forceLogout.has(username)) {
    forceLogout.delete(username); // clear it so a fresh login later isn't blocked
    return res.json({ success: true, loggedOut: true });
  }

  heartbeats[username] = Date.now();
  if (name) userInfo[username] = { name, role };
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
