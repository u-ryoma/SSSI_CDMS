require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;
const app = express();

app.use(
  cors({
    origin: true, // Allow ALL origins during development
  }),
);

app.use(express.json());

// ✅ FIXED MongoDB URI
const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("ryodb");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

// Initialize DB connection
connectDB();

// ✅ Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    if (db) {
      await db.command({ ping: 1 });
      res.json({ status: "healthy", db: "connected" });
    } else {
      res.status(503).json({ status: "unhealthy", db: "connecting" });
    }
  } catch (error) {
    res.status(500).json({ status: "unhealthy" });
  }
});

// ==========================
// HEARTBEAT SYSTEM
// ==========================
// const heartbeats = {};

// app.post("/api/heartbeat", (req, res) => {
//   const { username } = req.body;
//   heartbeats[username] = Date.now();
//   res.json({ success: true });
// });

// app.get("/api/active-users", (req, res) => {
//   const now = Date.now();
//   const activeUsers = Object.entries(heartbeats)
//     .filter(([_, lastSeen]) => now - lastSeen < 60000) // 1 minute
//     .map(([username]) => username);
//   res.json(activeUsers);
// });
const heartbeats = {};
const userInfo = {}; // ← store user info for logging

app.post("/api/heartbeat", (req, res) => {
  const { username, name, role } = req.body;
  heartbeats[username] = Date.now();
  // ← store user info
  if (name) userInfo[username] = { name, role };
  res.json({ success: true });
});

app.get("/api/active-users", (req, res) => {
  const now = Date.now();
  const activeUsers = Object.entries(heartbeats)
    .filter(([_, lastSeen]) => now - lastSeen < 60000)
    .map(([username]) => username);
  res.json(activeUsers);
});

// ← Add this - checks every 30 seconds for expired heartbeats
setInterval(async () => {
  const now = Date.now();
  for (const [username, lastSeen] of Object.entries(heartbeats)) {
    if (now - lastSeen >= 60000) {
      // user has been inactive for 60 seconds - log them out
      try {
        await db.collection("logs").insertOne({
          username,
          name: userInfo[username]?.name || username,
          role: userInfo[username]?.role || "unknown",
          action: "logged out",
          timestamp: new Date().toISOString(),
        });
        console.log(`Auto logged out: ${username}`);
      } catch (err) {
        console.error("Auto logout log error:", err);
      }
      // remove from heartbeats
      delete heartbeats[username];
      delete userInfo[username];
    }
  }
}, 30000);

app.post("/api/logout", (req, res) => {
  const { username } = req.body;
  delete heartbeats[username];
  res.json({ success: true });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.collection("users").findOne({ email });
    if (!user)
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });

    // ← check if user is already logged in
    if (
      heartbeats[user.username] &&
      Date.now() - heartbeats[user.username] < 60000
    ) {
      return res.json({
        success: false,
        message: "This account is already logged in on another device.",
      });
    }

    heartbeats[user.username] = Date.now();
    res.json({
      success: true,
      username: user.username,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ==========================
// LOGS
// ==========================
app.post("/api/logs", async (req, res) => {
  try {
    const { username, name, role, action, timestamp } = req.body;
    await db.collection("logs").insertOne({
      username,
      name,
      role,
      action,
      timestamp: timestamp || new Date().toISOString(),
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/logs", async (req, res) => {
  try {
    const logs = await db
      .collection("logs")
      .find()
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching logs");
  }
});

// ==========================
// REGISTER
// ==========================
app.post("/api/register", async (req, res) => {
  const { username, name, email, password, role } = req.body;
  try {
    const existing = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await db.collection("users").insertOne({
      username,
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// ACCOUNTS CRUD
// ==========================
app.get("/api/accounts", async (req, res) => {
  try {
    const accounts = await db.collection("users").find().toArray();
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/accounts/:id", async (req, res) => {
  const { username, name, email, role, password } = req.body;
  try {
    const updateData = { username, name, email, role };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    res.json({ success: true, message: "Account updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

app.delete("/api/accounts/:id", async (req, res) => {
  try {
    await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// ✅ Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing DB connection");
  await client.close();
  process.exit(0);
});

// ==========================
// CUSTOMERS
// ==========================

// GET all customers
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await db.collection("customers").find().toArray();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// // GET single customer by customerID (for auto-fill in Job Receipt)
// app.get("/api/customers/:customerID", async (req, res) => {
//   try {
//     const customer = await db.collection("customers").findOne({
//       customerID: req.params.customerID,
//     });
//     if (!customer)
//       return res
//         .status(404)
//         .json({ success: false, message: "Customer not found" });
//     res.json(customer);
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });// GET a single customer by customerID
app.get("/api/customers/:customerID", async (req, res) => {
  try {
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

// POST create customer (with auto-increment customerID)
app.post("/api/customers", async (req, res) => {
  try {
    const counter = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "customerID" },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
    const customerID = `C-${String(counter.seq).padStart(4, "0")}`;

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
app.put("/api/customers/:customerID", async (req, res) => {
  try {
    await db
      .collection("customers")
      .updateOne({ customerID: req.params.customerID }, { $set: req.body });
    res.json({ success: true, message: "Customer updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// POST add contact to existing customer
app.post("/api/customers/:customerID/contacts", async (req, res) => {
  try {
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
app.delete("/api/customers/:customerID", async (req, res) => {
  try {
    await db
      .collection("customers")
      .deleteOne({ customerID: req.params.customerID });
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});
// POST reserve a new Contact ID (separate counter, doesn't touch customerID counter)
app.post("/api/contacts/reserve", async (req, res) => {
  try {
    const counter = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "contactID" },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );

    const contactID = `CON-${String(counter.seq).padStart(4, "0")}`;
    res.json({ success: true, contactID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST save a full contact record, linked to a customer
app.post("/api/contacts", async (req, res) => {
  try {
    const { contactID, customerID, contactName, contactType, remarks } =
      req.body;

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

// GET all full contact records for a given customer (Contact ID, Type, Remarks included)
app.get("/api/customers/:customerID/contacts/full", async (req, res) => {
  try {
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
// GET next JR ID preview
app.get("/api/jobreceipts/next-id", async (req, res) => {
  try {
    const counter = await db
      .collection("counters")
      .findOne({ _id: "jobReceiptID" });
    const nextSeq = (counter?.seq || 0) + 1;
    const yr = new Date().getFullYear().toString().slice(-2);
    const nextJrId = `JR/${String(nextSeq).padStart(4, "0")}/${yr}`;
    res.json({ nextJrId });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET all job receipts
app.get("/api/jobreceipts", async (req, res) => {
  try {
    const receipts = await db
      .collection("jobreceipts")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET next JR ID preview
app.get("/api/jobreceipts/next-id", async (req, res) => {
  try {
    const counter = await db
      .collection("counters")
      .findOne({ _id: "jobReceiptID" });
    const nextSeq = (counter?.seq || 0) + 1;
    const yr = new Date().getFullYear().toString().slice(-2);
    const nextJrId = `JR/${String(nextSeq).padStart(4, "0")}/${yr}`;
    res.json({ nextJrId });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// POST save job receipt
app.post("/api/jobreceipts", async (req, res) => {
  try {
    const counter = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "jobReceiptID" },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
    const yr = new Date().getFullYear().toString().slice(-2);
    const jrId = `JR/${String(counter.seq).padStart(4, "0")}/${yr}`;

    const newReceipt = {
      ...req.body,
      jrId,
      createdAt: new Date().toISOString(),
    };

    await db.collection("jobreceipts").insertOne(newReceipt);
    res.status(201).json({ success: true, jrId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post("/api/instruments", async (req, res) => {
  try {
    const newInstrument = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    await db.collection("instruments").insertOne(newInstrument);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.get("/api/instruments", async (req, res) => {
  try {
    const instruments = await db
      .collection("instruments")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(instruments); // must be a plain array, not { data: [...] }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// // GET all job numbers
// app.get("/api/jobnumbers", async (req, res) => {
//   try {
//     const jobs = await db
//       .collection("jobnumbers")
//       .find()
//       .sort({ createdAt: -1 })
//       .toArray();
//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // POST save job number
// app.post("/api/jobnumbers", async (req, res) => {
//   try {
//     const type = req.body.type || "mechanical";
//     const prefix = type === "electrical" ? "SSE" : "SSS";
//     const counterId =
//       type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";

//     const counter = await db
//       .collection("counters")
//       .findOneAndUpdate(
//         { _id: counterId },
//         { $inc: { seq: 1 } },
//         { upsert: true, returnDocument: "after" },
//       );

//     const yr = new Date().getFullYear().toString().slice(-2);
//     const jobNumber = `${prefix}/${String(counter.seq).padStart(4, "0")}/${yr}`;

//     const newJob = {
//       ...req.body,
//       jobNumber,
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("jobnumbers").insertOne(newJob);
//     res.status(201).json({ success: true, jobNumber });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });// GET all job numbers
app.get("/api/jobnumbers", async (req, res) => {
  try {
    const jobs = await db
      .collection("jobnumbers")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST reserve a job number (increments counter, does NOT insert a job doc)
app.post("/api/jobnumbers/reserve", async (req, res) => {
  try {
    const type = req.body.type === "electrical" ? "electrical" : "mechanical";
    const prefix = type === "electrical" ? "SSE" : "SSS";
    const counterId =
      type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";

    const counter = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );

    const yr = new Date().getFullYear().toString().slice(-2);
    const jobNumber = `${prefix}/${String(counter.seq).padStart(4, "0")}/${yr}`;

    res.json({ success: true, jobNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST save job number (uses the already-reserved number if provided)
app.post("/api/jobnumbers", async (req, res) => {
  try {
    const { jobNumber, ...rest } = req.body;
    let finalJobNumber = jobNumber;

    // Fallback only — normally jobNumber is already reserved by this point
    if (!finalJobNumber) {
      const type = req.body.type === "electrical" ? "electrical" : "mechanical";
      const prefix = type === "electrical" ? "SSE" : "SSS";
      const counterId =
        type === "electrical" ? "jobNumberID_SSE" : "jobNumberID_SSS";
      const counter = await db
        .collection("counters")
        .findOneAndUpdate(
          { _id: counterId },
          { $inc: { seq: 1 } },
          { upsert: true, returnDocument: "after" },
        );
      const yr = new Date().getFullYear().toString().slice(-2);
      finalJobNumber = `${prefix}/${String(counter.seq).padStart(4, "0")}/${yr}`;
    }

    const newJob = {
      ...rest,
      jobNumber: finalJobNumber,
      createdAt: new Date().toISOString(),
    };

    await db.collection("jobnumbers").insertOne(newJob);
    res.status(201).json({ success: true, jobNumber: finalJobNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT - mark job number as tagged (moves it to Incoming Calib or Incoming Concern)
app.put("/api/jobnumbers/tag", async (req, res) => {
  try {
    const { jobNumber, tagged, concernTagged, taggedAt } = req.body;

    if (!jobNumber) {
      return res
        .status(400)
        .json({ success: false, message: "jobNumber is required" });
    }

    const result = await db.collection("jobnumbers").updateOne(
      { jobNumber },
      {
        $set: {
          tagged: tagged ?? true,
          concernTagged: concernTagged ?? false,
          taggedAt: taggedAt || new Date().toISOString(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Job number not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// ✅ FIXED PORT - Works on Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
