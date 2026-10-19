import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// import './index.css'
import App from "./App.jsx";
import { installStatsRefreshOnWrites } from "./utils/statsRefresh";
import installFetchHeaders from "./utils/installFetchHeaders";

// Adds the logged-in user's details to every API request so the System
// Activity page can show who did what. Installed first so the stats
// refresh wrapper below sits on top of it.
installFetchHeaders();
installStatsRefreshOnWrites();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
