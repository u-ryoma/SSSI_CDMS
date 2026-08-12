// import React, { useRef, useState, useEffect, useCallback } from "react";
// import { createPortal } from "react-dom";

// // Camera capture modal — tries getUserMedia first (works in desktop and
// // mobile browsers, gives a live preview). If that's unavailable or
// // denied, falls back to a plain file input with capture="environment",
// // which most mobile browsers turn into a direct "open camera app" action.
// //
// // MULTI-PHOTO: captures accumulate in `photos` as the user clicks
// // "Capture Photo" repeatedly (the live stream stays open between shots —
// // no more single capture -> preview -> done). Each shot lands as a
// // thumbnail in the strip below the video, removable individually.
// // Clicking "Done" hands the whole batch back at once.
// //
// // CONTRACT CHANGE: onCapture now receives an ARRAY of dataURLs
// // (`onCapture(photos)`) instead of a single dataURL string — update any
// // existing onCapture handler to loop over the array, e.g.:
// //   const handlePhotoCapture = async (dataUrls) => {
// //     for (const dataUrl of dataUrls) { /* upload each one */ }
// //   };
// // onCapture is not called at all if the user backs out with zero photos
// // taken (Cancel / close).
// const CameraCaptureModal = ({ onClose, onCapture }) => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const [mode, setMode] = useState("loading"); // loading | live | fallback
//   const [photos, setPhotos] = useState([]); // dataURLs captured this session
//   const [errorMsg, setErrorMsg] = useState("");

//   const stopStream = useCallback(() => {
//     streamRef.current?.getTracks().forEach((t) => t.stop());
//     streamRef.current = null;
//   }, []);

//   const startCamera = useCallback(async () => {
//     setMode("loading");
//     setErrorMsg("");

//     try {
//       if (!navigator.mediaDevices?.getUserMedia) {
//         throw new Error("getUserMedia not supported");
//       }
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: { ideal: "environment" } },
//         audio: false,
//       });
//       streamRef.current = stream;

//       // NOTE: do NOT attach to videoRef here — the <video> element only
//       // renders once mode === "live", so videoRef.current is still null
//       // at this point. Attaching happens in the effect below, which runs
//       // after the video element has actually mounted.
//       setMode("live");
//     } catch (err) {
//       console.warn("Camera unavailable, falling back to file input:", err);
//       setErrorMsg(
//         "Live camera isn't available (no permission or unsupported browser). Use the button below instead.",
//       );
//       setMode("fallback");
//     }
//   }, []);

//   useEffect(() => {
//     startCamera();
//     return () => stopStream();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Attach the stream to the <video> element once it has actually mounted.
//   useEffect(() => {
//     if (mode !== "live" || !videoRef.current || !streamRef.current) return;

//     const video = videoRef.current;
//     video.srcObject = streamRef.current;
//     video.play().catch((err) => {
//       console.warn("video.play() failed:", err);
//     });
//   }, [mode]);

//   // Capture a frame and add it to the batch — stream stays open so the
//   // user can immediately take another shot.
//   const handleTakePhoto = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas) return;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
//     setPhotos((prev) => [...prev, dataUrl]);
//   };

//   const handleRemovePhoto = (index) => {
//     setPhotos((prev) => prev.filter((_, i) => i !== index));
//   };

//   // Fallback file input — supports picking several images at once from
//   // the gallery (`multiple`), and can also be clicked again afterward to
//   // add more, since with capture="environment" most mobile browsers only
//   // let one photo through per invocation.
//   const handleFallbackFiles = (e) => {
//     const files = Array.from(e.target.files || []);
//     e.target.value = ""; // allow re-selecting/re-capturing next time
//     if (files.length === 0) return;

//     Promise.all(
//       files.map(
//         (file) =>
//           new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result);
//             reader.onerror = reject;
//             reader.readAsDataURL(file);
//           }),
//       ),
//     )
//       .then((dataUrls) => setPhotos((prev) => [...prev, ...dataUrls]))
//       .catch((err) => console.error("Failed to read captured photo(s):", err));
//   };

//   const handleDone = () => {
//     stopStream();
//     if (photos.length > 0) onCapture?.(photos);
//     onClose();
//   };

//   const handleClose = () => {
//     stopStream();
//     onClose();
//   };

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={handleClose}>
//       <div
//         className="ac-modal-wrapper"
//         onClick={(e) => e.stopPropagation()}
//         style={{ maxWidth: 480 }}
//       >
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-main">EQUIPMENT PHOTO</span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={handleClose}>
//             ✕
//           </button>
//         </div>

//         <div className="ac-content" style={{ textAlign: "center" }}>
//           {mode === "loading" && <p>Starting camera…</p>}

//           {mode === "live" && (
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               muted
//               style={{ width: "100%", borderRadius: 6, background: "#000" }}
//             />
//           )}

//           {mode === "fallback" && (
//             <div>
//               {errorMsg && <p className="ac-error">{errorMsg}</p>}
//               <button
//                 className="jr-save-btn"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 {photos.length === 0
//                   ? "Open Camera / Choose Photo"
//                   : "Add Another Photo"}
//               </button>
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="image/*"
//                 capture="environment"
//                 multiple
//                 style={{ display: "none" }}
//                 onChange={handleFallbackFiles}
//               />
//             </div>
//           )}

//           <canvas ref={canvasRef} style={{ display: "none" }} />

//           {/* THUMBNAIL STRIP — every shot taken this session so far */}
//           {photos.length > 0 && (
//             <div
//               className="ac-thumb-strip"
//               style={{
//                 display: "flex",
//                 gap: 8,
//                 overflowX: "auto",
//                 marginTop: 12,
//                 padding: "4px 0",
//               }}
//             >
//               {photos.map((photo, index) => (
//                 <div
//                   key={index}
//                   style={{
//                     position: "relative",
//                     flex: "0 0 auto",
//                     width: 64,
//                     height: 64,
//                   }}
//                 >
//                   <img
//                     src={photo}
//                     alt={`Captured ${index + 1}`}
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       borderRadius: 4,
//                       border: "1px solid #ccc",
//                     }}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => handleRemovePhoto(index)}
//                     title="Remove this photo"
//                     style={{
//                       position: "absolute",
//                       top: -6,
//                       right: -6,
//                       width: 20,
//                       height: 20,
//                       borderRadius: "50%",
//                       border: "1px solid #999",
//                       background: "#fff",
//                       lineHeight: 1,
//                       cursor: "pointer",
//                       fontSize: 12,
//                     }}
//                   >
//                     ✕
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="ac-footer" style={{ marginTop: 12 }}>
//             {mode === "live" && (
//               <button className="jr-save-btn" onClick={handleTakePhoto}>
//                 Capture Photo
//               </button>
//             )}
//             <button className="jr-save-btn" onClick={handleDone}>
//               {photos.length > 0
//                 ? `Done (${photos.length} photo${photos.length === 1 ? "" : "s"})`
//                 : "Done"}
//             </button>
//             <button className="jr-action-btn" onClick={handleClose}>
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default CameraCaptureModal;
import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// Camera capture modal — tries getUserMedia first (works in desktop and
// mobile browsers, gives a live preview). If that's unavailable or
// denied, falls back to a plain file input with capture="environment",
// which most mobile browsers turn into a direct "open camera app" action.
//
// MULTI-PHOTO: captures accumulate in `photos` as the user clicks
// "Capture Photo" repeatedly (the live stream stays open between shots —
// no more single capture -> preview -> done). Each shot lands as a
// thumbnail in the strip below the video, removable individually.
// Clicking "Done" hands the whole batch back at once.
//
// CONTRACT CHANGE: onCapture now receives an ARRAY of dataURLs
// (`onCapture(photos)`) instead of a single dataURL string — update any
// existing onCapture handler to loop over the array, e.g.:
//   const handlePhotoCapture = async (dataUrls) => {
//     for (const dataUrl of dataUrls) { /* upload each one */ }
//   };
// onCapture is not called at all if the user backs out with zero photos
// taken (Cancel / close).
//
// contextLabel (optional): a short caller-supplied string shown as a
// subtitle above "EQUIPMENT PHOTO" (e.g. "DELIVERY RECEIPT (UNIT) #DR-0001").
// Lets a caller make it obvious *why* the camera was opened / which flow
// the photos will be attached to, without this component knowing anything
// about who's calling it. Omit it and the header renders exactly as
// before.
const CameraCaptureModal = ({ onClose, onCapture, contextLabel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState("loading"); // loading | live | fallback
  const [photos, setPhotos] = useState([]); // dataURLs captured this session
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

      // NOTE: do NOT attach to videoRef here — the <video> element only
      // renders once mode === "live", so videoRef.current is still null
      // at this point. Attaching happens in the effect below, which runs
      // after the video element has actually mounted.
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

  // Attach the stream to the <video> element once it has actually mounted.
  useEffect(() => {
    if (mode !== "live" || !videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch((err) => {
      console.warn("video.play() failed:", err);
    });
  }, [mode]);

  // Capture a frame and add it to the batch — stream stays open so the
  // user can immediately take another shot.
  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPhotos((prev) => [...prev, dataUrl]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Fallback file input — supports picking several images at once from
  // the gallery (`multiple`), and can also be clicked again afterward to
  // add more, since with capture="environment" most mobile browsers only
  // let one photo through per invocation.
  const handleFallbackFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting/re-capturing next time
    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((dataUrls) => setPhotos((prev) => [...prev, ...dataUrls]))
      .catch((err) => console.error("Failed to read captured photo(s):", err));
  };

  const handleDone = () => {
    stopStream();
    if (photos.length > 0) onCapture?.(photos);
    onClose();
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
              {contextLabel && (
                <span className="jr-modal-title-sub">{contextLabel}</span>
              )}
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

          {mode === "fallback" && (
            <div>
              {errorMsg && <p className="ac-error">{errorMsg}</p>}
              <button
                className="jr-save-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                {photos.length === 0
                  ? "Open Camera / Choose Photo"
                  : "Add Another Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                style={{ display: "none" }}
                onChange={handleFallbackFiles}
              />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* THUMBNAIL STRIP — every shot taken this session so far */}
          {photos.length > 0 && (
            <div
              className="ac-thumb-strip"
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                marginTop: 12,
                padding: "4px 0",
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    flex: "0 0 auto",
                    width: 64,
                    height: 64,
                  }}
                >
                  <img
                    src={photo}
                    alt={`Captured ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    title="Remove this photo"
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "1px solid #999",
                      background: "#fff",
                      lineHeight: 1,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="ac-footer" style={{ marginTop: 12 }}>
            {mode === "live" && (
              <button className="jr-save-btn" onClick={handleTakePhoto}>
                Capture Photo
              </button>
            )}
            <button className="jr-save-btn" onClick={handleDone}>
              {photos.length > 0
                ? `Done (${photos.length} photo${photos.length === 1 ? "" : "s"})`
                : "Done"}
            </button>
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
