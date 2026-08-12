const express = require("express");
const { getDb } = require("../config/db");
const { getNextSequence, pad4 } = require("../utils/counters");
const { stageOf } = require("../utils/jobStage");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const customers = await db.collection("customers").find().toArray();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:customerID", async (req, res) => {
  try {
    const db = getDb();
    const customer = await db
      .collection("customers")
      .findOne({ customerID: req.params.customerID });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET a customer's jobs — used by Customer.jsx's row-click modal to show
// job number + equipment + current process/stage for each job tied to
// this customer.
//
// Jobs (jobnumbers) don't store customerID directly; they link through
// jobReceiptID -> jobreceipts.jrId, and job receipts carry the company
// info. We match receipts on either customerID or companyName so this
// works for receipts saved before customerID was recorded on them too.
router.get("/:customerID/jobs", async (req, res) => {
  try {
    const db = getDb();
    const customerID = req.params.customerID;

    const customer = await db.collection("customers").findOne({ customerID });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const receipts = await db
      .collection("jobreceipts")
      .find({
        $or: [{ customerID }, { companyName: customer.companyName }],
      })
      .toArray();

    const jrIds = receipts.map((r) => r.jrId);

    const jobs = await db
      .collection("jobnumbers")
      .find({ jobReceiptID: { $in: jrIds } })
      .sort({ createdAt: -1 })
      .toArray();

    const result = jobs.map((job) => ({
      jobNumber: job.jobNumber,
      type: job.type || "mechanical",
      equipmentName: job.description || "",
      serialNumber: job.serialNo || "",
      model: job.model || "",
      stage: stageOf(job),
      createdAt: job.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error("Customer jobs fetch failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create customer (with auto-increment customerID)
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const seq = await getNextSequence(db, "customerID");
    const customerID = `C-${pad4(seq)}`;

    const newCustomer = {
      customerID,
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    await db.collection("customers").insertOne(newCustomer);
    res.status(201).json({ success: true, customerID });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT update customer
router.put("/:customerID", async (req, res) => {
  try {
    const db = getDb();
    await db
      .collection("customers")
      .updateOne({ customerID: req.params.customerID }, { $set: req.body });
    res.json({ success: true, message: "Customer updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// POST add contact to existing customer
router.post("/:customerID/contacts", async (req, res) => {
  try {
    const db = getDb();
    const { contactName } = req.body;
    await db
      .collection("customers")
      .updateOne(
        { customerID: req.params.customerID },
        { $push: { contactNames: contactName } },
      );
    res.json({ success: true, message: "Contact added" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add contact" });
  }
});

router.delete("/:customerID", async (req, res) => {
  try {
    const db = getDb();
    await db
      .collection("customers")
      .deleteOne({ customerID: req.params.customerID });
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// GET all full contact records for a given customer (Contact ID, Type, Remarks included)
router.get("/:customerID/contacts/full", async (req, res) => {
  try {
    const db = getDb();
    const contacts = await db
      .collection("contacts")
      .find({ customerID: req.params.customerID })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
