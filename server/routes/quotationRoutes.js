// const express = require("express");
// const path = require("path");
// const fs = require("fs");
// const PizZip = require("pizzip");
// const Docxtemplater = require("docxtemplater");
// const ImageModule = require("docxtemplater-image-module-free");
// const { getDb } = require("../config/db");
// const upload = require("../middleware/upload");
// const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
// const { getSignatureImageBuffer } = require("../utils/cloudinarySignature");
// const { requireRole } = require("../middleware/requireRole");
// const {
//   getNextSequence,
//   pad4,
//   currentYearSuffix,
// } = require("../utils/counters");

// const router = express.Router();

// // A plain white 120x50 PNG — used so the template still renders cleanly
// // if a signature genuinely isn't available yet (e.g. not checked yet).
// // A stretched 1x1 transparent pixel flattens to black in some renderers
// // (Word/LibreOffice), so this uses a real white placeholder sized to
// // match getSize() instead.
// const BLANK_PNG = Buffer.from(
//   "iVBORw0KGgoAAAANSUhEUgAAAHgAAAAyCAIAAAAYxYiPAAAAiUlEQVR4nO3QQREAIRDAsOP8e15UUB4kCjpdM/Nx3n874BVGR4yOGB0xOmJ0xOiI0RGjI0ZHjI4YHTE6YnTE6IjREaMjRkeMjhgdMTpidMToiNERoyNGR4yOGB0xOmJ0xOiI0RGjI0ZHjI4YHTE6YnTE6IjREaMjRkeMjhgdMTpidMToiNERoyMbxYYDYUTO49kAAAAASUVORK5CYII=",
//   "base64",
// );

// // GET next Quotation ID preview
// // NOTE: must stay registered before "/:quotationId" below, or Express will
// // try to match "next-id" as a quotationId value.
// router.get("/next-id", async (req, res) => {
//   try {
//     const db = getDb();
//     const counter = await db
//       .collection("counters")
//       .findOne({ _id: "quotationID" });
//     const nextSeq = (counter?.seq || 0) + 1;
//     const nextQuotationId = `QTN/${pad4(nextSeq)}/${currentYearSuffix()}`;
//     res.json({ nextQuotationId });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const quotations = await db
//       .collection("quotations")
//       .find()
//       .sort({ createdAt: -1 })
//       .toArray();
//     res.json(quotations);
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // POST save quotation — quotationId is generated atomically here, same
// // counter pattern as job receipts, so it's never a stale client-side value.
// router.post("/", async (req, res) => {
//   try {
//     const db = getDb();
//     const seq = await getNextSequence(db, "quotationID");
//     const quotationId = `QTN/${pad4(seq)}/${currentYearSuffix()}`;

//     // Ignore whatever quotationId the client sent (it was only a preview) —
//     // the server-generated one is the source of truth.
//     const { quotationId: _clientId, ...rest } = req.body;

//     const newQuotation = {
//       ...rest,
//       quotationId,
//       status: "Creating",
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("quotations").insertOne(newQuotation);
//     res.status(201).json({ success: true, quotationId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // GET a single quotation by quotationId
// router.get("/:quotationId", async (req, res) => {
//   try {
//     const db = getDb();
//     const quotation = await db
//       .collection("quotations")
//       .findOne({ quotationId: decodeURIComponent(req.params.quotationId) });

//     if (!quotation) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quotation not found" });
//     }
//     res.json(quotation);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// router.get("/:quotationId/download-template", async (req, res) => {
//   try {
//     const db = getDb();
//     const quotationId = decodeURIComponent(req.params.quotationId);
//     const quotation = await db
//       .collection("quotations")
//       .findOne({ quotationId });
//     if (!quotation) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quotation not found" });
//     }

//     // Allow the caller to preview a DIFFERENT approver than whatever is
//     // currently saved (e.g. someone picked in the dropdown but hasn't
//     // formally uploaded a signed file yet). Falls back to the stored
//     // value when no override is passed, so the normal saved-record flow
//     // is unaffected.
//     const approverUsername =
//       req.query.approverUsername || quotation.checkedByUsername;
//     const approverName = req.query.approverName || quotation.checkedBy;

//     const [clerkSigBuffer, adminSigBuffer] = await Promise.all([
//       getSignatureImageBuffer("clerk", quotation.preparedByUsername),
//       getSignatureImageBuffer("admin", approverUsername),
//     ]);

//     const templatePath = path.join(
//       __dirname,
//       "..",
//       "templates/quotation_template_master.docx",
//     );
//     const content = fs.readFileSync(templatePath, "binary");
//     const zip = new PizZip(content);

//     const imageModule = new ImageModule({
//       centered: false,
//       fileType: "docx",
//       getImage: (tagValue, tagName) => {
//         console.log(
//           `getImage called for tag "${tagName}" — type: ${typeof tagValue}, isBuffer: ${Buffer.isBuffer(tagValue)}`,
//         );
//         if (Buffer.isBuffer(tagValue)) return tagValue;
//         return BLANK_PNG;
//       },
//       getSize: () => [120, 50],
//     });

//     const doc = new Docxtemplater(zip, {
//       paragraphLoop: true,
//       linebreaks: true,
//       modules: [imageModule],
//     });

//     const renderData = {
//       quotationId: quotation.quotationId,
//       date: quotation.date,
//       companyName: quotation.companyName,
//       companyAddress: quotation.address,
//       contactName: quotation.contactName,
//       reference: quotation.reference,
//       // preparedBy is who created/typed the quotation; approvedBy is
//       // whoever was SELECTED as approver in the check-stage dropdown
//       // (checkedBy) — these are independent people.
//       preparedBy: quotation.preparedBy || "",
//       approvedBy: approverName || "",
//       clerkSignature: clerkSigBuffer || BLANK_PNG,
//       adminSignature: adminSigBuffer || BLANK_PNG,
//     };
//     console.log(
//       "clerkSigBuffer:",
//       clerkSigBuffer ? clerkSigBuffer.length : null,
//     );
//     console.log(
//       "adminSigBuffer:",
//       adminSigBuffer ? adminSigBuffer.length : null,
//     );

//     // Image module needs an async resolve pass (fetches/sizes each
//     // image) before rendering — renderAsync handles both steps
//     // correctly in one call. Only call this ONCE per Docxtemplater
//     // instance — calling it twice throws "render_twice".
//     try {
//       await doc.renderAsync(renderData);
//       console.log("render succeeded");
//     } catch (renderErr) {
//       console.error("renderAsync failed:", renderErr);
//       if (renderErr.properties) {
//         console.error(
//           "Docxtemplater error detail:",
//           JSON.stringify(renderErr.properties, null, 2),
//         );
//       }
//       throw renderErr;
//     }

//     const buf = doc.getZip().generate({ type: "nodebuffer" });
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${quotation.quotationId.replace(/\//g, "-")}.docx"`,
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     );
//     res.send(buf);
//   } catch (err) {
//     console.error("Template generation failed:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
// // PUT auto-insert the approver's name + signature into whichever file
// // currently represents the quotation's real content (the checker's own
// // re-upload if one exists, otherwise the staff's originally filled-in
// // template) -> "For Sending".
// //
// // Uses a SECOND render pass with [[ ]] delimiters — distinct from the
// // { } delimiters used when the blank template was first generated —
// // so this only touches the approver tags and leaves everything the
// // staff typed completely untouched. Requires the master template's
// // approvedBy/adminSignature tags to actually use [[ ]] syntax; if they
// // still use { }, they'll already be resolved (blank) by the time this
// // runs, and this route will have nothing left to fill in.
// router.put("/:quotationId/apply-approval", async (req, res) => {
//   try {
//     const db = getDb();
//     const quotationId = decodeURIComponent(req.params.quotationId);
//     const { approverUsername, approverName } = req.body;

//     if (!approverUsername || !approverName) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Approver is required" });
//     }

//     const quotation = await db
//       .collection("quotations")
//       .findOne({ quotationId });
//     if (!quotation) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quotation not found" });
//     }

//     const sourceUrl = quotation.signedFileUrl || quotation.staffFileUrl;
//     if (!sourceUrl) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No template file uploaded yet" });
//     }

//     const sourceRes = await fetch(sourceUrl);
//     if (!sourceRes.ok) {
//       throw new Error(`Failed to fetch source file (${sourceRes.status})`);
//     }
//     const sourceBuffer = Buffer.from(await sourceRes.arrayBuffer());

//     const adminSigBuffer = await getSignatureImageBuffer(
//       "admin",
//       approverUsername,
//     );

//     const zip = new PizZip(sourceBuffer);

//     const imageModule = new ImageModule({
//       centered: false,
//       fileType: "docx",
//       getImage: (tagValue) =>
//         Buffer.isBuffer(tagValue) ? tagValue : BLANK_PNG,
//       getSize: () => [120, 50],
//     });

//     const doc = new Docxtemplater(zip, {
//       paragraphLoop: true,
//       linebreaks: true,
//       delimiters: { start: "[[", end: "]]" },
//       modules: [imageModule],
//     });

//     await doc.renderAsync({
//       approvedBy: approverName,
//       adminSignature: adminSigBuffer || BLANK_PNG,
//     });

//     const buf = doc.getZip().generate({ type: "nodebuffer" });

//     const publicId = `signed_${Date.now()}.docx`;
//     const uploadResult = await uploadBufferToCloudinary(buf, {
//       resourceType: "raw",
//       folder: `cdms/quotations/${quotationId}`,
//       publicId,
//     });

//     const updated = await db.collection("quotations").findOneAndUpdate(
//       { quotationId },
//       {
//         $set: {
//           status: "For Sending",
//           signedFileUrl: uploadResult.secure_url,
//           signedFileName: `${quotationId.replace(/\//g, "-")}-SIGNED.docx`,
//           checkedBy: approverName,
//           checkedByUsername: approverUsername,
//           updatedAt: new Date().toISOString(),
//         },
//       },
//       { returnDocument: "after" },
//     );

//     res.json({ success: true, quotation: updated });
//   } catch (err) {
//     console.error("Apply approval failed:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // PUT update an existing quotation by quotationId
// router.put("/:quotationId", async (req, res) => {
//   try {
//     const db = getDb();
//     const { quotationId, ...updateData } = req.body;
//     const targetQuotationId = decodeURIComponent(req.params.quotationId);

//     const result = await db
//       .collection("quotations")
//       .updateOne({ quotationId: targetQuotationId }, { $set: updateData });

//     if (result.matchedCount === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quotation not found" });
//     }
//     res.json({ success: true, quotationId: targetQuotationId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // PUT staff uploads their filled-in template -> "For Checking"
// router.put(
//   "/:quotationId/upload-template",
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       const db = getDb();
//       if (!req.file) {
//         return res
//           .status(400)
//           .json({ success: false, message: "No file received" });
//       }
//       const quotationId = decodeURIComponent(req.params.quotationId);

//       // Preserve the original file's extension so Cloudinary's raw
//       // delivery URL — and therefore the downloaded file — actually
//       // carries a usable extension (.docx, .pdf, etc).
//       const ext = path.extname(req.file.originalname || "");
//       const publicId = `staff_${Date.now()}${ext}`;

//       const result = await uploadBufferToCloudinary(req.file.buffer, {
//         resourceType: "raw",
//         folder: `cdms/quotations/${quotationId}`,
//         publicId,
//       });

//       const updated = await db.collection("quotations").findOneAndUpdate(
//         { quotationId },
//         {
//           $set: {
//             status: "For Checking",
//             staffFileUrl: result.secure_url,
//             staffFileName: req.file.originalname, // keep for a nice download filename
//             updatedAt: new Date().toISOString(),
//           },
//         },
//         { returnDocument: "after" },
//       );

//       if (!updated) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Quotation not found" });
//       }
//       res.json({ success: true, quotation: updated });
//     } catch (err) {
//       console.error("Template upload failed:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },
// );

// // PUT staff uploads proof of client communication (e.g. a printed/
// // scanned email) — supporting documentation only. Does NOT change
// // quotation status and is entirely optional.
// router.put(
//   "/:quotationId/upload-client-proof",
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       const db = getDb();
//       if (!req.file) {
//         return res
//           .status(400)
//           .json({ success: false, message: "No file received" });
//       }
//       const quotationId = decodeURIComponent(req.params.quotationId);

//       // Same extension-preservation fix as upload-template, so the
//       // Cloudinary URL (and any download built from it) has a real
//       // .pdf/.docx extension instead of a bare timestamp.
//       const ext = path.extname(req.file.originalname || "");
//       const publicId = `client_proof_${Date.now()}${ext}`;

//       const result = await uploadBufferToCloudinary(req.file.buffer, {
//         resourceType: "raw",
//         folder: `cdms/quotations/${quotationId}`,
//         publicId,
//       });

//       const updated = await db.collection("quotations").findOneAndUpdate(
//         { quotationId },
//         {
//           $set: {
//             clientProofUrl: result.secure_url,
//             clientProofName: req.file.originalname,
//             updatedAt: new Date().toISOString(),
//           },
//         },
//         { returnDocument: "after" },
//       );

//       if (!updated) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Quotation not found" });
//       }
//       res.json({ success: true, quotation: updated });
//     } catch (err) {
//       console.error("Client proof upload failed:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },
// );

// // PUT checker uploads the signed file -> "For Sending"
// // Role check runs after multer (same order as the original), so a
// // non-checker's multipart body still gets parsed before being rejected —
// // matches prior behavior exactly.
// router.put(
//   "/:quotationId/upload-signed",
//   upload.single("file"),
//   requireRole("admin", "clerk"),
//   async (req, res) => {
//     try {
//       const db = getDb();
//       if (!req.file) {
//         return res
//           .status(400)
//           .json({ success: false, message: "No file received" });
//       }
//       const quotationId = decodeURIComponent(req.params.quotationId);

//       // Preserve the original extension, same fix as upload-template,
//       // so the Cloudinary URL (and downloads built from it) actually
//       // carry a usable extension like .docx/.pdf.
//       const ext = path.extname(req.file.originalname || "");
//       const publicId = `signed_${Date.now()}${ext}`;

//       const result = await uploadBufferToCloudinary(req.file.buffer, {
//         resourceType: "raw",
//         folder: `cdms/quotations/${quotationId}`,
//         publicId,
//       });

//       // checkedBy/checkedByUsername record who APPROVED the quotation
//       // (selected via the "Approved By" dropdown in
//       // QuotationDetailsModal — sent as approverName/approverUsername in
//       // the multipart body), which may be a different person from
//       // whoever is physically uploading the file. Falls back to the
//       // uploader's own identity (x-user-name) if no approver was
//       // explicitly selected — keeps older clients working.
//       const updated = await db.collection("quotations").findOneAndUpdate(
//         { quotationId },
//         {
//           $set: {
//             status: "For Sending",
//             signedFileUrl: result.secure_url,
//             signedFileName: req.file.originalname,
//             checkedBy:
//               req.body.approverName || req.headers["x-user-name"] || "",
//             checkedByUsername:
//               req.body.approverUsername || req.headers["x-user-name"] || "",
//             updatedAt: new Date().toISOString(),
//           },
//         },
//         { returnDocument: "after" },
//       );

//       if (!updated) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Quotation not found" });
//       }
//       res.json({ success: true, quotation: updated });
//     } catch (err) {
//       console.error("Signed file upload failed:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },
// );

// // PUT mark quotation as sent to client
// router.put("/:quotationId/mark-sent", async (req, res) => {
//   try {
//     const db = getDb();
//     const quotationId = decodeURIComponent(req.params.quotationId);
//     const updated = await db.collection("quotations").findOneAndUpdate(
//       { quotationId },
//       {
//         $set: {
//           status: "Sent",
//           sentBy: req.body.sentBy || "",
//           sentAt: new Date().toISOString(),
//         },
//       },
//       { returnDocument: "after" },
//     );
//     if (!updated) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quotation not found" });
//     }
//     res.json({ success: true, quotation: updated });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const path = require("path");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module-free");
const { getDb } = require("../config/db");
const upload = require("../middleware/upload");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const { getSignatureImageBuffer } = require("../utils/cloudinarySignature");
const { requireRole } = require("../middleware/requireRole");
const { sendEmail } = require("../utils/mailer");
const {
  getNextSequence,
  pad4,
  currentYearSuffix,
} = require("../utils/counters");

const router = express.Router();

// Email transport (Resend API or SMTP) is chosen automatically in
// ../utils/mailer.js based on environment variables.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Resolve the company's email from the customers collection.
// Quotation stores `customerId`; customer docs store `customerID`.
// Falls back to companyName if the ID lookup finds nothing.
async function findCustomerEmail(db, quotation) {
  const customers = db.collection("customers"); // adjust if named differently
  let customer = null;
  if (quotation.customerId) {
    customer = await customers.findOne({ customerID: quotation.customerId });
  }
  if (!customer && quotation.companyName) {
    customer = await customers.findOne({ companyName: quotation.companyName });
  }
  return (customer?.email || "").trim();
}

// A plain white 120x50 PNG — used so the template still renders cleanly
// if a signature genuinely isn't available yet (e.g. not checked yet).
// A stretched 1x1 transparent pixel flattens to black in some renderers
// (Word/LibreOffice), so this uses a real white placeholder sized to
// match getSize() instead.
const BLANK_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAHgAAAAyCAIAAAAYxYiPAAAAiUlEQVR4nO3QQREAIRDAsOP8e15UUB4kCjpdM/Nx3n874BVGR4yOGB0xOmJ0xOiI0RGjI0ZHjI4YHTE6YnTE6IjREaMjRkeMjhgdMTpidMToiNERoyNGR4yOGB0xOmJ0xOiI0RGjI0ZHjI4YHTE6YnTE6IjREaMjRkeMjhgdMTpidMToiNERoyMbxYYDYUTO49kAAAAASUVORK5CYII=",
  "base64",
);

// GET next Quotation ID preview
// NOTE: must stay registered before "/:quotationId" below, or Express will
// try to match "next-id" as a quotationId value.
router.get("/next-id", async (req, res) => {
  try {
    const db = getDb();
    const counter = await db
      .collection("counters")
      .findOne({ _id: "quotationID" });
    const nextSeq = (counter?.seq || 0) + 1;
    const nextQuotationId = `QTN/${pad4(nextSeq)}/${currentYearSuffix()}`;
    res.json({ nextQuotationId });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const quotations = await db
      .collection("quotations")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST save quotation — quotationId is generated atomically here, same
// counter pattern as job receipts, so it's never a stale client-side value.
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const seq = await getNextSequence(db, "quotationID");
    const quotationId = `QTN/${pad4(seq)}/${currentYearSuffix()}`;

    // Ignore whatever quotationId the client sent (it was only a preview) —
    // the server-generated one is the source of truth.
    const { quotationId: _clientId, ...rest } = req.body;

    const newQuotation = {
      ...rest,
      quotationId,
      status: "Creating",
      createdAt: new Date().toISOString(),
    };

    await db.collection("quotations").insertOne(newQuotation);
    res.status(201).json({ success: true, quotationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET a single quotation by quotationId
router.get("/:quotationId", async (req, res) => {
  try {
    const db = getDb();
    const quotation = await db
      .collection("quotations")
      .findOne({ quotationId: decodeURIComponent(req.params.quotationId) });

    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }
    res.json(quotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET the email address a quotation would be sent to (looked up from
// the customers collection) — used by the modal to display the recipient.
router.get("/:quotationId/recipient", async (req, res) => {
  try {
    const db = getDb();
    const quotationId = decodeURIComponent(req.params.quotationId);
    const quotation = await db
      .collection("quotations")
      .findOne({ quotationId });
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }
    const email = await findCustomerEmail(db, quotation);
    res.json({ success: true, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:quotationId/download-template", async (req, res) => {
  try {
    const db = getDb();
    const quotationId = decodeURIComponent(req.params.quotationId);
    const quotation = await db
      .collection("quotations")
      .findOne({ quotationId });
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }

    // Allow the caller to preview a DIFFERENT approver than whatever is
    // currently saved (e.g. someone picked in the dropdown but hasn't
    // formally uploaded a signed file yet). Falls back to the stored
    // value when no override is passed, so the normal saved-record flow
    // is unaffected.
    const approverUsername =
      req.query.approverUsername || quotation.checkedByUsername;
    const approverName = req.query.approverName || quotation.checkedBy;

    const [clerkSigBuffer, adminSigBuffer] = await Promise.all([
      getSignatureImageBuffer("clerk", quotation.preparedByUsername),
      getSignatureImageBuffer("admin", approverUsername),
    ]);

    const templatePath = path.join(
      __dirname,
      "..",
      "templates/quotation_template_master.docx",
    );
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    const imageModule = new ImageModule({
      centered: false,
      fileType: "docx",
      getImage: (tagValue, tagName) => {
        console.log(
          `getImage called for tag "${tagName}" — type: ${typeof tagValue}, isBuffer: ${Buffer.isBuffer(tagValue)}`,
        );
        if (Buffer.isBuffer(tagValue)) return tagValue;
        return BLANK_PNG;
      },
      getSize: () => [120, 50],
    });

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });

    const renderData = {
      quotationId: quotation.quotationId,
      date: quotation.date,
      companyName: quotation.companyName,
      companyAddress: quotation.address,
      contactName: quotation.contactName,
      reference: quotation.reference,
      // preparedBy is who created/typed the quotation; approvedBy is
      // whoever was SELECTED as approver in the check-stage dropdown
      // (checkedBy) — these are independent people.
      preparedBy: quotation.preparedBy || "",
      approvedBy: approverName || "",
      clerkSignature: clerkSigBuffer || BLANK_PNG,
      adminSignature: adminSigBuffer || BLANK_PNG,
    };
    console.log(
      "clerkSigBuffer:",
      clerkSigBuffer ? clerkSigBuffer.length : null,
    );
    console.log(
      "adminSigBuffer:",
      adminSigBuffer ? adminSigBuffer.length : null,
    );

    // Image module needs an async resolve pass (fetches/sizes each
    // image) before rendering — renderAsync handles both steps
    // correctly in one call. Only call this ONCE per Docxtemplater
    // instance — calling it twice throws "render_twice".
    try {
      await doc.renderAsync(renderData);
      console.log("render succeeded");
    } catch (renderErr) {
      console.error("renderAsync failed:", renderErr);
      if (renderErr.properties) {
        console.error(
          "Docxtemplater error detail:",
          JSON.stringify(renderErr.properties, null, 2),
        );
      }
      throw renderErr;
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${quotation.quotationId.replace(/\//g, "-")}.docx"`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.send(buf);
  } catch (err) {
    console.error("Template generation failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT auto-insert the approver's name + signature into whichever file
// currently represents the quotation's real content, and store the
// result as the signed copy. Does NOT change the status.
//
// Uses a SECOND render pass with [[ ]] delimiters — distinct from the
// { } delimiters used when the blank template was first generated —
// so this only touches the approver tags and leaves everything the
// staff typed completely untouched. Requires the master template's
// approvedBy/adminSignature tags to actually use [[ ]] syntax; if they
// still use { }, they'll already be resolved (blank) by the time this
// runs, and this route will have nothing left to fill in.
router.put("/:quotationId/apply-approval", async (req, res) => {
  try {
    const db = getDb();
    const quotationId = decodeURIComponent(req.params.quotationId);
    const { approverUsername, approverName } = req.body;

    if (!approverUsername || !approverName) {
      return res
        .status(400)
        .json({ success: false, message: "Approver is required" });
    }

    const quotation = await db
      .collection("quotations")
      .findOne({ quotationId });
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }

    // Source file for the [[ ]] render pass. A previously GENERATED signed
    // copy has its approver tags already filled in, so re-approving (e.g.
    // after picking a different approver) must start again from the
    // staff's original file. A signed file the checker manually
    // re-uploaded (or a legacy record) is still used as the source.
    const sourceUrl =
      quotation.signedFileUrl && quotation.signedSource !== "generated"
        ? quotation.signedFileUrl
        : quotation.staffFileUrl;
    if (!sourceUrl) {
      return res
        .status(400)
        .json({ success: false, message: "No template file uploaded yet" });
    }

    const sourceRes = await fetch(sourceUrl);
    if (!sourceRes.ok) {
      throw new Error(`Failed to fetch source file (${sourceRes.status})`);
    }
    const sourceBuffer = Buffer.from(await sourceRes.arrayBuffer());

    const adminSigBuffer = await getSignatureImageBuffer(
      "admin",
      approverUsername,
    );

    const zip = new PizZip(sourceBuffer);

    const imageModule = new ImageModule({
      centered: false,
      fileType: "docx",
      getImage: (tagValue) =>
        Buffer.isBuffer(tagValue) ? tagValue : BLANK_PNG,
      getSize: () => [120, 50],
    });

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "[[", end: "]]" },
      modules: [imageModule],
    });

    await doc.renderAsync({
      approvedBy: approverName,
      adminSignature: adminSigBuffer || BLANK_PNG,
    });

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    const publicId = `signed_${Date.now()}.docx`;
    const uploadResult = await uploadBufferToCloudinary(buf, {
      resourceType: "raw",
      folder: `cdms/quotations/${quotationId}`,
      publicId,
    });

    const updated = await db.collection("quotations").findOneAndUpdate(
      { quotationId },
      {
        // NOTE: status is intentionally NOT changed here. The signed copy
        // is only stored; the quotation moves to "For Sending" when the
        // user clicks "Save & Move to Sending" (PUT .../move-to-sending).
        $set: {
          signedFileUrl: uploadResult.secure_url,
          signedFileName: `${quotationId.replace(/\//g, "-")}-SIGNED.docx`,
          signedSource: "generated",
          checkedBy: approverName,
          checkedByUsername: approverUsername,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );

    res.json({ success: true, quotation: updated });
  } catch (err) {
    console.error("Apply approval failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update an existing quotation by quotationId
router.put("/:quotationId", async (req, res) => {
  try {
    const db = getDb();
    const { quotationId, ...updateData } = req.body;
    const targetQuotationId = decodeURIComponent(req.params.quotationId);

    const result = await db
      .collection("quotations")
      .updateOne({ quotationId: targetQuotationId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }
    res.json({ success: true, quotationId: targetQuotationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT staff uploads their filled-in template -> "For Checking"
router.put(
  "/:quotationId/upload-template",
  upload.single("file"),
  async (req, res) => {
    try {
      const db = getDb();
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file received" });
      }
      const quotationId = decodeURIComponent(req.params.quotationId);

      // Preserve the original file's extension so Cloudinary's raw
      // delivery URL — and therefore the downloaded file — actually
      // carries a usable extension (.docx, .pdf, etc).
      const ext = path.extname(req.file.originalname || "");
      const publicId = `staff_${Date.now()}${ext}`;

      const result = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: "raw",
        folder: `cdms/quotations/${quotationId}`,
        publicId,
      });

      const updated = await db.collection("quotations").findOneAndUpdate(
        { quotationId },
        {
          $set: {
            status: "For Checking",
            staffFileUrl: result.secure_url,
            staffFileName: req.file.originalname, // keep for a nice download filename
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: "after" },
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Quotation not found" });
      }
      res.json({ success: true, quotation: updated });
    } catch (err) {
      console.error("Template upload failed:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// PUT staff uploads proof of client communication (e.g. a printed/
// scanned email) — supporting documentation only. Does NOT change
// quotation status and is entirely optional.
router.put(
  "/:quotationId/upload-client-proof",
  upload.single("file"),
  async (req, res) => {
    try {
      const db = getDb();
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file received" });
      }
      const quotationId = decodeURIComponent(req.params.quotationId);

      // Same extension-preservation fix as upload-template, so the
      // Cloudinary URL (and any download built from it) has a real
      // .pdf/.docx extension instead of a bare timestamp.
      const ext = path.extname(req.file.originalname || "");
      const publicId = `client_proof_${Date.now()}${ext}`;

      const result = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: "raw",
        folder: `cdms/quotations/${quotationId}`,
        publicId,
      });

      const updated = await db.collection("quotations").findOneAndUpdate(
        { quotationId },
        {
          $set: {
            clientProofUrl: result.secure_url,
            clientProofName: req.file.originalname,
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: "after" },
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Quotation not found" });
      }
      res.json({ success: true, quotation: updated });
    } catch (err) {
      console.error("Client proof upload failed:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// PUT move a quotation from "For Checking" -> "For Sending" using the
// signed copy that already exists (generated via apply-approval).
// This is the final step of the check stage — no file upload needed.
router.put(
  "/:quotationId/move-to-sending",
  requireRole("admin", "clerk"),
  async (req, res) => {
    try {
      const db = getDb();
      const quotationId = decodeURIComponent(req.params.quotationId);
      const quotation = await db
        .collection("quotations")
        .findOne({ quotationId });
      if (!quotation) {
        return res
          .status(404)
          .json({ success: false, message: "Quotation not found" });
      }
      if (quotation.status !== "For Checking") {
        return res.status(409).json({
          success: false,
          message: "Quotation is not in 'For Checking' status.",
        });
      }
      if (!quotation.signedFileUrl) {
        return res.status(400).json({
          success: false,
          message:
            "No signed copy yet. Generate one (or upload a signed file) first.",
        });
      }

      const updated = await db.collection("quotations").findOneAndUpdate(
        { quotationId, status: "For Checking" },
        {
          $set: {
            status: "For Sending",
            checkedBy:
              req.body.approverName ||
              quotation.checkedBy ||
              req.headers["x-user-name"] ||
              "",
            checkedByUsername:
              req.body.approverUsername ||
              quotation.checkedByUsername ||
              req.headers["x-user-name"] ||
              "",
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: "after" },
      );

      res.json({ success: true, quotation: updated });
    } catch (err) {
      console.error("Move to sending failed:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// PUT checker uploads the signed file -> "For Sending"
// Role check runs after multer (same order as the original), so a
// non-checker's multipart body still gets parsed before being rejected —
// matches prior behavior exactly.
router.put(
  "/:quotationId/upload-signed",
  upload.single("file"),
  requireRole("admin", "clerk"),
  async (req, res) => {
    try {
      const db = getDb();
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file received" });
      }
      const quotationId = decodeURIComponent(req.params.quotationId);

      // Preserve the original extension, same fix as upload-template,
      // so the Cloudinary URL (and downloads built from it) actually
      // carry a usable extension like .docx/.pdf.
      const ext = path.extname(req.file.originalname || "");
      const publicId = `signed_${Date.now()}${ext}`;

      const result = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: "raw",
        folder: `cdms/quotations/${quotationId}`,
        publicId,
      });

      // checkedBy/checkedByUsername record who APPROVED the quotation
      // (selected via the "Approved By" dropdown in
      // QuotationDetailsModal — sent as approverName/approverUsername in
      // the multipart body), which may be a different person from
      // whoever is physically uploading the file. Falls back to the
      // uploader's own identity (x-user-name) if no approver was
      // explicitly selected — keeps older clients working.
      const updated = await db.collection("quotations").findOneAndUpdate(
        { quotationId },
        {
          $set: {
            status: "For Sending",
            signedFileUrl: result.secure_url,
            signedFileName: req.file.originalname,
            signedSource: "upload",
            checkedBy:
              req.body.approverName || req.headers["x-user-name"] || "",
            checkedByUsername:
              req.body.approverUsername || req.headers["x-user-name"] || "",
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: "after" },
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Quotation not found" });
      }
      res.json({ success: true, quotation: updated });
    } catch (err) {
      console.error("Signed file upload failed:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// POST email the signed file to the company (address looked up from the
// customers collection). The status stays "For Sending" — only the
// emailSentTo/emailSentBy/emailSentAt fields are recorded. The user then
// clicks "Mark as Sent" to finish. Can be repeated to re-send.
router.post(
  "/:quotationId/send",
  requireRole("admin", "clerk"),
  async (req, res) => {
    try {
      const db = getDb();
      const quotationId = decodeURIComponent(req.params.quotationId);
      const quotation = await db
        .collection("quotations")
        .findOne({ quotationId });

      if (!quotation) {
        return res
          .status(404)
          .json({ success: false, message: "Quotation not found" });
      }
      if (quotation.status !== "For Sending") {
        return res.status(409).json({
          success: false,
          message: "Quotation is not in 'For Sending' status.",
        });
      }
      if (!quotation.signedFileUrl) {
        return res
          .status(400)
          .json({ success: false, message: "No signed file to send." });
      }

      const to = await findCustomerEmail(db, quotation);
      if (!EMAIL_RE.test(to)) {
        return res.status(400).json({
          success: false,
          message:
            "This customer has no valid email on record. Add one to the customer first.",
        });
      }

      // Fetch the signed file from Cloudinary and attach it
      const fileRes = await fetch(quotation.signedFileUrl);
      if (!fileRes.ok) {
        throw new Error(`Could not fetch signed file (${fileRes.status})`);
      }
      const buffer = Buffer.from(await fileRes.arrayBuffer());

      const ext =
        (quotation.signedFileName || "").match(/\.[a-zA-Z0-9]+$/)?.[0] ||
        ".docx";
      const filename = `${quotationId.replace(/\//g, "-")}${ext}`;

      await sendEmail({
        to,
        subject: `Quotation ${quotationId}${quotation.reference ? ` – ${quotation.reference}` : ""}`,
        text:
          `Dear ${quotation.contactName || "Sir/Madam"},\n\n` +
          `Please find attached our quotation ${quotationId}.\n\n` +
          `Thank you.\n`,
        attachments: [{ filename, content: buffer }],
      });

      // Record that the email went out, but do NOT change the status —
      // the user still confirms delivery by clicking "Mark as Sent"
      // (PUT /:quotationId/mark-sent), which moves it to "Sent".
      const updated = await db.collection("quotations").findOneAndUpdate(
        { quotationId },
        {
          $set: {
            emailSentTo: to,
            emailSentBy: req.body.sentBy || req.headers["x-user-name"] || "",
            emailSentAt: new Date().toISOString(),
          },
        },
        { returnDocument: "after" },
      );

      res.json({ success: true, quotation: updated });
    } catch (err) {
      console.error("Send quotation failed:", err);
      res
        .status(500)
        .json({
          success: false,
          message: err.message || "Failed to send email.",
        });
    }
  },
);

// PUT mark quotation as sent to client (manual — for quotations sent
// outside the system, e.g. by hand or messaging app)
router.put("/:quotationId/mark-sent", async (req, res) => {
  try {
    const db = getDb();
    const quotationId = decodeURIComponent(req.params.quotationId);
    const updated = await db.collection("quotations").findOneAndUpdate(
      { quotationId },
      {
        $set: {
          status: "Sent",
          sentBy: req.body.sentBy || "",
          sentAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }
    res.json({ success: true, quotation: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
