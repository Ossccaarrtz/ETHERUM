import { useState, useRef } from 'react';

export default function VideoUploader({ onVideoSelected }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);

      // List of accepted video MIME types
      const videoTypes = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska',
        'video/mpeg',
        'video/x-flv',
        'video/3gpp',
        'video/3gpp2'
      ];

      // Check by MIME type first
      const isVideoByMime = videoTypes.includes(file.type);
      
      // Check by extension as fallback
      const videoExtensions = [
        '.mp4', '.webm', '.ogg', '.mov', '.avi', 
        '.mkv', '.mpeg', '.mpg', '.flv', '.3gp', '.m4v'
      ];
      const fileName = file.name.toLowerCase();
      const isVideoByExtension = videoExtensions.some(ext => fileName.endsWith(ext));

      if (!isVideoByMime && !isVideoByExtension) {
        alert('Please select a video file.\n\nSupported formats: MP4, WEBM, MOV, AVI, MKV, MPEG, FLV, 3GP');
        console.error('Invalid file type:', file.type);
        return;
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)} MB\n\nMaximum size: 500 MB`);
        return;
      }

      // Check if file is too small (likely corrupted)
      if (file.size < 1024) {
        alert('File seems to be corrupted or empty');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const url = URL.createObjectURL(file);
      setPreview(url);
      
      console.log('File accepted:', file.name);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onVideoSelected(selectedFile);
    }
  };

  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Simulate file input change
      const fakeEvent = {
        target: {
          files: [file]
        }
      };
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div>
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-slate-600 mb-4">
              Drag and drop your video here
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.webm,.mov,.avi,.mkv,.mpeg,.mpg,.flv,.3gp,.m4v"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block">
              Select File
            </label>
            <p className="text-xs text-slate-500 mt-4">
              MP4, WEBM, MOV, AVI, MKV, MPEG, FLV, 3GP • Max 500MB
            </p>
          </div>
        ) : (
          <div>
            {preview && (
              <video
                src={preview}
                controls
                className="w-full max-h-64 mx-auto rounded-lg mb-4 bg-black"
                onError={(e) => {
                  console.error('Video preview error:', e);
                }}
              />
            )}
            <div className="bg-slate-50 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-slate-700 mb-1">
                <span className="font-medium">File:</span> {selectedFile.name}
              </p>
              <p className="text-sm text-slate-700 mb-1">
                <span className="font-medium">Size:</span> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <p className="text-sm text-slate-700">
                <span className="font-medium">Type:</span> {selectedFile.type || 'Unknown'}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={handleUpload} className="btn-primary">
                Use This Video
              </button>
              <button onClick={handleClear} className="btn-secondary">
                Choose Different File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
