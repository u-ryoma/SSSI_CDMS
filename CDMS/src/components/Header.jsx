import { useEffect, useState } from "react";

export default function Header({ onMenuToggle }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <button className="menu-btn" onClick={onMenuToggle}>
          <i className="fas fa-bars"></i>
          <button className="menu-btn" onClick={onMenuToggle}>
            ☰ Menu
          </button>
        </button>
        <i className="fas fa-microscope"></i>
        <span>Scientific Standard Services</span>
      </div>
      <div className="header-right">{time}</div>
    </header>
  );
}
