const express = require("express");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let sessions = [];

app.get("/", (req, res) => {
  res.send(`
    <h1>Snap QR Fielding System</h1>

    <form method="POST" action="/create-session">
      <input name="amount" placeholder="Amount" value="1000" />
      <button>Create Session</button>
    </form>
  `);
});

app.post("/create-session", async (req, res) => {
  const id = uuidv4();

  const session = {
    id,
    amount: req.body.amount || 1000,
    createdAt: Date.now()
  };

  sessions.push(session);

  const qrUrl = `${req.protocol}://${req.get("host")}/session/${id}`;

  const qr = await QRCode.toDataURL(qrUrl);

  res.send(`
    <h2>QR Generated</h2>
    <img src="${qr}" />
    <p>${qrUrl}</p>
  `);
});

app.get("/session/:id", (req, res) => {
  const session = sessions.find(
    s => s.id === req.params.id
  );

  if (!session) {
    return res.send("Session not found");
  }

  res.send(`
    <h2>Payment Page</h2>

    <form method="POST" action="/verify/${session.id}">
      <input name="name" placeholder="Name" />
      <input name="phone" placeholder="Phone" />
      <input name="txid" placeholder="Transaction ID" />
      <button>Verify Payment</button>
    </form>
  `);
});

app.post("/verify/:id", (req, res) => {
  res.redirect(`/form/${req.params.id}`);
});

app.get("/form/:id", (req, res) => {
  res.send(`
    <h2>Fielding Form</h2>

    <form method="POST" action="/submit/${req.params.id}">
      <textarea name="message"></textarea>
      <input name="snap" placeholder="Snapchat Username" />
      <input name="location" placeholder="Location" />
      <button>Submit</button>
    </form>
  `);
});

app.post("/submit/:id", (req, res) => {
  res.send(`
    <h2>Submission Complete</h2>
    <p>Thank you.</p>
  `);
});

app.get("/admin", (req, res) => {
  res.send(`
    <h1>Admin Dashboard</h1>

    <p>Total Sessions: ${sessions.length}</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
