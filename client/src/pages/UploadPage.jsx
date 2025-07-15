/*import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UploadPage = () => {
  const { domain } = useParams();

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch content if access granted
  useEffect(() => {
    if (!domain || hasAccess) return;

    axios
      .post(`http://localhost:8051/api/view/${domain}`, { password })
      .then((res) => {
        if (res.data.success) {
          setText(res.data.text || "");
          setFiles(res.data.files || []);
          setHasAccess(true);
        } else if (res.data.requiresPassword) {
          setPasswordRequired(true);
        } else {
          setError("Access denied or domain not found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching domain:", err);
        setError("Something went wrong.");
      });
  }, [domain, password, hasAccess]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFilesToUpload((prev) => [...prev, ...selected]);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mysnapkeep"); // unsigned preset name
    formData.append("folder", `snapkeep/${domain}`);

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/djphfeubc/auto/upload",
      formData
    );

    return { name: file.name, url: res.data.secure_url };
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      const uploaded = await Promise.all(
        filesToUpload.map((file) => uploadToCloudinary(file))
      );

      const res = await axios.post("http://localhost:8051/api/upload", {
        linkId: domain,
        text,
        files: uploaded,
      });

      if (res.data.success) {
        alert("Saved!");
        setFiles((prev) => [...prev, ...uploaded]);
        setFilesToUpload([]);
        setSuccessMessage("Upload successful!");
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileUrl) => {
    try {
      const res = await axios.post("http://localhost:8051/api/delete-file", {
        linkId: domain,
        fileUrl,
      });
      if (res.data.success) {
        setFiles((prev) => prev.filter((f) => f.url !== fileUrl));
      }
    } catch (err) {
      console.error("Error deleting file", err);
    }
  };

  // 🔐 Render password prompt if needed
  if (passwordRequired && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-4">🔒 Enter Password</h2>
          <input
            type="password"
            className="w-full border p-3 rounded mb-4"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            className="bg-blue-600 text-white w-full py-2 rounded"
            onClick={() => {
              setHasAccess(false); // triggers useEffect again
              setError("");
            }}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  // ⏳ Show nothing until access is granted
  if (!hasAccess) return null;

  // ✅ Main Upload UI
  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Upload to /{domain}</h1>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full p-3 border rounded mb-4 resize-none"
          placeholder="Write your notes here..."
        />

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4 block w-full"
        />

        <button
          onClick={handleSave}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
        >
          {uploading ? "Uploading..." : "Save Content"}
        </button>

        {successMessage && (
          <p className="text-green-600 text-center mt-3">{successMessage}</p>
        )}

        {files.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Uploaded Files</h2>
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded"
                >
                  <span className="truncate w-2/3 text-sm">{file.name}</span>
                  <div className="flex items-center gap-3">
                    <a
                      href={file.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file.url)}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
*/
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Lock,
  Package,
  Plus,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";

const UploadPage = () => {
  const { domain } = useParams();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch content if access granted
  useEffect(() => {
    if (!domain || hasAccess) return;

    axios
      .post(`https://mysnapkeep.onrender.com/api/view/${domain}`, { password })
      .then((res) => {
        if (res.data.success) {
          setText(res.data.text || "");
          setFiles(res.data.files || []);
          setHasAccess(true);
        } else if (res.data.requiresPassword) {
          setPasswordRequired(true);
        } else {
          setError("Access denied or domain not found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching domain:", err);
        setError("Something went wrong.");
      });
  }, [domain, password, hasAccess]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFilesToUpload((prev) => [...prev, ...selected]);
  };

  const removeFileFromUpload = (index) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mysnapkeep");
    formData.append("folder", `snapkeep/${domain}`);

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/djphfeubc/auto/upload",
      formData
    );

    return { name: file.name, url: res.data.secure_url };
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      setError("");
      const uploaded = await Promise.all(
        filesToUpload.map((file) => uploadToCloudinary(file))
      );

      const res = await axios.post("https://mysnapkeep.onrender.com/api/upload", {
        linkId: domain,
        text,
        files: uploaded,
      });

      if (res.data.success) {
        setFiles((prev) => [...prev, ...uploaded]);
        setFilesToUpload([]);
        setSuccessMessage("Content saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileUrl) => {
    try {
      const res = await axios.post("https://mysnapkeep.onrender.com/api/delete-file", {
        linkId: domain,
        fileUrl,
      });
      if (res.data.success) {
        setFiles((prev) => prev.filter((f) => f.url !== fileUrl));
      }
    } catch (err) {
      console.error("Error deleting file", err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Password prompt UI
  if (passwordRequired && !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Protected Content</h2>
            <p className="text-gray-600">This SnapKeep is password protected</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && setHasAccess(false)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
              onClick={() => {
                setHasAccess(false);
                setError("");
              }}
            >
              Access Content
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MySnapKeep</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">/{domain}</span>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Create New
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Text Editor */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Text Notes</h2>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
              placeholder="Write your notes here..."
            />
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">File Upload</h2>
            </div>

            {/* File Input */}
            <div className="mb-6">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-1">Click to select files</p>
                  <p className="text-sm text-gray-400">or drag and drop</p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Files to Upload */}
            {filesToUpload.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Files to Upload</h3>
                <div className="space-y-2">
                  {filesToUpload.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFileFromUpload(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span>Uploaded Files ({files.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate mb-2">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <a
                          href={file.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.url)}
                          className="inline-flex items-center space-x-1 text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;