import { useState } from "react";
import axios from "axios";
import VideoRecorder from "./components/VideoRecorder";
import VideoUploader from "./components/VideoUploader";
import ResultDisplay from "./components/ResultDisplay";
import StartTrip from "./components/StartTrip.jsx";

function App() {
  const [mode, setMode] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [tripId, setTripId] = useState(null);
  // ✅ Show StartTrip screen BEFORE showing main UI
  if (!tripId && !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <StartTrip onStart={(id) => setTripId(id)} />
      </div>
    );
  }

  const handleVideoRecorded = (file) => {
    setVideoFile(file);
  };

  const handleVideoSelected = (file) => {
    setVideoFile(file);
  };

  const handleSubmit = async () => {
    if (!videoFile) {
      alert("Please select or record a video first");
      return;
    }

    if (!plate.trim()) {
      alert("Please enter a vehicle plate number");
      return;
    }

    if (!tripId) {
      alert("Trip not started. Please start a trip first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("plate", plate.trim());
    formData.append("tripId", tripId); // ✅ Add trip ID to upload

    try {
      const response = await axios.post("/api/evidence/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setResult({
          ...response.data,
          tripId, // ✅ Show trip ID in result
        });

        setVideoFile(null);
        setPlate("");
        setMode(null);
        // ⚠️ we DO NOT reset tripId yet — user is still on the trip
      } else {
        setError(response.data.error || "Upload failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to upload evidence. Ensure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMode(null);
    setVideoFile(null);
    setPlate("");
    setError(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-ct-dark border-b border-ct-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            <img
              src="/Media/LogoCT.png"
              alt="VERITY CTPAT"
              className="w-12 h-12 rounded-md object-contain bg-white p-1 shadow-sm"
            />

            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                VERITY SECURE PORTAL
              </h1>
              <p className="text-xs text-ct-gray font-medium uppercase tracking-wide">
                CTPAT — Evidence & Chain of Custody
              </p>
            </div>
          </div>

          {/* Blockchain Status */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">
              Blockchain Connected
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="glass-card p-8 md:p-12 animate-slide-up">
          {!mode && !result && (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  Submit Evidence
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Record or upload video evidence that will be cryptographically
                  verified and permanently stored on IPFS and Arbitrum/Scroll
                  blockchains.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => setMode("record")}
                  className="group relative p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-7 h-7 text-slate-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Record Video
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Capture live evidence directly from your device camera
                      with instant verification.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setMode("upload")}
                  className="group relative p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-7 h-7 text-slate-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Upload Video
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Select and upload existing video files from your device
                      for blockchain verification.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === "record" && !videoFile && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Record Evidence
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Capture video from your camera
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <VideoRecorder onVideoRecorded={handleVideoRecorded} />
            </div>
          )}

          {mode === "upload" && !videoFile && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Upload Evidence
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Select a video file from your device
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <VideoUploader onVideoSelected={handleVideoSelected} />
            </div>
          )}

          {videoFile && !result && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Submit to Blockchain
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Complete the verification process
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 mb-1">
                      {videoFile.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                      for upload
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Vehicle Plate Number
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  className="input font-mono text-lg"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-5">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !plate.trim()}
                className="btn-primary w-full text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing Evidence...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Submit to Blockchain
                  </span>
                )}
              </button>

              <p className="text-xs text-center text-slate-500 mt-4">
                Evidence will be hashed, uploaded to IPFS, and recorded on
                Arbitrum & Scroll testnets
              </p>
            </div>
          )}

          {result && (
            <div>
              <ResultDisplay result={result} />
              <div className="mt-8">
                <button onClick={handleReset} className="btn-primary w-full">
                  Submit Another Evidence
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span>Powered by</span>
              <span className="font-semibold text-slate-900">IPFS</span>
              <span>•</span>
              <span className="font-semibold text-slate-900">Arbitrum</span>
              <span>•</span>
              <span className="font-semibold text-slate-900">Scroll</span>
            </div>
            <div className="text-xs text-slate-500">
              © 2025 VERITY. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
