import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// Camera capture modal — tries getUserMedia first (works in desktop and
// mobile browsers, gives a live preview + retake). If that's unavailable
// or denied, falls back to a plain file input with capture="environment",
// which most mobile browsers turn into a direct "open camera app" action.
const CameraCaptureModal = ({ onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState("loading"); // loading | live | preview | fallback
  const [snapshot, setSnapshot] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setMode("loading");
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia not supported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode("live");
    } catch (err) {
      console.warn("Camera unavailable, falling back to file input:", err);
      setErrorMsg(
        "Live camera isn't available (no permission or unsupported browser). Use the button below instead.",
      );
      setMode("fallback");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setSnapshot(dataUrl);
    stopStream();
    setMode("preview");
  };

  const handleRetake = () => {
    setSnapshot(null);
    startCamera();
  };

  const handleUsePhoto = () => {
    if (snapshot) onCapture(snapshot);
    onClose();
  };

  const handleFallbackFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSnapshot(reader.result);
      setMode("preview");
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={handleClose}>
      <div
        className="ac-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-main">EQUIPMENT PHOTO</span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="ac-content" style={{ textAlign: "center" }}>
          {mode === "loading" && <p>Starting camera…</p>}

          {mode === "live" && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", borderRadius: 6, background: "#000" }}
            />
          )}

          {mode === "preview" && snapshot && (
            <img
              src={snapshot}
              alt="Captured equipment"
              style={{ width: "100%", borderRadius: 6 }}
            />
          )}

          {mode === "fallback" && (
            <div>
              {errorMsg && <p className="ac-error">{errorMsg}</p>}
              <button
                className="jr-save-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Open Camera / Choose Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={handleFallbackFile}
              />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="ac-footer" style={{ marginTop: 12 }}>
            {mode === "live" && (
              <button className="jr-save-btn" onClick={handleTakePhoto}>
                Capture Photo
              </button>
            )}
            {mode === "preview" && (
              <>
                <button className="jr-save-btn" onClick={handleUsePhoto}>
                  Use Photo
                </button>
                <button className="jr-action-btn" onClick={handleRetake}>
                  Retake
                </button>
              </>
            )}
            <button className="jr-action-btn" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CameraCaptureModal;
