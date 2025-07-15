import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const app = express();

app.use(cors({
  origin: "https://mysnapkeep.netlify.app", // replace with actual Netlify URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.options("*", cors()); // enable preflight

app.use(bodyParser.json({ limit: "50mb" }));


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// MongoDB config
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error", err));

// Mongoose schema
const domainSchema = new mongoose.Schema({
  domain: { type: String, unique: true },
  password: String,
  text: String,
  files: [{ name: String, url: String }],
  expiresAt: Date,
});

const Domain = mongoose.model("Domain", domainSchema);

// ----------------- ROUTES ------------------

app.get("/", (req, res) => {
  res.send("SnapKeep backend is running ✅");
});

// Create domain
app.post("/api/create", async (req, res) => {
  const { domain, password, duration } = req.body;
  const expiresAt = new Date(Date.now() + (duration || 2) * 24 * 60 * 60 * 1000);

  const existing = await Domain.findOne({ domain });

  if (existing) {
    if (!existing.password) return res.json({ existsWithoutPassword: true });
    return res.json({ success: false, message: "Domain already exists or password protected" });
  }

  const entry = new Domain({ domain, password, text: "", files: [], expiresAt });
  await entry.save();
  res.json({ success: true });
});

// View content
app.post("/api/view/:domain", async (req, res) => {
  const { domain } = req.params;
  const { password } = req.body;
  const data = await Domain.findOne({ domain });

  if (!data) return res.status(404).json({ success: false });
  if (data.expiresAt < Date.now()) return res.status(410).json({ success: false, message: "Link expired" });
  if (data.password && data.password !== password) return res.json({ success: false, requiresPassword: true });

  res.json({ success: true, text: data.text, files: data.files });
});

// Upload content
app.post("/api/upload", async (req, res) => {
  const { linkId, text, files } = req.body;
  const entry = await Domain.findOne({ domain: linkId });
  if (!entry) return res.status(404).json({ success: false });

  entry.text = text;
  if (files && files.length > 0) {
    entry.files.push(...files); // files = [{ name, url }]
  }
  await entry.save();
  res.json({ success: true });
});

// Delete file
app.post("/api/delete-file", async (req, res) => {
  const { linkId, fileUrl } = req.body;
  const entry = await Domain.findOne({ domain: linkId });
  if (!entry) return res.status(404).json({ success: false });

  entry.files = entry.files.filter((f) => f.url !== fileUrl);
  await entry.save();

  try {
    // Extract file name from URL for deletion
    const publicId = fileUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`snapkeep/${linkId}/${publicId}`, { resource_type: "raw" });
  } catch (err) {
    console.error("Cloudinary deletion failed:", err.message);
  }

  res.json({ success: true });
});

// ----------------- START SERVER ------------------
const PORT = process.env.PORT || 8051;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
