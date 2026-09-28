// const express = require("express");
// const { getDb } = require("../config/db");
// const {
//   getNextSequence,
//   pad4,
//   currentYearSuffix,
// } = require("../utils/counters");
// // Same helper the equipment-photo upload route (POST
// // /equipment-photo/:jobNumber) already uses — adjust the path if it
// // lives somewhere else in your tree. Signature:
// //   uploadBufferToCloudinary(buffer, { resourceType, folder, publicId })
// //     -> { secure_url, public_id, ... }
// const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");

// const router = express.Router();

// // GET next DR ID preview (mirrors /api/jobreceipts/next-id)
// router.get("/next-id", async (req, res) => {
//   try {
//     const db = getDb();
//     const counter = await db
//       .collection("counters")
//       .findOne({ _id: "deliveryReceiptId" });
//     const nextSeq = (counter?.seq || 0) + 1;
//     const nextDrId = `DR/${pad4(nextSeq)}/${currentYearSuffix()}`;
//     res.json({ nextDrId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const receipts = await db
//       .collection("deliveryreceipts")
//       .find()
//       .sort({ createdAt: -1 })
//       .toArray();
//     res.json(receipts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // CameraCaptureModal hands back base64 dataURLs (canvas.toDataURL /
// // FileReader.readAsDataURL), but uploadBufferToCloudinary — same as
// // every other upload route in this app — expects a raw Buffer. Strips
// // the "data:image/jpeg;base64," prefix and decodes the rest.
// const dataUrlToBuffer = (dataUrl) => {
//   const base64 = dataUrl.split(",")[1] ?? dataUrl;
//   return Buffer.from(base64, "base64");
// };

// // Uploads every captured photo to this delivery receipt's own
// // Cloudinary folder, keyed by DRID — NOT by job number, per the earlier
// // design decision (a receipt can cover several jobs, and the photos
// // belong to the receipt as a whole, not to any one of them). Mirrors
// // the equipment-photo route's folder nesting (one top-level folder per
// // record, "photos" as its subfolder). Returns both the successfully
// // uploaded secure_urls (capture order preserved among successes) and a
// // failedCount, so the route can surface a warning instead of silently
// // saving a receipt with fewer photos than the user actually captured.
// const uploadReceiptPhotos = async (deliveryReceiptId, dataUrls) => {
//   if (!Array.isArray(dataUrls) || dataUrls.length === 0) {
//     return { urls: [], failedCount: 0, totalCount: 0 };
//   }

//   const folder = `cdms/delivery-receipts/${deliveryReceiptId}/photos`;
//   const batchTimestamp = Date.now();

//   const uploads = await Promise.allSettled(
//     dataUrls.map((dataUrl, idx) =>
//       uploadBufferToCloudinary(dataUrlToBuffer(dataUrl), {
//         resourceType: "image",
//         folder,
//         publicId: `photo_${idx + 1}_${batchTimestamp}`,
//       }),
//     ),
//   );

//   const urls = [];
//   let failedCount = 0;
//   uploads.forEach((result, idx) => {
//     if (result.status === "fulfilled") {
//       urls.push(result.value.secure_url);
//     } else {
//       failedCount += 1;
//       console.error(
//         `Failed to upload delivery receipt photo #${idx + 1} for ${deliveryReceiptId}:`,
//         result.reason,
//       );
//     }
//   });

//   return { urls, failedCount, totalCount: dataUrls.length };
// };

// // POST save delivery receipt - the DRID is generated here with an
// // atomic counter increment (same pattern as jobReceiptID/customerID),
// // not computed client-side, so two people saving at the same moment
// // can never collide on the same ID.
// //
// // PHOTOS: req.body.photos arrives as an array of base64 dataURLs
// // (CameraCaptureModal's onCapture contract, accumulated client-side in
// // DeliveryReceiptCertificateModal/DeliveryReceiptUnitModal). Previously
// // this array was stored on the document as-is — no Cloudinary upload
// // ever happened, so nothing was ever visible via any "Open Folder" /
// // ReceiptFolderModal Cloudinary fetch, and the raw base64 blobs were
// // bloating the deliveryreceipts collection. Now each photo is uploaded
// // to cdms/delivery-receipts/<DRID>/photos before the receipt is
// // inserted, and only the resulting secure_urls are stored.
// //
// // If one or more photos fail to upload, the receipt still saves (a
// // flaky photo shouldn't block logging a real delivery) but the
// // response carries a photoUploadWarning so the frontend can tell the
// // user some photos didn't make it, instead of the save looking
// // identical either way.
// router.post("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const seq = await getNextSequence(db, "deliveryReceiptId");
//     const deliveryReceiptId = `DR/${pad4(seq)}/${currentYearSuffix()}`;

//     const { photos: capturedPhotos, ...rest } = req.body;
//     const {
//       urls: photoUrls,
//       failedCount,
//       totalCount,
//     } = await uploadReceiptPhotos(deliveryReceiptId, capturedPhotos);

//     const newReceipt = {
//       ...rest,
//       deliveryReceiptId,
//       photos: photoUrls,
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("deliveryreceipts").insertOne(newReceipt);

//     const photoUploadWarning =
//       failedCount > 0
//         ? failedCount === totalCount
//           ? `The receipt was saved, but none of the ${totalCount} captured photo(s) could be uploaded. Please retake and add them via Open Camera.`
//           : `The receipt was saved, but ${failedCount} of ${totalCount} captured photo(s) could not be uploaded. Please retake the missing photo(s) via Open Camera.`
//         : undefined;

//     res.status(201).json({
//       success: true,
//       deliveryReceiptId,
//       receipt: newReceipt,
//       ...(photoUploadWarning && { photoUploadWarning }),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const { getDb } = require("../config/db");
const {
  getNextSequence,
  pad4,
  currentYearSuffix,
} = require("../utils/counters");
// Same helper the equipment-photo upload route (POST
// /equipment-photo/:jobNumber) already uses — adjust the path if it
// lives somewhere else in your tree. Signature:
//   uploadBufferToCloudinary(buffer, { resourceType, folder, publicId })
//     -> { secure_url, public_id, ... }
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
// Stage history logging — closes each job's trail when it is released
const { moveStage } = require("../services/stageTracker");

const router = express.Router();

// Pulls the job number(s) a delivery receipt covers out of the request
// body. A receipt can cover several jobs, so this returns an array.
// It checks the most likely field shapes; if your frontend sends the
// job numbers under a different name, add it here.
const extractJobNumbers = (body) => {
  const found = new Set();
  const add = (v) => {
    if (typeof v === "string" && v.trim()) found.add(v.trim());
  };

  add(body.jobNumber);
  if (Array.isArray(body.jobNumbers)) body.jobNumbers.forEach(add);
  ["items", "jobs", "instruments", "units"].forEach((key) => {
    if (Array.isArray(body[key])) {
      body[key].forEach((item) =>
        add(typeof item === "string" ? item : item?.jobNumber),
      );
    }
  });

  return [...found];
};

// GET next DR ID preview (mirrors /api/jobreceipts/next-id)
router.get("/next-id", async (req, res) => {
  try {
    const db = getDb();
    const counter = await db
      .collection("counters")
      .findOne({ _id: "deliveryReceiptId" });
    const nextSeq = (counter?.seq || 0) + 1;
    const nextDrId = `DR/${pad4(nextSeq)}/${currentYearSuffix()}`;
    res.json({ nextDrId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const receipts = await db
      .collection("deliveryreceipts")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(receipts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// CameraCaptureModal hands back base64 dataURLs (canvas.toDataURL /
// FileReader.readAsDataURL), but uploadBufferToCloudinary — same as
// every other upload route in this app — expects a raw Buffer. Strips
// the "data:image/jpeg;base64," prefix and decodes the rest.
const dataUrlToBuffer = (dataUrl) => {
  const base64 = dataUrl.split(",")[1] ?? dataUrl;
  return Buffer.from(base64, "base64");
};

// Uploads every captured photo to this delivery receipt's own
// Cloudinary folder, keyed by DRID — NOT by job number, per the earlier
// design decision (a receipt can cover several jobs, and the photos
// belong to the receipt as a whole, not to any one of them). Mirrors
// the equipment-photo route's folder nesting (one top-level folder per
// record, "photos" as its subfolder). Returns both the successfully
// uploaded secure_urls (capture order preserved among successes) and a
// failedCount, so the route can surface a warning instead of silently
// saving a receipt with fewer photos than the user actually captured.
const uploadReceiptPhotos = async (deliveryReceiptId, dataUrls) => {
  if (!Array.isArray(dataUrls) || dataUrls.length === 0) {
    return { urls: [], failedCount: 0, totalCount: 0 };
  }

  const folder = `cdms/delivery-receipts/${deliveryReceiptId}/photos`;
  const batchTimestamp = Date.now();

  const uploads = await Promise.allSettled(
    dataUrls.map((dataUrl, idx) =>
      uploadBufferToCloudinary(dataUrlToBuffer(dataUrl), {
        resourceType: "image",
        folder,
        publicId: `photo_${idx + 1}_${batchTimestamp}`,
      }),
    ),
  );

  const urls = [];
  let failedCount = 0;
  uploads.forEach((result, idx) => {
    if (result.status === "fulfilled") {
      urls.push(result.value.secure_url);
    } else {
      failedCount += 1;
      console.error(
        `Failed to upload delivery receipt photo #${idx + 1} for ${deliveryReceiptId}:`,
        result.reason,
      );
    }
  });

  return { urls, failedCount, totalCount: dataUrls.length };
};

// POST save delivery receipt - the DRID is generated here with an
// atomic counter increment (same pattern as jobReceiptID/customerID),
// not computed client-side, so two people saving at the same moment
// can never collide on the same ID.
//
// PHOTOS: req.body.photos arrives as an array of base64 dataURLs
// (CameraCaptureModal's onCapture contract, accumulated client-side in
// DeliveryReceiptCertificateModal/DeliveryReceiptUnitModal). Previously
// this array was stored on the document as-is — no Cloudinary upload
// ever happened, so nothing was ever visible via any "Open Folder" /
// ReceiptFolderModal Cloudinary fetch, and the raw base64 blobs were
// bloating the deliveryreceipts collection. Now each photo is uploaded
// to cdms/delivery-receipts/<DRID>/photos before the receipt is
// inserted, and only the resulting secure_urls are stored.
//
// If one or more photos fail to upload, the receipt still saves (a
// flaky photo shouldn't block logging a real delivery) but the
// response carries a photoUploadWarning so the frontend can tell the
// user some photos didn't make it, instead of the save looking
// identical either way.
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const seq = await getNextSequence(db, "deliveryReceiptId");
    const deliveryReceiptId = `DR/${pad4(seq)}/${currentYearSuffix()}`;

    const { photos: capturedPhotos, ...rest } = req.body;
    const {
      urls: photoUrls,
      failedCount,
      totalCount,
    } = await uploadReceiptPhotos(deliveryReceiptId, capturedPhotos);

    const newReceipt = {
      ...rest,
      deliveryReceiptId,
      photos: photoUrls,
      createdAt: new Date().toISOString(),
    };

    await db.collection("deliveryreceipts").insertOne(newReceipt);

    // Stage log: the job has now left the building (instrument or
    // certificate released), so close its open "Delivery" stage.
    // toStage: null closes the trail without opening a new stage.
    // Awaited but wrapped in try/catch so a logging problem can never
    // fail a real delivery receipt. If a second receipt is later saved
    // for the same job (e.g. certificate after instrument), there is no
    // open stage left and this is a harmless no-op.
    try {
      const jobNumbers = extractJobNumbers(req.body);
      if (jobNumbers.length === 0) {
        console.warn(
          `Stage logging: no job numbers found on delivery receipt ${deliveryReceiptId}`,
        );
      }
      for (const jobNumber of jobNumbers) {
        await moveStage({ jobNumber, toStage: null });
      }
    } catch (e) {
      console.error("Stage logging failed:", e.message);
    }

    const photoUploadWarning =
      failedCount > 0
        ? failedCount === totalCount
          ? `The receipt was saved, but none of the ${totalCount} captured photo(s) could be uploaded. Please retake and add them via Open Camera.`
          : `The receipt was saved, but ${failedCount} of ${totalCount} captured photo(s) could not be uploaded. Please retake the missing photo(s) via Open Camera.`
        : undefined;

    res.status(201).json({
      success: true,
      deliveryReceiptId,
      receipt: newReceipt,
      ...(photoUploadWarning && { photoUploadWarning }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
