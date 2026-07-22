// import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";

// export default function Sidebar({ isOpen, onClose }) {
//   const role = sessionStorage.getItem("role");
//   const navigate = useNavigate();
//   const [showConfirm, setShowConfirm] = useState(false);

//   // ==========================
//   // SAVE LOG HELPER
//   // ==========================
//   async function saveLog(action) {
//     try {
//       await fetch(`${import.meta.env.VITE_API_URL}/api/logs`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: sessionStorage.getItem("activeUser"),
//           name: sessionStorage.getItem("activeName"),
//           role: sessionStorage.getItem("userRole"),
//           action,
//           timestamp: new Date().toISOString(),
//         }),
//       });
//     } catch (err) {
//       console.error("Log error:", err);
//     }
//   }

//   // ==========================
//   // HEARTBEAT
//   // ==========================
//   useEffect(() => {
//     if (!sessionStorage.getItem("activeUser")) return;

//     async function sendHeartbeat() {
//       try {
//         await fetch(`${import.meta.env.VITE_API_URL}/api/heartbeat`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             username: sessionStorage.getItem("activeUser"),
//             name: sessionStorage.getItem("activeName"),
//             role: sessionStorage.getItem("userRole"),
//           }),
//         });
//       } catch (err) {
//         console.error("Heartbeat error:", err);
//       }
//     }
//     sendHeartbeat();
//     const heartbeat = setInterval(sendHeartbeat, 30000);
//     return () => clearInterval(heartbeat);
//   }, []);

//   // ==========================
//   // TAB/BROWSER CLOSE
//   // ==========================
//   useEffect(() => {
//     const handlePageHide = (e) => {
//       if (!sessionStorage.getItem("activeUser")) return;
//       if (e.persisted) return;

//       navigator.sendBeacon(
//         `${import.meta.env.VITE_API_URL}/api/logout`,
//         new Blob(
//           [JSON.stringify({ username: sessionStorage.getItem("activeUser") })],
//           { type: "application/json" },
//         ),
//       );

//       navigator.sendBeacon(
//         `${import.meta.env.VITE_API_URL}/api/logs`,
//         new Blob(
//           [
//             JSON.stringify({
//               username: sessionStorage.getItem("activeUser"),
//               name: sessionStorage.getItem("activeName"),
//               role: sessionStorage.getItem("userRole"),
//               action: "logged out",
//               timestamp: new Date().toISOString(),
//             }),
//           ],
//           { type: "application/json" },
//         ),
//       );
//     };

//     window.addEventListener("pagehide", handlePageHide);
//     return () => window.removeEventListener("pagehide", handlePageHide);
//   }, []);

//   // ==========================
//   // REDIRECT IF SESSION EXPIRED
//   // ==========================
//   useEffect(() => {
//     if (!sessionStorage.getItem("activeUser")) {
//       localStorage.removeItem("name");
//       localStorage.removeItem("username");
//       navigate("/", { replace: true });
//     }
//   }, []);

//   // ==========================
//   // LOGOUT
//   // ==========================
//   async function handleLogout() {
//     try {
//       await fetch(`${import.meta.env.VITE_API_URL}/api/logs`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: sessionStorage.getItem("activeUser"),
//           name: sessionStorage.getItem("activeName"),
//           role: sessionStorage.getItem("userRole"),
//           action: "logged out",
//           timestamp: new Date().toISOString(),
//         }),
//       });

//       await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: sessionStorage.getItem("activeUser"),
//         }),
//       });
//     } catch (err) {
//       console.error("Logout error:", err);
//     } finally {
//       sessionStorage.clear();
//       localStorage.removeItem("name");
//       localStorage.removeItem("username");
//       navigate("/", { replace: true });
//     }
//   }

//   return (
//     <aside className={`sidebar ${isOpen ? "active" : ""}`}>
//       {/* CONFIRM LOGOUT MODAL */}
//       {showConfirm && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100vw",
//             height: "100vh",
//             background: "rgba(0,0,0,0.5)",
//             zIndex: 9999,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <div
//             style={{
//               background: "white",
//               borderRadius: "12px",
//               padding: "28px",
//               width: "320px",
//               textAlign: "center",
//               boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
//             }}
//           >
//             <h3 style={{ margin: "0 0 8px", color: "#18181b" }}>
//               Confirm Logout
//             </h3>
//             <p
//               style={{
//                 color: "#71717a",
//                 fontSize: "0.875rem",
//                 margin: "0 0 20px",
//               }}
//             >
//               Are you sure you want to logout?
//             </p>
//             <div
//               style={{ display: "flex", gap: "8px", justifyContent: "center" }}
//             >
//               <button
//                 onClick={() => setShowConfirm(false)}
//                 style={{
//                   padding: "9px 18px",
//                   background: "#f4f4f5",
//                   border: "1px solid #e4e4e7",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontWeight: "500",
//                   color: "#3f3f46",
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   setShowConfirm(false);
//                   handleLogout();
//                 }}
//                 style={{
//                   padding: "9px 18px",
//                   background: "#18181b",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   color: "white",
//                   fontWeight: "500",
//                 }}
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <nav className="nav-menu">
//         <p className="nav-label">Main Menu</p>
//         {(role === "admin" || role === "owner") && (
//           <Link className="nav-link" to="/admin" onClick={onClose}>
//             Dashboard
//           </Link>
//         )}
//         <Link className="nav-link" to="/admin/customer" onClick={onClose}>
//           Customer
//         </Link>
//         {(role === "admin" || role === "clerk") && (
//           <Link className="nav-link" to="/admin/jobreceipt" onClick={onClose}>
//             Job Receipt
//           </Link>
//         )}
//         <Link className="nav-link" to="/admin/joblist" onClick={onClose}>
//           Job Number List
//         </Link>
//         {(role === "admin" || role === "clerk") && (
//           <Link
//             className="nav-link"
//             to="/admin/instrumenttag"
//             onClick={onClose}
//           >
//             Instrument Tag
//           </Link>
//         )}
//         {(role === "admin" || role === "technician") && (
//           <Link
//             className="nav-link"
//             to="/admin/incomingcalib"
//             onClick={onClose}
//           >
//             Incoming Calibration
//           </Link>
//         )}{" "}
//         {(role === "admin" || role === "technician") && (
//           <Link
//             className="nav-link"
//             to="/admin/ongoinggcalib"
//             onClick={onClose}
//           >
//             On Going Calibration
//           </Link>
//         )}
//         {(role === "admin" || role === "clerk" || role === "typist") && (
//           <Link
//             className="nav-link"
//             to="/admin/sitecalibration"
//             onClick={onClose}
//           >
//             Site Calibration
//           </Link>
//         )}
//         {(role === "admin" || role === "clerk" || role === "typist") && (
//           <Link className="nav-link" to="/admin/fortyping" onClick={onClose}>
//             For Typing
//           </Link>
//         )}
//         {(role === "admin" || role === "technician") && (
//           <Link
//             className="nav-link"
//             to="/admin/forcheckingic"
//             onClick={onClose}
//           >
//             For Checking OIC
//           </Link>
//         )}
//         {(role === "admin" || role === "technician") && (
//           <Link
//             className="nav-link"
//             to="/admin/forcheckingsig"
//             onClick={onClose}
//           >
//             For Checking Sig
//           </Link>
//         )}
//         {(role === "admin" || role === "clerk" || role === "typist") && (
//           <Link className="nav-link" to="/admin/printfinal" onClick={onClose}>
//             Print Final
//           </Link>
//         )}
//         {(role === "admin" || role === "technician") && (
//           <Link
//             className="nav-link"
//             to="/admin/concernincoming"
//             onClick={onClose}
//           >
//             Incoming Concern
//           </Link>
//         )}
//         {(role === "admin" || role === "technician") && (
//           <Link className="nav-link" to="/admin/concernout" onClick={onClose}>
//             Out-Going Concern
//           </Link>
//         )}
//         {(role === "admin" || role === "clerk") && (
//           <Link
//             className="nav-link"
//             to="/admin/deliveryreceipt"
//             onClick={onClose}
//           >
//             Delivery Receipt
//           </Link>
//         )}
//         {(role === "admin" || role === "clerk") && (
//           <Link className="nav-link" to="/admin/recallsys" onClick={onClose}>
//             Recall System
//           </Link>
//         )}
//         {(role === "admin" || role === "clerk") && (
//           <Link
//             className="nav-link"
//             to="/admin/assetmonitoring"
//             onClick={onClose}
//           >
//             Asset Monitoring
//           </Link>
//         )}
//         <Link
//           className="nav-link"
//           to="/admin/standardforcalib"
//           onClick={onClose}
//         >
//           Standard For Calibration
//         </Link>
//         <Link
//           className="nav-link"
//           to="/admin/stdforcertification"
//           onClick={onClose}
//         >
//           Standard For Certification
//         </Link>
//         <Link className="nav-link" to="/admin/stdforupdate" onClick={onClose}>
//           Standard For Update
//         </Link>
//         {(role === "admin" || role === "clerk") && (
//           <Link className="nav-link" to="/admin/qtnlist" onClick={onClose}>
//             Quotation List
//           </Link>
//         )}
//         {(role === "admin" || role === "clerk") && (
//           <Link className="nav-link" to="/admin/qtnforcheck" onClick={onClose}>
//             Quotation For Check
//           </Link>
//         )}
//         <Link className="nav-link" to="/admin/qtnforfile" onClick={onClose}>
//           Quotation For File
//         </Link>
//         {(role === "admin" || role === "clerk") && (
//           <Link
//             className="nav-link"
//             to="/admin/qtnforfolowup"
//             onClick={onClose}
//           >
//             Quotation For Follow Up
//           </Link>
//         )}
//         {(role === "admin" || role === "clerk") && (
//           <Link className="nav-link" to="/admin/qtnforsend" onClick={onClose}>
//             Quotation For Send
//           </Link>
//         )}
//         <Link className="nav-link" to="/admin/schedmonitor" onClick={onClose}>
//           Schedule Monitor
//         </Link>
//         {(role === "admin" || role === "owner") && (
//           <Link className="nav-link" to="/admin/accounts" onClick={onClose}>
//             Accounts
//           </Link>
//         )}
//         {(role === "admin" || role === "owner") && (
//           <Link
//             className="nav-link"
//             to="/admin/systemactivity"
//             onClick={onClose}
//           >
//             System Activity
//           </Link>
//         )}
//       </nav>

//       <div className="sidebar-footer">
//         <div
//           className="user-display"
//           style={{
//             color: "white",
//             fontWeight: "bold",
//             display: "flex",
//             alignItems: "center",
//             gap: "10px",
//           }}
//         >
//           <i className="fas fa-user-circle" style={{ fontSize: "1.4rem" }}></i>
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               lineHeight: 1.3,
//             }}
//           >
//             <span>{sessionStorage.getItem("activeName") || "User"}</span>
//             <span
//               style={{
//                 fontSize: "0.72rem",
//                 fontWeight: "600",
//                 color: "#facc15",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.03em",
//               }}
//             >
//               {sessionStorage.getItem("userRole") || "—"}
//             </span>
//           </div>
//         </div>
//         <a className="nav-link logout" onClick={() => setShowConfirm(true)}>
//           <i className="fas fa-sign-out-alt"></i>
//           Logout
//         </a>
//       </div>
//     </aside>
//   );
// }
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar({ isOpen, onClose }) {
  const role = sessionStorage.getItem("role");
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAutoLogoutModal, setShowAutoLogoutModal] = useState(false); // ← new

  // ==========================
  // SAVE LOG HELPER
  // ==========================
  async function saveLog(action) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: sessionStorage.getItem("activeUser"),
          name: sessionStorage.getItem("activeName"),
          role: sessionStorage.getItem("userRole"),
          action,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Log error:", err);
    }
  }

  // ==========================
  // HEARTBEAT
  // ==========================
  useEffect(() => {
    if (!sessionStorage.getItem("activeUser")) return;

    let heartbeat; // ← declared here so it can be cleared from inside sendHeartbeat

    async function sendHeartbeat() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/heartbeat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: sessionStorage.getItem("activeUser"),
              name: sessionStorage.getItem("activeName"),
              role: sessionStorage.getItem("userRole"),
            }),
          },
        );
        const data = await res.json();

        if (data.loggedOut) {
          clearInterval(heartbeat); // stop pinging, session is already dead server-side
          setShowAutoLogoutModal(true); // ← trigger the popup
        }
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    }

    sendHeartbeat();
    heartbeat = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(heartbeat);
  }, []);

  // ==========================
  // TAB/BROWSER CLOSE
  // ==========================
  useEffect(() => {
    const handlePageHide = (e) => {
      if (!sessionStorage.getItem("activeUser")) return;
      if (e.persisted) return;

      navigator.sendBeacon(
        `${import.meta.env.VITE_API_URL}/api/logout`,
        new Blob(
          [JSON.stringify({ username: sessionStorage.getItem("activeUser") })],
          { type: "application/json" },
        ),
      );

      navigator.sendBeacon(
        `${import.meta.env.VITE_API_URL}/api/logs`,
        new Blob(
          [
            JSON.stringify({
              username: sessionStorage.getItem("activeUser"),
              name: sessionStorage.getItem("activeName"),
              role: sessionStorage.getItem("userRole"),
              action: "logged out",
              timestamp: new Date().toISOString(),
            }),
          ],
          { type: "application/json" },
        ),
      );
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  // ==========================
  // REDIRECT IF SESSION EXPIRED
  // ==========================
  useEffect(() => {
    if (!sessionStorage.getItem("activeUser")) {
      localStorage.removeItem("name");
      localStorage.removeItem("username");
      navigate("/", { replace: true });
    }
  }, []);

  // ==========================
  // LOGOUT
  // ==========================
  async function handleLogout() {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: sessionStorage.getItem("activeUser"),
          name: sessionStorage.getItem("activeName"),
          role: sessionStorage.getItem("userRole"),
          action: "logged out",
          timestamp: new Date().toISOString(),
        }),
      });

      await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: sessionStorage.getItem("activeUser"),
        }),
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      sessionStorage.clear();
      localStorage.removeItem("name");
      localStorage.removeItem("username");
      navigate("/", { replace: true });
    }
  }

  // ==========================
  // AUTO-LOGOUT CONFIRM (OK button on the popup)
  // ==========================
  function handleAutoLogoutConfirm() {
    sessionStorage.clear();
    localStorage.removeItem("name");
    localStorage.removeItem("username");
    setShowAutoLogoutModal(false);
    navigate("/", { replace: true });
  }

  return (
    <aside className={`sidebar ${isOpen ? "active" : ""}`}>
      {/* CONFIRM LOGOUT MODAL */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "28px",
              width: "320px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#18181b" }}>
              Confirm Logout
            </h3>
            <p
              style={{
                color: "#71717a",
                fontSize: "0.875rem",
                margin: "0 0 20px",
              }}
            >
              Are you sure you want to logout?
            </p>
            <div
              style={{ display: "flex", gap: "8px", justifyContent: "center" }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "9px 18px",
                  background: "#f4f4f5",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  color: "#3f3f46",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleLogout();
                }}
                style={{
                  padding: "9px 18px",
                  background: "#18181b",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO-LOGOUT MODAL */}
      {showAutoLogoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "28px",
              width: "320px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#18181b" }}>
              Session Expired
            </h3>
            <p
              style={{
                color: "#71717a",
                fontSize: "0.875rem",
                margin: "0 0 20px",
              }}
            >
              You have been logged out due to inactivity.
            </p>
            <button
              onClick={handleAutoLogoutConfirm}
              style={{
                padding: "9px 24px",
                background: "#18181b",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: "white",
                fontWeight: "500",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <nav className="nav-menu">
        <p className="nav-label">Main Menu</p>
        {(role === "admin" || role === "owner") && (
          <Link className="nav-link" to="/admin" onClick={onClose}>
            Dashboard
          </Link>
        )}
        <Link className="nav-link" to="/admin/customer" onClick={onClose}>
          Customer
        </Link>
        {(role === "admin" || role === "clerk") && (
          <Link className="nav-link" to="/admin/jobreceipt" onClick={onClose}>
            Job Receipt
          </Link>
        )}
        <Link className="nav-link" to="/admin/joblist" onClick={onClose}>
          Job Number List
        </Link>
        {(role === "admin" || role === "clerk") && (
          <Link
            className="nav-link"
            to="/admin/instrumenttag"
            onClick={onClose}
          >
            Instrument Tag
          </Link>
        )}
        {(role === "admin" || role === "technician") && (
          <Link
            className="nav-link"
            to="/admin/incomingcalib"
            onClick={onClose}
          >
            Incoming Calibration
          </Link>
        )}{" "}
        {(role === "admin" || role === "technician") && (
          <Link
            className="nav-link"
            to="/admin/ongoinggcalib"
            onClick={onClose}
          >
            On Going Calibration
          </Link>
        )}
        {(role === "admin" || role === "clerk" || role === "typist") && (
          <Link
            className="nav-link"
            to="/admin/sitecalibration"
            onClick={onClose}
          >
            Site Calibration
          </Link>
        )}
        {(role === "admin" || role === "clerk" || role === "typist") && (
          <Link className="nav-link" to="/admin/fortyping" onClick={onClose}>
            For Typing
          </Link>
        )}
        {(role === "admin" || role === "technician") && (
          <Link
            className="nav-link"
            to="/admin/forcheckingic"
            onClick={onClose}
          >
            For Checking OIC
          </Link>
        )}
        {(role === "admin" || role === "technician") && (
          <Link
            className="nav-link"
            to="/admin/forcheckingsig"
            onClick={onClose}
          >
            For Checking Sig
          </Link>
        )}
        {(role === "admin" || role === "clerk" || role === "typist") && (
          <Link className="nav-link" to="/admin/printfinal" onClick={onClose}>
            Print Final
          </Link>
        )}
        {(role === "admin" || role === "technician") && (
          <Link
            className="nav-link"
            to="/admin/concernincoming"
            onClick={onClose}
          >
            Incoming Concern
          </Link>
        )}
        {(role === "admin" || role === "technician") && (
          <Link className="nav-link" to="/admin/concernout" onClick={onClose}>
            Out-Going Concern
          </Link>
        )}
        {(role === "admin" || role === "clerk") && (
          <Link
            className="nav-link"
            to="/admin/deliveryreceipt"
            onClick={onClose}
          >
            Delivery Receipt
          </Link>
        )}
        {(role === "admin" || role === "clerk") && (
          <Link className="nav-link" to="/admin/recallsys" onClick={onClose}>
            Recall System
          </Link>
        )}
        {(role === "admin" || role === "clerk") && (
          <Link
            className="nav-link"
            to="/admin/assetmonitoring"
            onClick={onClose}
          >
            Asset Monitoring
          </Link>
        )}
        <Link
          className="nav-link"
          to="/admin/standardforcalib"
          onClick={onClose}
        >
          Standard For Calibration
        </Link>
        <Link
          className="nav-link"
          to="/admin/stdforcertification"
          onClick={onClose}
        >
          Standard For Certification
        </Link>
        <Link className="nav-link" to="/admin/stdforupdate" onClick={onClose}>
          Standard For Update
        </Link>
        {(role === "admin" || role === "clerk") && (
          <Link className="nav-link" to="/admin/qtnlist" onClick={onClose}>
            Quotation List
          </Link>
        )}
        {(role === "admin" || role === "clerk") && (
          <Link className="nav-link" to="/admin/qtnforcheck" onClick={onClose}>
            Quotation For Check
          </Link>
        )}
        <Link className="nav-link" to="/admin/qtnforfile" onClick={onClose}>
          Quotation For File
        </Link>
        {(role === "admin" || role === "clerk") && (
          <Link
            className="nav-link"
            to="/admin/qtnforfolowup"
            onClick={onClose}
          >
            Quotation For Follow Up
          </Link>
        )}
        {(role === "admin" || role === "clerk") && (
          <Link className="nav-link" to="/admin/qtnforsend" onClick={onClose}>
            Quotation For Send
          </Link>
        )}
        <Link className="nav-link" to="/admin/schedmonitor" onClick={onClose}>
          Schedule Monitor
        </Link>
        {(role === "admin" || role === "owner") && (
          <Link className="nav-link" to="/admin/accounts" onClick={onClose}>
            Accounts
          </Link>
        )}
        {(role === "admin" || role === "owner") && (
          <Link
            className="nav-link"
            to="/admin/systemactivity"
            onClick={onClose}
          >
            System Activity
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <div
          className="user-display"
          style={{
            color: "white",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <i className="fas fa-user-circle" style={{ fontSize: "1.4rem" }}></i>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.3,
            }}
          >
            <span>{sessionStorage.getItem("activeName") || "User"}</span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: "600",
                color: "#facc15",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {sessionStorage.getItem("userRole") || "—"}
            </span>
          </div>
        </div>
        <a className="nav-link logout" onClick={() => setShowConfirm(true)}>
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </a>
      </div>
    </aside>
  );
}
