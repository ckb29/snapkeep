import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Shield, Clock, ArrowRight, Globe, FileText } from "lucide-react";
import axios from "axios";

const HomePage = () => {
  const [domain, setDomain] = useState("");
  const [duration, setDuration] = useState(48); // Default to 2 days (48 hours)
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!domain.trim()) {
      setError("Please enter a domain name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("https://mysnapkeep.onrender.com/api/create", {
        domain,
        password,
        duration,
      });

      if (res.data.success || res.data.existsWithoutPassword) {
        navigate(`/${domain}`);
      } else {
        setError(res.data.message || "Domain already taken.");
      }
    } catch (err) {
      console.error("Error creating domain:", err);
      setError("Failed to create domain.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

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
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Temporary</span>
              </span>
              <span className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Simple</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Share Files
            <span className="text-blue-600"> Instantly</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create a custom domain, upload files, and share them securely.
            No registration required, optional password protection.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Create Your SnapKeep</h3>
              <p className="text-gray-600">Set up your temporary file sharing space</p>
            </div>

            <div className="space-y-5">
              {/* Domain Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Custom Domain
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="my-awesome-files"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">.snapkeep.com</span>
                  </div>
                </div>
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Expiry Duration
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value={1}>1 Hour</option>
                  <option value={3}>3 Hours</option>
                  <option value={6}>6 Hours</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>1 Day</option>
                  <option value={48}>2 Days</option>
                </select>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Password Protection
                  <span className="text-gray-400 ml-1">(Optional)</span>
                </label>
                <input
                  type="password"
                    placeholder="Leave empty for no password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <span>Create & Upload</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure</h3>
            <p className="text-gray-600">Optional password protection and automatic file deletion</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Temporary</h3>
            <p className="text-gray-600">Files automatically expire after your chosen duration</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Simple</h3>
            <p className="text-gray-600">No registration required, just create and share</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
