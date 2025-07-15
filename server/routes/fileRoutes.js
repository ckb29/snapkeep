import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import File from '../models/File.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload/:customId', upload.single('file'), async (req, res) => {
try {
const { type, content, password, expiryDays, expiryHours, expiryMinutes, expirySeconds } = req.body;
const id = req.params.customId;

const expiresInMs = (
(parseInt(expiryDays || 0) * 86400000) +
(parseInt(expiryHours || 0) * 3600000) +
(parseInt(expiryMinutes || 0) * 60000) +
(parseInt(expirySeconds || 0) * 1000)
) || 604800000; // Default: 7 days

const expiresAt = new Date(Date.now() + expiresInMs);
let fileUrl = null;
let passwordHash = null;

if (req.file) {
// Replace with Firebase upload logic
fileUrl = 'mock-file-url';
}

if (password) {
passwordHash = await bcrypt.hash(password, 10);
}

const existing = await File.findOne({ id });
if (existing) return res.status(409).json({ error: 'Custom link already in use' });

const newFile = new File({ id, type, content, fileUrl, passwordHash, expiresAt });
await newFile.save();

res.json({ link: `/view/${id}` });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Server Error' });
}
});

router.post('/get/:id', async (req, res) => {
try {
const { id } = req.params;
const { password } = req.body;
const file = await File.findOne({ id });

if (!file) return res.status(404).json({ error: 'Not Found' });
if (file.expiresAt < Date.now()) return res.status(410).json({ error: 'Expired' });

if (file.passwordHash) {
const match = await bcrypt.compare(password, file.passwordHash);
if (!match) return res.status(401).json({ error: 'Invalid password' });
}

res.json(file);
} catch (err) {
res.status(500).json({ error: 'Server Error' });
}
});

export default router;

