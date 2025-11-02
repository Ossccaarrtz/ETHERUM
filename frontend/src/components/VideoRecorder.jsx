import { useState, useRef, useEffect } from 'react';

export default function VideoRecorder({ onVideoRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Polyfill for navigator.mediaDevices if needed
  useEffect(() => {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }
    
    if (navigator.mediaDevices.getUserMedia === undefined) {
      const getUserMedia = navigator.getUserMedia || 
                           navigator.webkitGetUserMedia || 
                           navigator.mozGetUserMedia || 
                           navigator.msGetUserMedia;
      
      if (getUserMedia) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          const legacyConstraints = constraints.video === undefined 
            ? { video: true, audio: true }
            : { video: true, audio: true }; // Simplified for legacy API
          
          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, legacyConstraints, resolve, reject);
          });
        };
      }
    }
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      console.log('Requesting camera access...');
      
      // Request camera with explicit constraints
      const constraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: true
      };

      // Try to get user media - the polyfill will handle legacy browsers
      let mediaStream;
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Modern API
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        // Fallback for older browsers (if polyfill didn't work)
        const getUserMedia = navigator.getUserMedia || 
                             navigator.webkitGetUserMedia || 
                             navigator.mozGetUserMedia || 
                             navigator.msGetUserMedia;
        
        if (!getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser. Please use a modern browser (Chrome, Firefox, Safari, Edge) or ensure you are using HTTPS or localhost.');
        }

        // Legacy API uses simpler constraints
        const legacyConstraints = {
          video: true,
          audio: true
        };

        // Use Promise-based wrapper for legacy API
        mediaStream = await new Promise((resolve, reject) => {
          getUserMedia.call(navigator, legacyConstraints, resolve, reject);
        });
        
        console.log('Camera access granted (legacy API)');
      }
      
      console.log('Camera access granted');
      console.log('Video tracks:', mediaStream.getVideoTracks());
      console.log('Audio tracks:', mediaStream.getAudioTracks());
      
      setStream(mediaStream);
      setHasPermission(true);
      
      // Wait for next tick to ensure state is updated
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Force video to play
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
          
          console.log('Video element configured');
        }
      }, 100);
      
    } catch (error) {
      console.error('Camera error:', error);
      let errorMessage = 'Error accessing camera: ';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not meet the requirements.';
      } else if (error.message && error.message.includes('not supported')) {
        errorMessage = error.message;
      } else if (error.message && (error.message.includes('HTTPS') || error.message.includes('localhost'))) {
        errorMessage = 'Camera access requires HTTPS or localhost. If you are accessing via IP address, please use http://localhost or configure HTTPS.';
      } else {
        errorMessage += error.message || 'Unknown error occurred. Please ensure you are using HTTPS or localhost, and that your browser has camera permissions enabled.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      setStream(null);
      setHasPermission(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startRecording = () => {
    if (!stream) {
      alert('No camera stream available');
      return;
    }

    try {
      // Check for available MIME types
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Using MIME type:', mimeType);
          break;
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
          console.log('Chunk recorded:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, total chunks:', chunks.length);
        const blob = new Blob(chunks, { type: selectedMimeType || 'video/webm' });
        const file = new File([blob], `evidence-${Date.now()}.webm`, {
          type: selectedMimeType || 'video/webm'
        });
        console.log('File created:', file.name, file.size, 'bytes');
        onVideoRecorded(file);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        alert('Recording error: ' + event.error);
      };

      mediaRecorder.start(100); // Capture data every 100ms
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Failed to start recording: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
      console.log('Stop recording triggered');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Monitor video element
  useEffect(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      };
      
      video.onplay = () => {
        console.log('Video started playing');
      };
      
      video.onerror = (e) => {
        console.error('Video element error:', e);
      };
    }
  }, [stream]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Camera inactive</p>
              {!hasPermission && (
                <p className="text-xs text-slate-500 mt-2">Click "Start Camera" to enable</p>
              )}
            </div>
          </div>
        )}
        
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Recording</span>
          </div>
        )}

        {stream && !isRecording && (
          <div className="absolute bottom-4 right-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
            Camera active
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!stream && (
          <button onClick={startCamera} className="btn-primary flex-1">
            Start Camera
          </button>
        )}

        {stream && !isRecording && (
          <>
            <button onClick={startRecording} className="btn-primary flex-1">
              Start Recording
            </button>
            <button onClick={stopCamera} className="btn-secondary">
              Cancel
            </button>
          </>
        )}

        {isRecording && (
          <button onClick={stopRecording} className="btn-primary flex-1 bg-red-600 hover:bg-red-700">
            Stop Recording
          </button>
        )}
      </div>

      {/* Debug info (remove in production) */}
      {stream && (
        <div className="text-xs text-slate-500 space-y-1">
          <p>Video tracks: {stream.getVideoTracks().length}</p>
          <p>Audio tracks: {stream.getAudioTracks().length}</p>
          {stream.getVideoTracks()[0] && (
            <p>Video track state: {stream.getVideoTracks()[0].readyState}</p>
          )}
        </div>
      )}
    </div>
  );
}
