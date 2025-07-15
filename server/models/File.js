import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
id: { type: String, unique: true },
type: String, // 'text', 'file', or 'image'
fileUrl: String,
content: String,
passwordHash: String,
expiresAt: Date,
createdAt: { type: Date, default: Date.now },
});

const File =  mongoose.model('File', fileSchema);
export default File; // ✅ Use `export default`
