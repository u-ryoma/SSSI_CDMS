const express = require("express");
const { getDb } = require("../config/db");
const { getNextSequence, pad4 } = require("../utils/counters");

const router = express.Router();

// POST reserve a new Contact ID (separate counter, doesn't touch customerID counter)
router.post("/reserve", async (req, res) => {
  try {
    const db = getDb();
    const seq = await getNextSequence(db, "contactID");
    const contactID = `CON-${pad4(seq)}`;
    res.json({ success: true, contactID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST save a full contact record, linked to a customer
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { contactID, customerID, contactName, contactType, remarks } = req.body;

    if (!contactID || !customerID || !contactName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact ID, Customer ID, and Contact Name are required.",
      });
    }

    const newContact = {
      contactID,
      customerID,
      contactName: contactName.trim(),
      contactType: contactType || "",
      remarks: remarks || "",
      createdAt: new Date().toISOString(),
    };

    await db.collection("contacts").insertOne(newContact);

    // keep the customer's contactNames array in sync for the dropdown
    await db
      .collection("customers")
      .updateOne(
        { customerID },
        { $addToSet: { contactNames: newContact.contactName } },
      );

    res.status(201).json({ success: true, contact: newContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
