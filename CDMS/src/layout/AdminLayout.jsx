// import { useState } from "react";
// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";
// import RightPanel from "../components/RightPanel";
// import { Outlet, Navigate } from "react-router-dom";

// const AdminLayout = () => {
//   const role = sessionStorage.getItem("role");
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   if (!role) {
//     return <Navigate to="/" replace />;
//   }

//   return (
//     <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
//       <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
//       <div className="layout" style={{ flex: 1, minHeight: 0 }}>
//         <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//         <div
//           className="content"
//           style={{
//             flex: 1,
//             minHeight: 0,
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           <Outlet />
//         </div>
//         <RightPanel />
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";
import { Outlet, Navigate, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const role = sessionStorage.getItem("role");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!role) {
    return <Navigate to="/" replace />;
  }

  // ==========================
  // CHECK IF STILL ACTIVE
  // ==========================
  useEffect(() => {
    const checkActive = setInterval(async () => {
      const username = sessionStorage.getItem("activeUser");
      if (!username) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/active-users`,
        );
        const activeUsers = await res.json();

        if (!activeUsers.includes(username)) {
          // user is no longer active - force logout
          sessionStorage.clear();
          localStorage.removeItem("name");
          localStorage.removeItem("username");
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Active check error:", err);
      }
    }, 35000);

    return () => clearInterval(checkActive);
  }, []);

  // ==========================
  // AFK AUTO LOGOUT
  // ==========================
  useEffect(() => {
    let afkTimer;
    const AFK_TIMEOUT = 10 * 60 * 1000; // ← 10minutes

    const resetTimer = () => {
      clearTimeout(afkTimer);
      afkTimer = setTimeout(async () => {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: sessionStorage.getItem("activeUser"),
              name: sessionStorage.getItem("activeName"),
              role: sessionStorage.getItem("userRole"),
              action: "logged out ",
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
          console.error("AFK logout error:", err);
        } finally {
          sessionStorage.clear();
          localStorage.removeItem("name");
          localStorage.removeItem("username");
          navigate("/", { replace: true });
        }
      }, AFK_TIMEOUT);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(afkTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="layout" style={{ flex: 1, minHeight: 0 }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className="content"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </div>
        <RightPanel />
      </div>
    </div>
  );
};

export default AdminLayout;
