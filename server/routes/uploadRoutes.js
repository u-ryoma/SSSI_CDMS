// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/upload");
// const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
// const cloudinary = require("cloudinary").v2;
// const ExcelJS = require("exceljs");

// // ==========================
// // EQUIPMENT PHOTO UPLOAD
// // ==========================
// // Called from CameraCaptureModal.jsx at capture time — before the job
// // number document necessarily exists yet, since Save happens after the
// // photo is taken. jobNumber is used purely as a Cloudinary folder key
// // (e.g. "SSS/0001/26" or "pending_<timestamp>" if not yet reserved), NOT
// // as a lookup into the jobnumbers collection. The frontend is responsible
// // for taking the returned url and storing it on jobForm.photoUrl, which
// // then gets saved to Mongo as part of the normal job number save flow.
// //
// // Nested under the general per-job-number folder (see
// // /job-folder/:jobNumber below) rather than the other way around, so each
// // job number has one folder containing everything related to it, with
// // equipment-photos as a subfolder inside.
// router.post(
//   "/equipment-photo/:jobNumber",
//   upload.single("photo"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res
//           .status(400)
//           .json({ success: false, message: "No photo received" });
//       }

//       const jobNumber = decodeURIComponent(req.params.jobNumber);

//       const result = await uploadBufferToCloudinary(req.file.buffer, {
//         resourceType: "image",
//         folder: `cdms/job-numbers/${jobNumber}/equipment-photos`,
//         publicId: `photo_${Date.now()}`,
//       });

//       res.json({
//         success: true,
//         url: result.secure_url,
//         publicId: result.public_id,
//       });
//     } catch (err) {
//       console.error("Equipment photo upload failed:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },
// );
// // ==========================
// // CALIBRATION STANDARD PHOTO UPLOAD
// // ==========================
// // Same pattern as equipment-photo above: called from CameraModal.jsx at
// // capture time inside AddAssetModal, which may fire before the standard
// // has actually been saved to Mongo yet (e.g. a brand-new "Add New" entry
// // where the user takes the photo before hitting Save). standardId is
// // used purely as a Cloudinary folder key here, NOT as a lookup into the
// // standards collection — if it's not filled in yet, the frontend falls
// // back to a "pending_<timestamp>" key instead. The frontend takes the
// // returned url and stores it on formData.photoUrl, which then travels
// // with the rest of the form and gets saved to Mongo as part of the
// // normal POST/PUT /api/standards flow.
// router.post(
//   "/standard-photo/:standardId",
//   upload.single("photo"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res
//           .status(400)
//           .json({ success: false, message: "No photo received" });
//       }

//       const standardId = decodeURIComponent(req.params.standardId);

//       // publicId is the standardId itself (already slash-safe from the
//       // frontend) rather than a photo_<timestamp> name. This means each
//       // new photo for a standard overwrites the previous one in
//       // Cloudinary instead of accumulating — only the latest photo is
//       // ever kept per standard. overwrite/invalidate are passed
//       // explicitly since Cloudinary's default overwrite behavior can
//       // vary by upload preset/account settings.
//       const result = await uploadBufferToCloudinary(req.file.buffer, {
//         resourceType: "image",
//         folder: `cdms/standard-photos/${standardId}`,
//         publicId: standardId,
//         invalidate: true,
//       });

//       res.json({
//         success: true,
//         url: result.secure_url,
//         publicId: result.public_id,
//       });
//     } catch (err) {
//       console.error("Standard photo upload failed:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },
// );

// // ==========================
// // LIST STANDARD FILES (View Files button)
// // ==========================
// // Lists every file ever uploaded to this standard's Cloudinary folder —
// // not just the current photoUrl on the record — so past photos aren't
// // lost when a new one is captured. standardId here must already have
// // slashes swapped for underscores (the frontend does this before
// // building the URL), matching the folder key used at upload time.
// router.get("/standard-photo/:standardId/files", async (req, res) => {
//   try {
//     const standardId = decodeURIComponent(req.params.standardId);
//     const folder = `cdms/standard-photos/${standardId}`;

//     // Uses the Search API rather than api.resources({ prefix: ... })
//     // because prefix-matching only works when the folder is baked into
//     // the public_id — true for files uploaded through this app's own
//     // upload code, but NOT for files dragged in manually through the
//     // Cloudinary console, which get an auto-generated public_id with no
//     // folder prefix on accounts using Dynamic Folder mode. Search
//     // instead matches against the file's actual folder metadata, so it
//     // finds both kinds of uploads, and in one call instead of two.
//     const searchResult = await cloudinary.search
//       .expression(`folder="${folder}"`)
//       .sort_by("created_at", "desc")
//       .max_results(500)
//       .execute();

//     const files = (searchResult.resources || []).map((r) => ({
//       url: r.secure_url,
//       publicId: r.public_id,
//       createdAt: r.created_at,
//       bytes: r.bytes,
//       format: r.format,
//       resourceType: r.resource_type,
//     }));

//     res.json({ success: true, files });
//   } catch (err) {
//     console.error("Failed to list standard files:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ==========================
// // LIST CALIBRATION PROCEDURE TEMPLATES
// // ==========================
// // Lists every file in the "cdms/templates-for-calibration" Cloudinary
// // folder — the folder shown in the Cloudinary console under
// // cdms > templates-for-calibration. Powers
// // CalibrationProcedureLookupModal.jsx's template list, replacing what
// // used to be a hardcoded TEMPLATE_LIST in the frontend.
// //
// // Uses the Search API (same reasoning as the standard-photo/files route
// // above): prefix-matching on public_id only works for files uploaded
// // through this app's own code, but files added directly via the
// // Cloudinary console — which is presumably how these templates got
// // there — get an auto-generated public_id with no folder prefix on
// // Dynamic Folder mode accounts. Search matches on actual folder
// // metadata instead, so it finds those too.
// router.get("/templates", async (req, res) => {
//   try {
//     const folder = "cdms/templates-for-calibration";

//     const searchResult = await cloudinary.search
//       .expression(`folder="${folder}"`)
//       .sort_by("created_at", "desc")
//       .max_results(500)
//       .execute();

//     const templates = (searchResult.resources || []).map((r) => {
//       const rawName = r.public_id.split("/").pop();

//       // For resource_type "raw" (xls/xlsx/docx etc), Cloudinary's
//       // public_id already includes the file extension — unlike
//       // "image"/"video" types, where the extension is separate. Strip
//       // it back off first (using r.format, which Cloudinary always
//       // reports correctly) before touching the hash suffix, or the
//       // hash-stripping regex below never matches (it's anchored to the
//       // true end of the name, not wherever ".xls" happens to be).
//       const ext = r.format ? `.${r.format}` : "";
//       const baseName =
//         ext && rawName.toLowerCase().endsWith(ext.toLowerCase())
//           ? rawName.slice(0, -ext.length)
//           : rawName;

//       // Cloudinary appends a random suffix like "_vxbc8c" to keep
//       // public_ids unique when a file with the same name is uploaded
//       // more than once. Strip that off so the code is clean
//       // (e.g. "SSS-CP-020" instead of "SSS-CP-020_vxbc8c").
//       const code = baseName.replace(/_[a-z0-9]{6,8}$/i, "");

//       return {
//         code,
//         name: code,
//         fileUrl: r.secure_url,
//         publicId: r.public_id,
//         format: r.format,
//         bytes: r.bytes,
//         createdAt: r.created_at,
//       };
//     });

//     res.json({ success: true, templates });
//   } catch (err) {
//     console.error("Failed to list calibration procedure templates:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
// // ==========================
// // DOWNLOAD A CALIBRATION PROCEDURE TEMPLATE (RAW / UNFILLED)
// // ==========================
// // Browsers ignore the <a download> attribute on cross-origin links, and
// // Cloudinary URLs are always cross-origin from the app's own domain — so
// // clicking Download in CalibrationProcedureLookupModal.jsx was just
// // opening the file in a new tab instead of saving it. This route fetches
// // the file from Cloudinary server-side and streams it back with an
// // explicit Content-Disposition: attachment header, which forces a real
// // download since the response is now same-origin.
// //
// // publicId is passed as a query param (not a route param) since it
// // contains "/" characters from the folder path, which would otherwise
// // need extra route-matching gymnastics.
// //
// // This stays a plain, unfilled copy of exactly what's stored in
// // Cloudinary — used for browsing/downloading past template versions in
// // JobFilesModal's version history (an audit trail, which shouldn't have
// // any particular job's data stamped into it). For the calibration
// // details modal's own Download button, which needs the current job's
// // data written in, see POST /templates/download-filled below instead.
// router.get("/templates/download", async (req, res) => {
//   try {
//     const { publicId, filename } = req.query;
//     if (!publicId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "publicId is required" });
//     }

//     // Look up the current secure_url rather than trusting one passed in
//     // from the client — cheap call, and avoids ever proxying an
//     // arbitrary attacker-supplied URL.
//     const resource = await cloudinary.api.resource(publicId, {
//       resource_type: "raw",
//     });

//     const fileRes = await fetch(resource.secure_url);
//     if (!fileRes.ok) {
//       throw new Error(`Cloudinary fetch failed with ${fileRes.status}`);
//     }

//     const buffer = Buffer.from(await fileRes.arrayBuffer());
//     const downloadName = filename || publicId.split("/").pop();

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${downloadName}"`,
//     );
//     res.setHeader(
//       "Content-Type",
//       fileRes.headers.get("content-type") || "application/octet-stream",
//     );
//     res.send(buffer);
//   } catch (err) {
//     console.error("Template download failed:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ==========================
// // DOWNLOAD A CALIBRATION PROCEDURE TEMPLATE, FILLED WITH JOB DATA
// // ==========================
// // Called from IncomingCalibDetailsModal.jsx's Download button. Loads the
// // stored template with ExcelJS, writes the current job's data into the
// // CDMS input sheet — the sheet every other tab in the workbook (Front
// // Page, ws, Calib Data 1, etc.) pulls its values from via cross-sheet
// // formulas like =CDMS!C3 — and streams back the filled copy.
// //
// // Requires the stored template to be a real .xlsx: ExcelJS can only
// // read/write Open XML workbooks, not the legacy binary .xls (BIFF8)
// // format, so templates need to be saved/uploaded as .xlsx for this route
// // to work.
// //
// // jobData.calibrationStandards holds up to 5 rows x 3 lookup codes
// // (item1/item2/item3) — just bare codes, not full standard details. Each
// // non-empty code here is resolved against GET /api/standards so the
// // CDMS sheet's asset table (rows 17-32) gets full records: Asset No.,
// // Serial No., Cert No., and Due Date, one matched code per asset row.
// router.post("/templates/download-filled", async (req, res) => {
//   try {
//     const { publicId, filename, jobData } = req.body || {};
//     if (!publicId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "publicId is required" });
//     }

//     const resource = await cloudinary.api.resource(publicId, {
//       resource_type: "raw",
//     });
//     const fileRes = await fetch(resource.secure_url);
//     if (!fileRes.ok) {
//       throw new Error(`Cloudinary fetch failed with ${fileRes.status}`);
//     }
//     const buffer = Buffer.from(await fileRes.arrayBuffer());

//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.load(buffer);

//     const cdms = workbook.getWorksheet("CDMS");
//     if (!cdms) {
//       throw new Error("CDMS input sheet not found in this template");
//     }
//     const ws = workbook.getWorksheet("ws");
//     if (!ws) {
//       throw new Error("ws input sheet not found in this template");
//     }

//     const jd = jobData || {};

//     cdms.getCell("C2").value = jd.jobNumber || "";
//     cdms.getCell("C3").value = jd.companyName || "";
//     cdms.getCell("C4").value = jd.companyAddress || "";
//     cdms.getCell("C5").value = jd.contactCert || "";
//     cdms.getCell("C7").value = jd.description || "";
//     cdms.getCell("C8").value = jd.brand || "";
//     cdms.getCell("C9").value = jd.model || "";
//     cdms.getCell("C10").value = jd.serialNo || "";
//     // CDMS!C11-C13 (DATE REC / DATE CAL / DATE DUE) are kept in sync too,
//     // but nothing downstream actually reads them — see the ws!H1-H3
//     // writes below, which is what Front Page's dates are really wired to.
//     cdms.getCell("C11").value = jd.dateRec || "";
//     cdms.getCell("C12").value = jd.dateCal || "";
//     cdms.getCell("C13").value = jd.dateDue || "";

//     // --- ws sheet direct inputs ---------------------------------------
//     // Front Page pulls its dates from ws!H1/H2/H3 (merged H1:J1, H2:J2,
//     // H3:J3), next to the "date rec / date cal / date due" labels in
//     // column G — NOT from CDMS!C11-C13, which nothing reads. These are
//     // the cells that actually need the values for the dates to show up
//     // anywhere on the certificate.
//     ws.getCell("H1").value = jd.dateRec || "";
//     ws.getCell("H2").value = jd.dateCal || "";
//     ws.getCell("H3").value = jd.dateDue || "";

//     // OIC (row 7, merged B7:D7) — who calibrated the unit.
//     ws.getCell("B7").value = jd.oicBy || "";
//     // SIGN (row 8, merged B8:D8) — the SIG value from Incoming Calib
//     // Details.
//     ws.getCell("B8").value = jd.sig || "";

//     // --- Asset table (rows 17-32) + "ex at" location -------------------
//     // Resolve each item1/item2/item3 code against /api/standards, one
//     // matched code -> one asset row. Column layout per row: C = Asset
//     // No., D = Serial No., E = Cert No., F = Due Date (matches the
//     // CDMS!C16:F16 header row).
//     //
//     // "ex at" (ws!A5, merged value cell B5:F5) is the location where the
//     // calibration was carried out, pulled from the `location` field on
//     // the standard/asset-monitoring record. Since it's a single cell but
//     // a job can reference several standards, it's filled from the first
//     // matched standard only.
//     const codes = [];
//     for (const row of jd.calibrationStandards || []) {
//       for (const key of ["item1", "item2", "item3"]) {
//         const code = row?.[key]?.trim();
//         if (code) codes.push(code);
//       }
//     }

//     if (codes.length > 0) {
//       const standardsRes = await fetch(
//         `${req.protocol}://${req.get("host")}/api/standards`,
//       );
//       const allStandards = standardsRes.ok ? await standardsRes.json() : [];
//       const byCode = new Map(
//         (Array.isArray(allStandards) ? allStandards : []).map((s) => [
//           (s.code || s.standardId || "").toLowerCase(),
//           s,
//         ]),
//       );

//       let assetRow = 17;
//       let exAtWritten = false;
//       for (const code of codes) {
//         const record = byCode.get(code.toLowerCase());

//         if (record && !exAtWritten) {
//           ws.getCell("B5").value = record.location || "";
//           exAtWritten = true;
//         }

//         if (assetRow > 32) continue; // template only has 16 asset rows
//         if (record) {
//           cdms.getCell(`C${assetRow}`).value = record.assetNo || "";
//           cdms.getCell(`D${assetRow}`).value = record.serialNo || "";
//           cdms.getCell(`E${assetRow}`).value = record.certNo || "";
//           cdms.getCell(`F${assetRow}`).value = record.dateDue || "";
//         }
//         assetRow++;
//       }
//     }

//     const outBuffer = await workbook.xlsx.writeBuffer();
//     const downloadName = filename || publicId.split("/").pop();

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${downloadName}"`,
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     );
//     res.send(Buffer.from(outBuffer));
//   } catch (err) {
//     console.error("Filled template download failed:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ==========================
// // ENSURE STANDARD FOLDER EXISTS
// // ==========================
// // Called from CalibrationSystem.jsx on every Save/Update — even when no
// // photo was taken this session — so every standardId gets a Cloudinary
// // folder as soon as it's saved, instead of only getting one the first
// // time a photo happens to be uploaded into it. standardId here must
// // already have slashes swapped for underscores (the frontend does this
// // before building the URL), matching the folder key used everywhere else
// // in this router.
// router.post("/standard-folder/:standardId", async (req, res) => {
//   try {
//     const standardId = decodeURIComponent(req.params.standardId);
//     const folder = `cdms/standard-photos/${standardId}`;

//     try {
//       await cloudinary.api.create_folder(folder);
//     } catch (err) {
//       // Cloudinary throws if the folder already exists (or, on some
//       // SDK versions, if the account is on Dynamic Folder mode where
//       // folders are implicit) — either way that's not a real failure,
//       // so swallow it rather than bubbling up a 500 for something the
//       // user can't do anything about.
//       const alreadyExists =
//         err.http_code === 409 ||
//         /already exists/i.test(err.error?.message || err.message || "");
//       if (!alreadyExists) {
//         throw err;
//       }
//     }

//     res.json({ success: true, folder });
//   } catch (err) {
//     console.error("Failed to create standard folder:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // ==========================
// // ENSURE JOB NUMBER FOLDER EXISTS
// // ==========================
// // Called from JobReceipt.jsx's handleSave — right after a job number is
// // successfully saved to Mongo — so every job number gets a general
// // Cloudinary folder as soon as it's created, instead of only getting one
// // the first time an equipment photo happens to be uploaded. This is the
// // PARENT folder for everything related to that job number — equipment
// // photos (via /equipment-photo/:jobNumber above) get nested inside it as
// // a subfolder, along with any other job-related files added later.
// router.post("/job-folder/:jobNumber", async (req, res) => {
//   try {
//     const jobNumber = decodeURIComponent(req.params.jobNumber);
//     const folder = `cdms/job-numbers/${jobNumber}`;

//     try {
//       await cloudinary.api.create_folder(folder);
//     } catch (err) {
//       // Cloudinary throws if the folder already exists (or, on some
//       // SDK versions, if the account is on Dynamic Folder mode where
//       // folders are implicit) — either way that's not a real failure,
//       // so swallow it rather than bubbling up a 500 for something the
//       // user can't do anything about.
//       const alreadyExists =
//         err.http_code === 409 ||
//         /already exists/i.test(err.error?.message || err.message || "");
//       if (!alreadyExists) {
//         throw err;
//       }
//     }

//     res.json({ success: true, folder });
//   } catch (err) {
//     console.error("Failed to create job number folder:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // ==========================
// // JOB NUMBER DOCUMENT UPLOAD (PDF, etc.)
// // ==========================
// // Called from JobNumberModal.jsx's "Upload PDF" button. Uploads into
// // cdms/job-numbers/<jobNumber>/documents — a sibling subfolder to
// // equipment-photos, both nested under the same general per-job-number
// // folder created by /job-folder/:jobNumber below. resourceType "raw" is
// // used since PDFs (and most non-image documents) aren't images.
// //
// // Unlike equipment photos, the uploaded document's URL is NOT written
// // back onto jobForm/Mongo — documents are viewed purely by browsing the
// // Cloudinary folder itself via GET /job-folder/:jobNumber/files below.
// router.post(
//   "/job-document/:jobNumber",
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res
//           .status(400)
//           .json({ success: false, message: "No file received" });
//       }

//       const jobNumber = decodeURIComponent(req.params.jobNumber);
//       const originalName = req.file.originalname || `document_${Date.now()}`;

//       // Split into name + extension. For resource_type "raw", Cloudinary
//       // treats public_id as the literal, final file name — there's no
//       // separate "format" it appends the way it does for image/video
//       // resources. So the extension MUST be part of publicId itself, or
//       // the uploaded file is served (and downloaded) with no extension
//       // at all, which is exactly why browsers can't figure out how to
//       // open it afterwards (Chrome flags it as an unrecognized file and
//       // saves it extension-less).
//       const extMatch = originalName.match(/\.[^/.]+$/);
//       const ext = extMatch ? extMatch[0] : ""; // e.g. ".pdf", or "" if none
//       const nameWithoutExt = ext
//         ? originalName.slice(0, -ext.length)
//         : originalName;

//       const result = await uploadBufferToCloudinary(req.file.buffer, {
//         resourceType: "raw",
//         folder: `cdms/job-numbers/${jobNumber}/documents`,
//         // Timestamp suffix (before the extension) avoids collisions if
//         // the same filename is uploaded twice for the same job number —
//         // unlike standard photos, documents are meant to accumulate, not
//         // overwrite. Extension goes LAST so the stored/served file still
//         // ends in ".pdf" (or whatever it originally was).
//         publicId: `${nameWithoutExt}_${Date.now()}${ext}`,
//       });

//       res.json({
//         success: true,
//         url: result.secure_url,
//         publicId: result.public_id,
//         originalName,
//       });
//     } catch (err) {
//       console.error("Job document upload failed:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },
// );

// // ==========================
// // LIST JOB NUMBER FOLDER FILES (Open Folder)
// // ==========================
// // Called from JobFolderModal.jsx. Lists every file under
// // cdms/job-numbers/<jobNumber>/** — both the equipment-photos and
// // documents subfolders — in one call, using the Search API's wildcard
// // folder match (unlike the exact folder="..." match used by
// // /standard-photo/:standardId/files, since files here live across
// // multiple subfolders rather than directly in one folder).
// router.get("/job-folder/:jobNumber/files", async (req, res) => {
//   try {
//     const jobNumber = decodeURIComponent(req.params.jobNumber);
//     const folder = `cdms/job-numbers/${jobNumber}`;

//     const searchResult = await cloudinary.search
//       .expression(`folder:${folder}/*`)
//       .sort_by("created_at", "desc")
//       .max_results(500)
//       .execute();

//     const files = (searchResult.resources || []).map((r) => ({
//       url: r.secure_url,
//       publicId: r.public_id,
//       folder: r.folder,
//       createdAt: r.created_at,
//       bytes: r.bytes,
//       format: r.format,
//       resourceType: r.resource_type,
//     }));

//     res.json({ success: true, files });
//   } catch (err) {
//     console.error("Failed to list job folder files:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const cloudinary = require("cloudinary").v2;
const ExcelJS = require("exceljs");

// ==========================
// EQUIPMENT PHOTO UPLOAD
// ==========================
// Called from CameraCaptureModal.jsx at capture time — before the job
// number document necessarily exists yet, since Save happens after the
// photo is taken. jobNumber is used purely as a Cloudinary folder key
// (e.g. "SSS/0001/26" or "pending_<timestamp>" if not yet reserved), NOT
// as a lookup into the jobnumbers collection. The frontend is responsible
// for taking the returned url and storing it on jobForm.photoUrl, which
// then gets saved to Mongo as part of the normal job number save flow.
//
// Nested under the general per-job-number folder (see
// /job-folder/:jobNumber below) rather than the other way around, so each
// job number has one folder containing everything related to it, with
// equipment-photos as a subfolder inside.
router.post(
  "/equipment-photo/:jobNumber",
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No photo received" });
      }

      const jobNumber = decodeURIComponent(req.params.jobNumber);

      const result = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: "image",
        folder: `cdms/job-numbers/${jobNumber}/equipment-photos`,
        publicId: `photo_${Date.now()}`,
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error("Equipment photo upload failed:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);
// ==========================
// CALIBRATION STANDARD PHOTO UPLOAD
// ==========================
// Same pattern as equipment-photo above: called from CameraModal.jsx at
// capture time inside AddAssetModal, which may fire before the standard
// has actually been saved to Mongo yet (e.g. a brand-new "Add New" entry
// where the user takes the photo before hitting Save). standardId is
// used purely as a Cloudinary folder key here, NOT as a lookup into the
// standards collection — if it's not filled in yet, the frontend falls
// back to a "pending_<timestamp>" key instead. The frontend takes the
// returned url and stores it on formData.photoUrl, which then travels
// with the rest of the form and gets saved to Mongo as part of the
// normal POST/PUT /api/standards flow.
router.post(
  "/standard-photo/:standardId",
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No photo received" });
      }

      const standardId = decodeURIComponent(req.params.standardId);

      // publicId is the standardId itself (already slash-safe from the
      // frontend) rather than a photo_<timestamp> name. This means each
      // new photo for a standard overwrites the previous one in
      // Cloudinary instead of accumulating — only the latest photo is
      // ever kept per standard. overwrite/invalidate are passed
      // explicitly since Cloudinary's default overwrite behavior can
      // vary by upload preset/account settings.
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: "image",
        folder: `cdms/standard-photos/${standardId}`,
        publicId: standardId,
        invalidate: true,
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error("Standard photo upload failed:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ==========================
// LIST STANDARD FILES (View Files button)
// ==========================
// Lists every file ever uploaded to this standard's Cloudinary folder —
// not just the current photoUrl on the record — so past photos aren't
// lost when a new one is captured. standardId here must already have
// slashes swapped for underscores (the frontend does this before
// building the URL), matching the folder key used at upload time.
router.get("/standard-photo/:standardId/files", async (req, res) => {
  try {
    const standardId = decodeURIComponent(req.params.standardId);
    const folder = `cdms/standard-photos/${standardId}`;

    // Uses the Search API rather than api.resources({ prefix: ... })
    // because prefix-matching only works when the folder is baked into
    // the public_id — true for files uploaded through this app's own
    // upload code, but NOT for files dragged in manually through the
    // Cloudinary console, which get an auto-generated public_id with no
    // folder prefix on accounts using Dynamic Folder mode. Search
    // instead matches against the file's actual folder metadata, so it
    // finds both kinds of uploads, and in one call instead of two.
    const searchResult = await cloudinary.search
      .expression(`folder="${folder}"`)
      .sort_by("created_at", "desc")
      .max_results(500)
      .execute();

    const files = (searchResult.resources || []).map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      createdAt: r.created_at,
      bytes: r.bytes,
      format: r.format,
      resourceType: r.resource_type,
    }));

    res.json({ success: true, files });
  } catch (err) {
    console.error("Failed to list standard files:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// LIST CALIBRATION PROCEDURE TEMPLATES
// ==========================
// Lists every file in the "cdms/templates-for-calibration" Cloudinary
// folder — the folder shown in the Cloudinary console under
// cdms > templates-for-calibration. Powers
// CalibrationProcedureLookupModal.jsx's template list, replacing what
// used to be a hardcoded TEMPLATE_LIST in the frontend.
//
// Uses the Search API (same reasoning as the standard-photo/files route
// above): prefix-matching on public_id only works for files uploaded
// through this app's own code, but files added directly via the
// Cloudinary console — which is how these templates are actually
// maintained — get an auto-generated public_id with no folder prefix on
// Dynamic Folder mode accounts. Search matches on actual folder
// metadata instead, so it finds those too.
//
// DEDUPE SAFETY NET: this list is still built from a folder-wide Search
// call, so if a duplicate canonical file ever ends up sitting in this
// folder for the same code (e.g. a stray manual upload via the
// Cloudinary console), the lookup dropdown would show that code twice.
// Rather than trust the folder to always be clean, we dedupe here by
// `code`, keeping only the most recently created file per code. This is
// a read-time safety net — see scripts/cleanupDuplicateTemplates.js for
// actually removing the underlying duplicate files from Cloudinary.
router.get("/templates", async (req, res) => {
  try {
    const folder = "cdms/templates-for-calibration";

    const searchResult = await cloudinary.search
      .expression(`folder="${folder}"`)
      .sort_by("created_at", "desc")
      .max_results(500)
      .execute();

    const templates = (searchResult.resources || []).map((r) => {
      const rawName = r.public_id.split("/").pop();

      // For resource_type "raw" (xls/xlsx/docx etc), Cloudinary's
      // public_id already includes the file extension — unlike
      // "image"/"video" types, where the extension is separate. Strip
      // it back off first (using r.format, which Cloudinary always
      // reports correctly) before touching the hash suffix, or the
      // hash-stripping regex below never matches (it's anchored to the
      // true end of the name, not wherever ".xls" happens to be).
      const ext = r.format ? `.${r.format}` : "";
      const baseName =
        ext && rawName.toLowerCase().endsWith(ext.toLowerCase())
          ? rawName.slice(0, -ext.length)
          : rawName;

      // Cloudinary appends a random suffix like "_vxbc8c" to keep
      // public_ids unique when a file with the same name is uploaded
      // more than once (this is how EVERY manually console-uploaded
      // master ends up, since "Unique filename" is Cloudinary's
      // default). Strip that off so the code is clean
      // (e.g. "SSS-CP-020" instead of "SSS-CP-020_vxbc8c").
      const code = baseName.replace(/_[a-z0-9]{6,8}$/i, "");

      return {
        code,
        name: code,
        fileUrl: r.secure_url,
        publicId: r.public_id,
        format: r.format,
        bytes: r.bytes,
        createdAt: r.created_at,
      };
    });

    // Keep only the newest file per code. Map preserves first-seen
    // insertion order but we only ever overwrite an entry when a NEWER
    // createdAt shows up, so ties/ordering quirks from Cloudinary's sort
    // can't let a stale duplicate win.
    const byCode = new Map();
    for (const t of templates) {
      const existing = byCode.get(t.code);
      if (!existing || new Date(t.createdAt) > new Date(existing.createdAt)) {
        byCode.set(t.code, t);
      }
    }
    const deduped = [...byCode.values()];

    res.json({ success: true, templates: deduped });
  } catch (err) {
    console.error("Failed to list calibration procedure templates:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// SHARED HELPERS — canonical master lookup & job-scoped file lookup
// ==========================
// Resolves the canonical (blank) master template for a procedure code by
// searching the templates-for-calibration folder and matching against the
// SAME stripped-code logic GET /templates uses for display, instead of
// reconstructing a "code.ext" path and looking it up directly.
//
// This distinction matters: masters added manually via the Cloudinary
// console (how these are actually maintained) get a random uniqueness
// suffix appended to their real public_id, e.g. "SSS-CP-020_zrvjbm.xlsx"
// — NOT the clean "SSS-CP-020.xlsx" the display code implies. A direct
// resource() lookup on the guessed clean path 404s against the real
// file, and code that (incorrectly) treats that 404 as "doesn't exist
// yet" ends up creating a second, duplicate file at the clean path
// instead of finding/using the real master. Searching and matching by
// stripped code — same as the display list already does — finds the
// real file regardless of what suffix it happens to have.
async function findCanonicalTemplateByCode(code) {
  if (!code) return null;
  const folder = "cdms/templates-for-calibration";

  const searchResult = await cloudinary.search
    .expression(`folder="${folder}"`)
    .sort_by("created_at", "desc")
    .max_results(500)
    .execute();

  const normalizedTarget = code.trim().toLowerCase();

  for (const r of searchResult.resources || []) {
    const rawName = r.public_id.split("/").pop();
    const ext = r.format ? `.${r.format}` : "";
    const baseName =
      ext && rawName.toLowerCase().endsWith(ext.toLowerCase())
        ? rawName.slice(0, -ext.length)
        : rawName;
    const stripped = baseName.replace(/_[a-z0-9]{6,8}$/i, "");
    if (stripped.toLowerCase() === normalizedTarget) {
      return r;
    }
  }
  return null;
}

// Finds the most recently re-uploaded job-scoped calibration procedure
// file for a given job number, across ALL process stages (Incoming
// Calib, On-Going Calib, etc. — each stage saves to its own filename
// under the same job folder, see /templates/reupload below). Downloads
// always want the latest edit regardless of which stage produced it, so
// this is a single folder-wide search sorted by recency rather than a
// lookup for one particular stage's file.
//
// Returns null if this job hasn't had any stage re-upload a template
// yet, in which case the caller should fall back to the canonical
// master.
async function findLatestJobScopedTemplate(jobNumber) {
  if (!jobNumber) return null;
  const folder = `cdms/job-numbers/${jobNumber}/calibration-procedure`;

  const searchResult = await cloudinary.search
    .expression(`folder="${folder}"`)
    .sort_by("created_at", "desc")
    .max_results(1)
    .execute();

  return searchResult.resources?.[0] || null;
}

// ==========================
// DOWNLOAD A CALIBRATION PROCEDURE TEMPLATE (RAW / UNFILLED)
// ==========================
// Browsers ignore the <a download> attribute on cross-origin links, and
// Cloudinary URLs are always cross-origin from the app's own domain — so
// clicking Download in CalibrationProcedureLookupModal.jsx was just
// opening the file in a new tab instead of saving it. This route fetches
// the file from Cloudinary server-side and streams it back with an
// explicit Content-Disposition: attachment header, which forces a real
// download since the response is now same-origin.
//
// publicId is passed as a query param (not a route param) since it
// contains "/" characters from the folder path, which would otherwise
// need extra route-matching gymnastics.
//
// This stays a plain, unfilled copy of exactly what's stored in
// Cloudinary — used for browsing/downloading templates (including the
// job's own saved copies via JobFilesModal, which links straight to a
// resource's publicId without needing job-data-filling). For the
// calibration details modal's own Download button, which needs the
// current job's data written in AND needs to pick the right base file
// (this job's latest re-upload if one exists, else the blank master),
// see POST /templates/download-filled below instead.
router.get("/templates/download", async (req, res) => {
  try {
    const { publicId, filename } = req.query;
    if (!publicId) {
      return res
        .status(400)
        .json({ success: false, message: "publicId is required" });
    }

    // Look up the current secure_url rather than trusting one passed in
    // from the client — cheap call, and avoids ever proxying an
    // arbitrary attacker-supplied URL.
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: "raw",
    });

    const fileRes = await fetch(resource.secure_url);
    if (!fileRes.ok) {
      throw new Error(`Cloudinary fetch failed with ${fileRes.status}`);
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    const downloadName = filename || publicId.split("/").pop();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName}"`,
    );
    res.setHeader(
      "Content-Type",
      fileRes.headers.get("content-type") || "application/octet-stream",
    );
    res.send(buffer);
  } catch (err) {
    console.error("Template download failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// DOWNLOAD A CALIBRATION PROCEDURE TEMPLATE, FILLED WITH JOB DATA
// ==========================
// Called from IncomingCalibDetailsModal.jsx's Download button. Loads a
// base .xlsx workbook, writes the current job's data into the CDMS input
// sheet — the sheet every other tab in the workbook (Front Page, ws,
// Calib Data 1, etc.) pulls its values from via cross-sheet formulas like
// =CDMS!C3 — and streams back the filled copy.
//
// BASE WORKBOOK RESOLUTION — this is the important part. It is NOT
// always the canonical master. A job's process moves through several
// stages (Incoming Calib, On-Going Calib, ...), and each stage may
// download, edit offline, and re-upload its own working copy of the
// template scoped to that job (see /templates/reupload below). A later
// stage's download should build on top of whatever the most recent
// stage actually edited, not silently restart from the blank master. At
// the same time, the canonical master itself must NEVER be mutated by
// any of this — it has to stay exactly what was manually uploaded via
// the Cloudinary console, so the calibration procedure lookup list
// always shows the true, untouched blank form. So resolution order is:
//
//   1. This job's most recent re-upload, across ALL stages (see
//      findLatestJobScopedTemplate). If a stage already edited this
//      job's copy, later stages/downloads pick that up automatically.
//   2. The canonical master for this procedure code, found by search +
//      code match (see findCanonicalTemplateByCode) rather than a
//      guessed path — this is what keeps this route immune to the
//      duplicate-master bug that used to live in /templates/reupload.
//   3. The publicId the frontend happened to pass in, as a last-resort
//      fallback (kept for robustness — e.g. if search is briefly
//      inconsistent — never as the primary source of truth).
//
// Requires the base file to be a real .xlsx: ExcelJS can only read/write
// Open XML workbooks, not the legacy binary .xls (BIFF8) format.
//
// jobData.calibrationStandards holds up to 5 rows x 3 lookup codes
// (item1/item2/item3) — just bare codes, not full standard details. Each
// non-empty code here is resolved against GET /api/standards so the
// CDMS sheet's asset table (rows 17-32) gets full records: Asset No.,
// Serial No., Cert No., and Due Date, one matched code per asset row.
router.post("/templates/download-filled", async (req, res) => {
  try {
    const { publicId, code, filename, jobData } = req.body || {};
    const jd = jobData || {};

    if (!publicId && !code) {
      return res
        .status(400)
        .json({ success: false, message: "publicId or code is required" });
    }

    let baseResource = null;

    if (jd.jobNumber) {
      baseResource = await findLatestJobScopedTemplate(jd.jobNumber);
    }

    if (!baseResource && code) {
      baseResource = await findCanonicalTemplateByCode(code);
    }

    if (!baseResource && publicId) {
      try {
        baseResource = await cloudinary.api.resource(publicId, {
          resource_type: "raw",
        });
      } catch (err) {
        // Fall through to the not-found response below — a bad/stale
        // publicId here shouldn't crash the request when we've already
        // tried the more reliable lookups above.
      }
    }

    if (!baseResource) {
      return res.status(404).json({
        success: false,
        message:
          "No calibration procedure template could be found to fill. Please select one from the lookup.",
      });
    }

    const fileRes = await fetch(baseResource.secure_url);
    if (!fileRes.ok) {
      throw new Error(`Cloudinary fetch failed with ${fileRes.status}`);
    }
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const cdms = workbook.getWorksheet("CDMS");
    if (!cdms) {
      throw new Error("CDMS input sheet not found in this template");
    }
    const ws = workbook.getWorksheet("ws");
    if (!ws) {
      throw new Error("ws input sheet not found in this template");
    }

    cdms.getCell("C2").value = jd.jobNumber || "";
    cdms.getCell("C3").value = jd.companyName || "";
    cdms.getCell("C4").value = jd.companyAddress || "";
    cdms.getCell("C5").value = jd.contactCert || "";
    cdms.getCell("C7").value = jd.description || "";
    cdms.getCell("C8").value = jd.brand || "";
    cdms.getCell("C9").value = jd.model || "";
    cdms.getCell("C10").value = jd.serialNo || "";
    // CDMS!C11-C13 (DATE REC / DATE CAL / DATE DUE) are kept in sync too,
    // but nothing downstream actually reads them — see the ws!H1-H3
    // writes below, which is what Front Page's dates are really wired to.
    cdms.getCell("C11").value = jd.dateRec || "";
    cdms.getCell("C12").value = jd.dateCal || "";
    cdms.getCell("C13").value = jd.dateDue || "";

    // --- ws sheet direct inputs ---------------------------------------
    // Front Page pulls its dates from ws!H1/H2/H3 (merged H1:J1, H2:J2,
    // H3:J3), next to the "date rec / date cal / date due" labels in
    // column G — NOT from CDMS!C11-C13, which nothing reads. These are
    // the cells that actually need the values for the dates to show up
    // anywhere on the certificate.
    ws.getCell("H1").value = jd.dateRec || "";
    ws.getCell("H2").value = jd.dateCal || "";
    ws.getCell("H3").value = jd.dateDue || "";

    // OIC (row 7, merged B7:D7) — who calibrated the unit.
    ws.getCell("B7").value = jd.oicBy || "";
    // SIGN (row 8, merged B8:D8) — the SIG value from Incoming Calib
    // Details.
    ws.getCell("B8").value = jd.sig || "";

    // --- Asset table (rows 17-32) + "ex at" location -------------------
    // Resolve each item1/item2/item3 code against /api/standards, one
    // matched code -> one asset row. Column layout per row: C = Asset
    // No., D = Serial No., E = Cert No., F = Due Date (matches the
    // CDMS!C16:F16 header row).
    //
    // "ex at" (ws!A5, merged value cell B5:F5) is the location where the
    // calibration was carried out, pulled from the `location` field on
    // the standard/asset-monitoring record. Since it's a single cell but
    // a job can reference several standards, it's filled from the first
    // matched standard only.
    const codes = [];
    for (const row of jd.calibrationStandards || []) {
      for (const key of ["item1", "item2", "item3"]) {
        const c = row?.[key]?.trim();
        if (c) codes.push(c);
      }
    }

    if (codes.length > 0) {
      const standardsRes = await fetch(
        `${req.protocol}://${req.get("host")}/api/standards`,
      );
      const allStandards = standardsRes.ok ? await standardsRes.json() : [];
      const byCode = new Map(
        (Array.isArray(allStandards) ? allStandards : []).map((s) => [
          (s.code || s.standardId || "").toLowerCase(),
          s,
        ]),
      );

      let assetRow = 17;
      let exAtWritten = false;
      for (const c of codes) {
        const record = byCode.get(c.toLowerCase());

        if (record && !exAtWritten) {
          ws.getCell("B5").value = record.location || "";
          exAtWritten = true;
        }

        if (assetRow > 32) continue; // template only has 16 asset rows
        if (record) {
          cdms.getCell(`C${assetRow}`).value = record.assetNo || "";
          cdms.getCell(`D${assetRow}`).value = record.serialNo || "";
          cdms.getCell(`E${assetRow}`).value = record.certNo || "";
          cdms.getCell(`F${assetRow}`).value = record.dateDue || "";
        }
        assetRow++;
      }
    }

    const outBuffer = await workbook.xlsx.writeBuffer();
    const downloadName = filename || baseResource.public_id.split("/").pop();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName}"`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.send(Buffer.from(outBuffer));
  } catch (err) {
    console.error("Filled template download failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// RE-UPLOAD A CALIBRATION PROCEDURE TEMPLATE (JOB-SCOPED SAVE)
// ==========================
// Called from IncomingCalibDetailsModal.jsx's "Re-upload" button after a
// process stage downloads, edits, and re-uploads the template. This
// route ONLY saves THIS JOB's own working copy, under
// cdms/job-numbers/<jobNumber>/calibration-procedure/ — named
// "<jobNumber> - <stageLabel>" (e.g. "SSS-0001-26 - Incoming
// Calib.xlsx"). Re-uploading again for the same job + stage OVERWRITES
// this same file rather than accumulating a history. It lives inside
// the job's own folder, so it already shows up in the job's "View
// Files" list (GET /job-folder/:jobNumber/files below) without any
// extra fetch.
//
// IMPORTANT: this route does NOT touch the canonical master at
// cdms/templates-for-calibration/<code> — that file is maintained
// entirely by hand via the Cloudinary console and must always stay the
// pristine blank template shown in the calibration procedure lookup
// list. An earlier version of this route also tried to overwrite that
// canonical file on every re-upload (so "picking this code again
// elsewhere always gets the latest edit"), but that caused two real
// problems and has been removed:
//   1. It located the canonical file by guessing an exact path from the
//      display code, which doesn't match how manually console-uploaded
//      masters are actually named (they get a random uniqueness suffix,
//      e.g. "SSS-CP-020_zrvjbm.xlsx") — the guessed path 404'd, and the
//      route "fixed" that by creating a brand-new duplicate file, never
//      touching or replacing the real master.
//   2. Even when it DID find the right file, overwriting the canonical
//      master with a job's filled-and-edited copy meant every other job
//      that later picked the same procedure code would silently start
//      from that job's leftover data instead of a blank form.
// See POST /templates/download-filled above for how downloads now find
// the right base file (this job's latest re-upload, else the untouched
// canonical master) without ever needing to mutate the master.
//
// resourceType is "raw", so the extension must be part of the public_id
// itself — Cloudinary doesn't append it separately for raw resources.
router.post("/templates/reupload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file received" });
    }

    const { code, jobNumber, uploadedBy, stageLabel } = req.body;
    if (!code?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "code is required" });
    }
    if (!jobNumber?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "jobNumber is required" });
    }

    const originalName = req.file.originalname || "";
    const extMatch = originalName.match(/\.[^/.]+$/);
    const ext = extMatch ? extMatch[0].slice(1).toLowerCase() : "xlsx";

    const uploadedAt = new Date().toISOString();
    // Falls back to "Incoming Calib" if the frontend didn't pass a
    // stage label, matching IncomingCalibDetailsModal.jsx's own default.
    const label = stageLabel?.trim() || "Incoming Calib";

    // Job numbers are often formatted like "SSS/0001/26" and are used
    // elsewhere as literal Cloudinary folder path segments (see
    // equipment-photo above) — that's fine for the FOLDER, but a "/" in
    // the FILE NAME itself would break Content-Disposition and get
    // reinterpreted as more nested folders, so it's swapped for a dash
    // here (same convention as the filled-template download filename on
    // the frontend).
    const safeJobNumber = jobNumber.replace(/[\\/]/g, "-");

    // Save this job's own copy — job-scoped, not versioned, and never
    // touching the canonical master (see the comment block above this
    // route). Re-uploading again for the same job + stage overwrites
    // this exact file rather than creating a new one.
    const jobFolder = `cdms/job-numbers/${jobNumber}/calibration-procedure`;
    const jobPublicId = `${safeJobNumber} - ${label}.${ext}`;

    const jobCopyResult = await uploadBufferToCloudinary(req.file.buffer, {
      resourceType: "raw",
      folder: jobFolder,
      publicId: jobPublicId,
      overwrite: true,
      invalidate: true,
      context: {
        code,
        jobNumber,
        stageLabel: label,
        uploadedBy: uploadedBy || "",
      },
    });

    res.json({
      success: true,
      template: {
        code,
        name: code,
        format: jobCopyResult.format || ext,
        uploadedAt,
        uploadedBy: uploadedBy || "",
        // Job-scoped save details — what the frontend shows in its
        // success dialog, and what appears in the job's own folder
        // listing. There is no canonical publicId here anymore: this
        // route never creates or touches one.
        savedAs: jobPublicId,
        jobCopyPublicId: jobCopyResult.public_id,
      },
    });
  } catch (err) {
    console.error("Template re-upload failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================
// ENSURE STANDARD FOLDER EXISTS
// ==========================
// Called from CalibrationSystem.jsx on every Save/Update — even when no
// photo was taken this session — so every standardId gets a Cloudinary
// folder as soon as it's saved, instead of only getting one the first
// time a photo happens to be uploaded into it. standardId here must
// already have slashes swapped for underscores (the frontend does this
// before building the URL), matching the folder key used everywhere else
// in this router.
router.post("/standard-folder/:standardId", async (req, res) => {
  try {
    const standardId = decodeURIComponent(req.params.standardId);
    const folder = `cdms/standard-photos/${standardId}`;

    try {
      await cloudinary.api.create_folder(folder);
    } catch (err) {
      // Cloudinary throws if the folder already exists (or, on some
      // SDK versions, if the account is on Dynamic Folder mode where
      // folders are implicit) — either way that's not a real failure,
      // so swallow it rather than bubbling up a 500 for something the
      // user can't do anything about.
      const alreadyExists =
        err.http_code === 409 ||
        /already exists/i.test(err.error?.message || err.message || "");
      if (!alreadyExists) {
        throw err;
      }
    }

    res.json({ success: true, folder });
  } catch (err) {
    console.error("Failed to create standard folder:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ==========================
// ENSURE JOB NUMBER FOLDER EXISTS
// ==========================
// Called from JobReceipt.jsx's handleSave — right after a job number is
// successfully saved to Mongo — so every job number gets a general
// Cloudinary folder as soon as it's created, instead of only getting one
// the first time an equipment photo happens to be uploaded. This is the
// PARENT folder for everything related to that job number — equipment
// photos (via /equipment-photo/:jobNumber above) and the job's saved
// calibration-procedure copy (via /templates/reupload above) get nested
// inside it as subfolders, along with any other job-related files added
// later.
router.post("/job-folder/:jobNumber", async (req, res) => {
  try {
    const jobNumber = decodeURIComponent(req.params.jobNumber);
    const folder = `cdms/job-numbers/${jobNumber}`;

    try {
      await cloudinary.api.create_folder(folder);
    } catch (err) {
      // Cloudinary throws if the folder already exists (or, on some
      // SDK versions, if the account is on Dynamic Folder mode where
      // folders are implicit) — either way that's not a real failure,
      // so swallow it rather than bubbling up a 500 for something the
      // user can't do anything about.
      const alreadyExists =
        err.http_code === 409 ||
        /already exists/i.test(err.error?.message || err.message || "");
      if (!alreadyExists) {
        throw err;
      }
    }

    res.json({ success: true, folder });
  } catch (err) {
    console.error("Failed to create job number folder:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ==========================
// JOB NUMBER DOCUMENT UPLOAD (PDF, etc.)
// ==========================
// Called from JobNumberModal.jsx's "Upload PDF" button. Uploads into
// cdms/job-numbers/<jobNumber>/documents — a sibling subfolder to
// equipment-photos, both nested under the same general per-job-number
// folder created by /job-folder/:jobNumber below. resourceType "raw" is
// used since PDFs (and most non-image documents) aren't images.
//
// Unlike equipment photos, the uploaded document's URL is NOT written
// back onto jobForm/Mongo — documents are viewed purely by browsing the
// Cloudinary folder itself via GET /job-folder/:jobNumber/files below.
router.post(
  "/job-document/:jobNumber",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file received" });
      }

      const jobNumber = decodeURIComponent(req.params.jobNumber);
      const originalName = req.file.originalname || `document_${Date.now()}`;

      // Split into name + extension. For resource_type "raw", Cloudinary
      // treats public_id as the literal, final file name — there's no
      // separate "format" it appends the way it does for image/video
      // resources. So the extension MUST be part of publicId itself, or
      // the uploaded file is served (and downloaded) with no extension
      // at all, which is exactly why browsers can't figure out how to
      // open it afterwards (Chrome flags it as an unrecognized file and
      // saves it extension-less).
      const extMatch = originalName.match(/\.[^/.]+$/);
      const ext = extMatch ? extMatch[0] : ""; // e.g. ".pdf", or "" if none
      const nameWithoutExt = ext
        ? originalName.slice(0, -ext.length)
        : originalName;

      const result = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: "raw",
        folder: `cdms/job-numbers/${jobNumber}/documents`,
        // Timestamp suffix (before the extension) avoids collisions if
        // the same filename is uploaded twice for the same job number —
        // unlike standard photos, documents are meant to accumulate, not
        // overwrite. Extension goes LAST so the stored/served file still
        // ends in ".pdf" (or whatever it originally was).
        publicId: `${nameWithoutExt}_${Date.now()}${ext}`,
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        originalName,
      });
    } catch (err) {
      console.error("Job document upload failed:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ==========================
// LIST JOB NUMBER FOLDER FILES (Open Folder / View Files)
// ==========================
// Called from JobFolderModal.jsx and from
// IncomingCalibDetailsModal.jsx's "View Files" button. Lists every file
// under cdms/job-numbers/<jobNumber>/** — equipment-photos, documents,
// AND the job's own saved calibration-procedure copies from every stage
// (see POST /templates/reupload above) — in one call, using the Search
// API's wildcard folder match (unlike the exact folder="..." match used
// by /standard-photo/:standardId/files, since files here live across
// multiple subfolders rather than directly in one folder).
router.get("/job-folder/:jobNumber/files", async (req, res) => {
  try {
    const jobNumber = decodeURIComponent(req.params.jobNumber);
    const folder = `cdms/job-numbers/${jobNumber}`;

    const searchResult = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .sort_by("created_at", "desc")
      .max_results(500)
      .execute();

    const files = (searchResult.resources || []).map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      folder: r.folder,
      createdAt: r.created_at,
      bytes: r.bytes,
      format: r.format,
      resourceType: r.resource_type,
    }));

    res.json({ success: true, files });
  } catch (err) {
    console.error("Failed to list job folder files:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
