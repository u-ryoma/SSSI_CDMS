require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectDB, client } = require("./config/db");
const { startAutoLogoutJob } = require("./services/presenceService");

// File uploads (Cloudinary) — unchanged from the original app
const uploadRoutes = require("./routes/uploadRoutes");

const healthRoutes = require("./routes/healthRoutes");
const presenceRoutes = require("./routes/presenceRoutes");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const logRoutes = require("./routes/logRoutes");
const customerRoutes = require("./routes/customerRoutes");
const contactRoutes = require("./routes/contactRoutes");
const jobReceiptRoutes = require("./routes/jobReceiptRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const instrumentRoutes = require("./routes/instrumentRoutes");
const jobNumberRoutes = require("./routes/jobNumberRoutes");
const deliveryReceiptRoutes = require("./routes/deliveryReceiptRoutes");
const standardRoutes = require("./routes/standardRoutes");
const technicianRoutes = require("./routes/technicianRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const statsRoutes = require("./routes/statsRoutes");
const siteCalibrationRoutes = require("./routes/siteCalibrationRoutes");
const systemAlertRoutes = require("./routes/systemAlertRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const app = express();

app.use(
  cors({
    origin: true, // Allow ALL origins during development
  }),
);

// Raised from the default ~100kb so base64-encoded fields elsewhere in the
// app (if any remain) still fit in the request body. Note: this limit does
// NOT apply to the multipart/form-data uploads handled by uploadRoutes
// (equipment photos, xlsx files) — those go through multer's own memory
// storage and 15MB-per-file limit, defined in middleware/upload.js.
app.use(express.json({ limit: "10mb" }));

// Kick off the DB connection and the presence auto-logout sweep. Not
// awaited here (same as the original) — route handlers call getDb()
// lazily at request time, so in practice they never race the connection.
connectDB();
startAutoLogoutJob();

// ==========================
// FILE UPLOADS (Cloudinary) — equipment photos, and later xlsx templates
// ==========================
app.use("/api/uploads", uploadRoutes);

app.use("/api", healthRoutes);
app.use("/api", presenceRoutes);
app.use("/api", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/jobreceipts", jobReceiptRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/instruments", instrumentRoutes);
app.use("/api/jobnumbers", jobNumberRoutes);
app.use("/api/deliveryreceipts", deliveryReceiptRoutes);
app.use("/api/standards", standardRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/sitecalibrations", siteCalibrationRoutes);
app.use("/api/system-alerts", systemAlertRoutes);
app.use("/api/predictions", predictionRoutes);
// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing DB connection");
  await client.close();
  process.exit(0);
});

// FIXED PORT - Works on Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
