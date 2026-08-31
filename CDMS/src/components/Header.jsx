// import { useEffect, useState } from "react";

// export default function Header({ onMenuToggle, children }) {
//   const [now, setNow] = useState(new Date());

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setNow(new Date());
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // e.g. "Tuesday, August 4, 2026"
//   const dateLabel = now.toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   // e.g. "7:39:58 PM"
//   const timeLabel = now.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     second: "2-digit",
//   });

//   return (
//     <header className="header">
//       <div className="logo">
//         <button className="menu-btn" onClick={onMenuToggle}>
//           <i className="fas fa-bars"></i>☰ Menu
//         </button>
//         <img
//           src="/images/SSSi-Logo.png"
//           alt="SSSI Logo"
//           className="header-logo"
//         />
//         <span>Scientific Standard Services</span>
//       </div>
//       <div
//         className="header-right"
//         style={{ display: "flex", alignItems: "center", gap: 14 }}
//       >
//         {children}
//         <div style={{ textAlign: "right" }}>
//           <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
//             {dateLabel}
//           </div>
//           <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>{timeLabel}</div>
//         </div>
//       </div>
//     </header>
//   );
// }
import { useEffect, useState } from "react";

export default function Header({ onMenuToggle, children }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // e.g. "Tuesday, August 4, 2026"
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // e.g. "7:39:58 PM"
  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="header">
      <div className="logo">
        <button className="menu-btn" onClick={onMenuToggle}>
          <span className="menu-icon">☰</span>
          <span className="menu-label">Menu</span>
        </button>
        <img
          src="/images/SSSi-Logo.png"
          alt="SSSI Logo"
          className="header-logo"
        />
        <span className="header-title">Scientific Standard Services</span>
      </div>
      <div className="header-right">
        {children}
        <div className="header-datetime">
          <div className="header-date">{dateLabel}</div>
          <div className="header-time">{timeLabel}</div>
        </div>
      </div>
    </header>
  );
}
