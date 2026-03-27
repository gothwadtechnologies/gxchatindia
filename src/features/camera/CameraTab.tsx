import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Zap, ZapOff, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CameraTab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please ensure you have granted permission.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isFrontCamera]);

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        // In a real app, you'd navigate to a preview screen or save it
        console.log("Photo taken:", dataUrl);
        alert("Photo taken! (Simulation)");
      }
    }
  };

  return (
    <div className="h-full bg-black flex flex-col relative overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all"
        >
          <X size={24} />
        </button>
        <button 
          onClick={() => setFlash(!flash)}
          className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all"
        >
          {flash ? <Zap size={24} className="text-yellow-400 fill-yellow-400" /> : <ZapOff size={24} />}
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-white/70 mb-6 font-medium">{error}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-3 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className={`w-full h-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 inset-x-0 p-10 flex justify-between items-center z-10 bg-gradient-to-t from-black/50 to-transparent">
        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
          <ImageIcon size={28} />
        </button>

        <button 
          onClick={takePhoto}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-all"
        >
          <div className="w-16 h-16 bg-white rounded-full" />
        </button>

        <button 
          onClick={toggleCamera}
          className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
        >
          <RefreshCw size={28} />
        </button>
      </div>
    </div>
  );
}
