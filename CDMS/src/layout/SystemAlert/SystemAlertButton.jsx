import React, { useState } from "react";
import { Megaphone } from "lucide-react";
import SystemAlertModal from "./SystemAlertModal";

export default function SystemAlertButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button style={styles.btn} onClick={() => setOpen(true)}>
        <Megaphone size={15} />
        System alert
      </button>
      <SystemAlertModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = {
  btn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "#c9302c",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Inter, -apple-system, sans-serif",
  },
};
