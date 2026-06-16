const express = require("express");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const { Session, Payment, Submission } = require("./models/models");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/snap-qr")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Home route - serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoint for dashboard stats
app.get("/api/stats", async (req, res) => {
  try {
    const sessions = await Session.find();
    const payments = await Payment.find();
    
    const totalRevenue = sessions.reduce((sum, s) => sum + (s.amount || 0), 0);
    const activeQR = sessions.filter(s => {
      const ageInMinutes = (Date.now() - s.createdAt.getTime()) / (1000 * 60);
      return ageInMinutes < 30;
    }).length;

    res.json({
      totalSessions: sessions.length,
      totalPayments: payments.length,
      totalRevenue: totalRevenue,
      activeQR: activeQR
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create session with QR code
app.post("/create-session", async (req, res) => {
  try {
    const id = uuidv4();
    const { amount, jazzcash, easypaisa } = req.body;

    const session = new Session({
      id,
      amount: amount || 1000,
      jazzcash: jazzcash || "",
      easypaisa: easypaisa || "",
      status: "pending"
    });

    await session.save();

    const qrUrl = `${req.protocol}://${req.get("host")}/session/${id}`;
    const qr = await QRCode.toDataURL(qrUrl);

    res.json({
      success: true,
      sessionId: id,
      qr: qr,
      url: qrUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get session details
app.get("/session/:id", async (req, res) => {
  try {
    const session = await Session.findOne({ id: req.params.id });

    if (!session) {
      return res.status(404).send("Session not found");
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Verification</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100">
        <div class="min-h-screen flex items-center justify-center p-4">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 class="text-2xl font-bold mb-2">Payment Verification</h1>
            <p class="text-gray-600 mb-6">Amount: <span class="font-bold text-lg">Rs. ${session.amount}</span></p>
            
            <form method="POST" action="/verify/${session.id}" class="space-y-4">
              <input type="text" name="name" placeholder="Full Name" class="w-full border p-3 rounded" required />
              <input type="text" name="phone" placeholder="Phone Number" class="w-full border p-3 rounded" required />
              <input type="text" name="txid" placeholder="Transaction ID" class="w-full border p-3 rounded" required />
              <button type="submit" class="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700">Verify Payment</button>
            </form>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Verify payment
app.post("/verify/:id", async (req, res) => {
  try {
    const session = await Session.findOne({ id: req.params.id });
    
    if (session) {
      const payment = new Payment({
        id: uuidv4(),
        sessionId: req.params.id,
        name: req.body.name,
        phone: req.body.phone,
        txid: req.body.txid
      });
      
      await payment.save();
      session.status = "verified";
      await session.save();
    }

    res.redirect(`/form/${req.params.id}`);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Fielding form
app.get("/form/:id", async (req, res) => {
  try {
    const session = await Session.findOne({ id: req.params.id });

    if (!session) {
      return res.status(404).send("Session not found");
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fielding Form</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100">
        <div class="min-h-screen flex items-center justify-center p-4">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 class="text-2xl font-bold mb-6">Fielding Form</h1>
            
            <form method="POST" action="/submit/${session.id}" class="space-y-4">
              <textarea name="message" placeholder="Message" class="w-full border p-3 rounded h-32" required></textarea>
              <input type="text" name="snap" placeholder="Snapchat Username" class="w-full border p-3 rounded" required />
              <input type="text" name="location" placeholder="GPS Location" class="w-full border p-3 rounded" required />
              <button type="submit" class="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700">Submit</button>
            </form>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Submit fielding form
app.post("/submit/:id", async (req, res) => {
  try {
    const session = await Session.findOne({ id: req.params.id });
    
    if (session) {
      const submission = new Submission({
        id: uuidv4(),
        sessionId: req.params.id,
        message: req.body.message,
        snap: req.body.snap,
        location: req.body.location
      });
      
      await submission.save();
      session.status = "completed";
      await session.save();
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Submission Complete</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100">
        <div class="min-h-screen flex items-center justify-center p-4">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div class="text-5xl mb-4">✓</div>
            <h1 class="text-2xl font-bold mb-2">Submission Complete</h1>
            <p class="text-gray-600 mb-6">Thank you for your submission!</p>
            <a href="/" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block">Go Home</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Admin dashboard
app.get("/admin", async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(10);
    const payments = await Payment.find();
    
    const totalRevenue = sessions.reduce((sum, s) => sum + (s.amount || 0), 0);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100">
        <div class="max-w-6xl mx-auto p-6">
          <h1 class="text-4xl font-bold mb-8">Admin Dashboard</h1>
          
          <div class="grid md:grid-cols-4 gap-4 mb-8">
            <div class="bg-white p-6 rounded shadow">
              <h3 class="text-gray-500">Total Sessions</h3>
              <p class="text-4xl font-bold">${(await Session.countDocuments())}</p>
            </div>
            <div class="bg-white p-6 rounded shadow">
              <h3 class="text-gray-500">Verified Payments</h3>
              <p class="text-4xl font-bold">${payments.length}</p>
            </div>
            <div class="bg-white p-6 rounded shadow">
              <h3 class="text-gray-500">Submissions</h3>
              <p class="text-4xl font-bold">${(await Submission.countDocuments())}</p>
            </div>
            <div class="bg-white p-6 rounded shadow">
              <h3 class="text-gray-500">Total Revenue</h3>
              <p class="text-4xl font-bold">Rs. ${(await Session.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]))[0]?.total || 0}</p>
            </div>
          </div>

          <div class="bg-white rounded shadow p-6">
            <h2 class="text-2xl font-bold mb-4">Recent Sessions</h2>
            <table class="w-full">
              <thead class="border-b">
                <tr>
                  <th class="text-left p-2">Session ID</th>
                  <th class="text-left p-2">Amount</th>
                  <th class="text-left p-2">Status</th>
                  <th class="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                ${sessions.map(s => `
                  <tr class="border-b">
                    <td class="p-2 text-sm">${s.id.substring(0, 8)}...</td>
                    <td class="p-2">Rs. ${s.amount}</td>
                    <td class="p-2"><span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">${s.status}</span></td>
                    <td class="p-2 text-sm">${new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin`);
});
