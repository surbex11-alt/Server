const mongoose = require("mongoose");

// Session Schema
const sessionSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  amount: { type: Number, default: 1000 },
  jazzcash: { type: String, default: "" },
  easypaisa: { type: String, default: "" },
  status: { type: String, enum: ["pending", "verified", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) } // 30 minutes
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  sessionId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  txid: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Submission Schema
const submissionSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  sessionId: { type: String, required: true },
  message: { type: String, required: true },
  snap: { type: String, required: true },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create Models
const Session = mongoose.model("Session", sessionSchema);
const Payment = mongoose.model("Payment", paymentSchema);
const Submission = mongoose.model("Submission", submissionSchema);

module.exports = {
  Session,
  Payment,
  Submission
};
