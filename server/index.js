import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
const app = express();

const allowedOrigins = ["https://mysnapkeep.netlify.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(bodyParser.json({ limit: "50mb" }));

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ MongoDB config
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error", err));

// ✅ Mongoose Schema
const domainSchema = new mongoose.Schema({
  domain: { type: String, unique: true },
  password: String,
  text: String,
  files: [{ name: String, url: String }],
  expiresAt: Date,
});

const Domain = mongoose.model("Domain", domainSchema);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("SnapKeep backend is running ✅");
});

// 🔹 Create domain
app.post("/api/create", async (req, res) => {
  const { domain, password, duration } = req.body;
  const expiresAt = new Date(Date.now() + (duration || 2) * 60 * 60 * 1000); // default 2 hrs

  try {
    const existing = await Domain.findOne({ domain });

    if (existing) {
      if (existing.expiresAt < Date.now()) {
        // 🧹 Cleanup expired domain and files
        for (const file of existing.files) {
          const publicId = file.url.split("/").pop().split(".")[0];
          try {
            await cloudinary.uploader.destroy(`snapkeep/${domain}/${publicId}`, {
              resource_type: "raw",
            });
          } catch (err) {
            console.warn("Cloudinary cleanup error:", err.message);
          }
        }
        await Domain.deleteOne({ domain });
      } else {
        return res.status(400).json({ success: false, message: "Domain already in use" });
      }
    }

    const entry = new Domain({
      domain,
      password,
      text: "",
      files: [],
      expiresAt,
    });

    await entry.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Create error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 View content
app.post("/api/view/:domain", async (req, res) => {
  const { domain } = req.params;
  const { password } = req.body;

  try {
    const data = await Domain.findOne({ domain });

    if (!data)
      return res.status(404).json({ success: false, message: "Not found" });

    if (data.expiresAt < Date.now()) {
      // 🧹 Delete files from Cloudinary
      for (const file of data.files) {
        const publicId = file.url.split("/").pop().split(".")[0];
        try {
          await cloudinary.uploader.destroy(`snapkeep/${domain}/${publicId}`, {
            resource_type: "raw",
          });
        } catch (err) {
          console.warn("Cloudinary delete error:", err.message);
        }
      }

      // 🧹 Delete domain from MongoDB
      await Domain.deleteOne({ domain });

      return res.status(410).json({ success: false, message: "Link expired and removed" });
    }

    if (data.password && data.password !== password)
      return res.json({ success: false, requiresPassword: true });

    res.json({ success: true, text: data.text, files: data.files });
  } catch (err) {
    console.error("View error:", err.message);
    res.status(500).json({ success: false });
  }
});

// 🔹 Upload content
app.post("/api/upload", async (req, res) => {
  const { linkId, text, files } = req.body;

  try {
    const entry = await Domain.findOne({ domain: linkId });
    if (!entry) return res.status(404).json({ success: false });

    entry.text = text;
    if (files && files.length > 0) {
      entry.files.push(...files); // files = [{ name, url }]
    }

    await entry.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ success: false });
  }
});

// 🔹 Delete file
app.post("/api/delete-file", async (req, res) => {
  const { linkId, fileUrl } = req.body;

  try {
    const entry = await Domain.findOne({ domain: linkId });
    if (!entry) return res.status(404).json({ success: false });

    entry.files = entry.files.filter((f) => f.url !== fileUrl);
    await entry.save();

    // Try deleting from Cloudinary
    const publicId = fileUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`snapkeep/${linkId}/${publicId}`, {
      resource_type: "raw",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ success: false });
  }
});

// 🔹 Ping route
app.get("/api/ping", (req, res) => {
  res.send("Pong! ✅ Server is awake.");
});

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
