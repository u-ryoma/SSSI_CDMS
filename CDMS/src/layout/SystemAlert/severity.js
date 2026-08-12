import { AlertOctagon, AlertTriangle, Info } from "lucide-react";

export const SEVERITY = {
  critical: {
    label: "Critical",
    color: "#e94b4b", // used for icons/badges on white surfaces (modal, manage list)
    tint: "#fdecec", // light chip background on white surfaces
    bg: "#c9302c", // solid ticker banner background
    text: "#ffffff", // readable on top of bg
    divider: "rgba(255,255,255,0.35)",
    icon: AlertOctagon,
  },
  warning: {
    label: "Warning",
    color: "#e8a53c",
    tint: "#fdf3e3",
    bg: "#f0ad4e",
    text: "#3a2a06", // dark text — white fails contrast on this amber
    divider: "rgba(0,0,0,0.22)",
    icon: AlertTriangle,
  },
  info: {
    label: "Info",
    color: "#2f6fed",
    tint: "#eaf1fe",
    bg: "#2f6fed",
    text: "#ffffff",
    divider: "rgba(255,255,255,0.35)",
    icon: Info,
  },
};
