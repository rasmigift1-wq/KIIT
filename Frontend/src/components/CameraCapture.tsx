import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import { getCurrentPosition } from '@/lib/geolocation';

interface CameraCaptureProps {
  onCapture: (file: File, location: { lat: number; lng: number }, capturedAt: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  useEffect(() => {
    const init = async () => {
      await enumerateDevices();
      await startCamera();
    };
    init();
    return () => stopCamera();
  }, []);

  const enumerateDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  };

  const startCamera = async (deviceIndex = currentDeviceIndex) => {
    setError(null);
    setVideoReady(false);
    stopCamera();

    try {
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      };

      // If we have devices enumerated and a valid index, use that deviceId
      if (devices.length > 0 && devices[deviceIndex]) {
        videoConstraints.deviceId = { exact: devices[deviceIndex].deviceId };
      } else {
        // Fallback/Initial: On mobile, 'environment' is usually preferred for capturing dustbins, 
        // but on desktop/laptop 'user' is the safest default if not specified.
        // We'll use 'ideal' to be flexible.
        videoConstraints.facingMode = { ideal: 'user' };
      }

      const s = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints, 
        audio: false 
      });
      
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
          setVideoReady(true);
        };
      }
    } catch (err: any) {
      console.error("Camera Error:", err);
      if (err.name === 'OverconstrainedError') {
        // Try again without specific deviceId if it failed
        try {
          const s = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { ideal: 'user' } }, 
            audio: false 
          });
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              setVideoReady(true);
            };
          }
          return;
        } catch (innerErr) {
          setError("Could not switch to selected camera. Please check permissions.");
        }
      } else {
        setError("Camera access denied or unavailable. Please ensure you have granted camera permissions.");
      }
    }
  };

  const switchCamera = async () => {
    if (devices.length < 2) return;
    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    await startCamera(nextIndex);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && videoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError("Camera stream not ready. Please wait a moment and try again.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(dataUrl);

        // Convert base64 to File
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `dustbin_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setCapturedFile(file);
          });
        
        // Lock location immediately
        fetchLocation();
        stopCamera();
      }
    }
  };

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      setLocation(pos);
    } catch (err: any) {
      console.error("GPS Error:", err);
      setError(err.message || "Could not lock location. GPS is required for verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (capturedFile && location) {
      onCapture(capturedFile, location, new Date().toISOString());
    }
  };

  const retake = () => {
    setPreview(null);
    setCapturedFile(null);
    setLocation(null);
    setError(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg z-10"
      >
        <GlassCard hover={false} className="p-0 overflow-hidden border-primary/20 bg-black/60 shadow-2xl shadow-primary/10">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/20 rounded-lg">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Secure Capture</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewport */}
          <div className="relative aspect-square sm:aspect-video bg-black flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} className="hidden" />
            
            {!preview ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay guides */}
                <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
                   <div className="w-full h-full border border-white/20 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50" />
                   </div>
                </div>

                <div className="absolute top-4 left-4 z-20">
                   {devices.length > 1 && (
                     <button
                       onClick={(e) => { e.stopPropagation(); switchCamera(); }}
                       className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
                     >
                       <RefreshCw className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Switch Camera</span>
                     </button>
                   )}
                </div>

                <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-lg backdrop-blur-md">
                   <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                     {devices[currentDeviceIndex]?.label || `Camera ${currentDeviceIndex + 1}`}
                   </span>
                </div>

                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                   <motion.button
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={captureImage}
                     disabled={!!error || !videoReady}
                     className="group relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30"
                   >
                     <div className="w-14 h-14 rounded-full bg-white group-hover:bg-primary transition-colors" />
                     {videoReady && <div className="absolute -inset-2 border border-primary/50 rounded-full animate-ping opacity-20 pointer-events-none" />}
                   </motion.button>
                </div>
              </>
            ) : (
              <img src={preview} className="w-full h-full object-cover" alt="Captured" />
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-sm font-bold text-destructive uppercase tracking-widest">{error}</p>
                  <button onClick={retake} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Retry Connection</button>
                </div>
              </div>
            )}
          </div>

          {/* Controls & Info */}
          <div className="p-6 space-y-6 bg-gradient-to-b from-white/5 to-transparent">
            <div className="space-y-4">
              {location ? (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-secondary/5"
                 >
                   <div className="p-2.5 bg-secondary/20 rounded-xl">
                     <MapPin className="w-5 h-5 text-secondary" />
                   </div>
                   <div className="flex-1">
                     <div className="text-[10px] font-black text-secondary/70 uppercase tracking-[0.2em] mb-0.5">Hardware GPS Signal</div>
                     <div className="text-sm font-black font-mono tracking-tight">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                     <div className="flex gap-0.5">
                       {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-secondary rounded-full" />)}
                     </div>
                     <span className="text-[8px] font-black text-secondary uppercase animate-pulse">Stable</span>
                   </div>
                 </motion.div>
              ) : (
                preview && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-white/10 rounded-xl">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Satellite Connection</div>
                      <div className="text-sm font-black opacity-30 italic animate-pulse">Acquiring Orbital Lock...</div>
                    </div>
                  </div>
                )
              )}

              <div className="flex gap-3 pt-2">
                {preview ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={retake}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Reset
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      disabled={!location || loading}
                      className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-primary/50 flex items-center justify-center gap-2 disabled:opacity-30 disabled:shadow-none"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {loading ? "Syncing..." : "Finalize Report"}
                    </motion.button>
                  </>
                ) : (
                  <div className="w-full text-center space-y-2 py-2">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Protocol: Visual Evidence Required</p>
                    <div className="flex justify-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                       <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                       <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CameraCapture;
