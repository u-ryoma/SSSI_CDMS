import React, { useEffect, useRef, useState } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";

// A self-contained "take a photo" modal. Give it onCapture({ dataUrl, blob })
// and onClose(); it handles requesting the camera, showing a live preview,
// and letting the user snap + retake. It does NOT upload anything itself —
// it just hands the parent a preview image plus the raw blob, so the
// parent can decide when (and whether) to actually upload, e.g. only once
// the user hits Save.
const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState("");

  // Start the camera stream whenever the modal opens; always release it
  // (stop all tracks) on close/unmount so the camera light actually turns
  // off and the device isn't left locked to this tab.
  useEffect(() => {
    if (!isOpen) return;

    setCapturedImage(null);
    setCameraError("");

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraError(
          "Couldn't access the camera. Please check permissions and try again.",
        );
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvasRef.current = canvas;

    // JPEG at 0.8 quality keeps a typical photo well under ~300-500KB.
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => setCapturedImage(null);

  // Hand the preview + raw blob up to the parent. Nothing is uploaded
  // here — the parent decides when to actually upload (e.g. on Save).
  const handleUsePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas || !capturedImage) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture({ dataUrl: capturedImage, blob });
      },
      "image/jpeg",
      0.8,
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title="ASSET PHOTO CAPTURE"
          subtitleBottom="Camera"
          onClose={onClose}
        />

        <div style={styles.body}>
          {cameraError ? (
            <div style={styles.error}>{cameraError}</div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" style={styles.preview} />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.preview}
            />
          )}
        </div>

        <div style={styles.actions}>
          {!cameraError && !capturedImage && (
            <button
              type="button"
              style={styles.primaryBtn}
              onClick={handleCapture}
            >
              Capture
            </button>
          )}
          {!cameraError && capturedImage && (
            <>
              <button
                type="button"
                style={styles.outlineBtn}
                onClick={handleRetake}
              >
                Retake
              </button>
              <button
                type="button"
                style={styles.primaryBtn}
                onClick={handleUsePhoto}
              >
                Use Photo
              </button>
            </>
          )}
          <button type="button" style={styles.outlineBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: 8,
    width: "min(500px, 90vw)",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  body: {
    background: "#000",
    minHeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    width: "100%",
    maxHeight: 400,
    objectFit: "contain",
    display: "block",
  },
  error: {
    color: "#fff",
    padding: 24,
    textAlign: "center",
  },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    padding: 12,
    background: "#f5f5f5",
  },
  primaryBtn: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 500,
  },
  outlineBtn: {
    background: "#fff",
    color: "#111",
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 500,
  },
};

export default CameraModal;
