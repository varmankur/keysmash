'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Video, Square, RefreshCcw, Check } from 'lucide-react';

interface CameraCaptureProps {
  id: string;
  mode: 'photo' | 'video';
  primaryColor: string;
  onCapture: (file: File | null) => void;
}

export function CameraCapture({ id, mode, primaryColor, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [hasCamera, setHasCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: mode === 'video'
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
      setCapturedUrl(null);
      onCapture(null);
    } catch (err) {
      console.error(err);
      setError('Camera access denied or unavailable. Ensure you are on HTTPS.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasCamera(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `photo_${id}_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          setCapturedUrl(url);
          onCapture(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `video_${id}_${Date.now()}.webm`, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setCapturedUrl(url);
      onCapture(file);
      stopCamera();
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const retake = () => {
    setCapturedUrl(null);
    onCapture(null);
    startCamera();
  };

  return (
    <div className="w-full bg-black border border-zinc-800 rounded-xl overflow-hidden flex flex-col items-center">
      {error ? (
        <div className="p-6 text-center text-red-500">
          {error}
          <button 
            type="button"
            onClick={startCamera}
            className="block mx-auto mt-4 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
          >
            Try Again
          </button>
        </div>
      ) : capturedUrl ? (
        <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center">
          {mode === 'photo' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capturedUrl} alt="Captured" className="h-full object-contain" />
          ) : (
            <video src={capturedUrl} controls className="h-full object-contain" />
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center text-green-400 text-sm font-medium border border-green-500/30">
              <Check className="w-4 h-4 mr-1" /> Captured
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <button 
              type="button" 
              onClick={retake}
              className="bg-black/50 hover:bg-black/80 text-white backdrop-blur-md px-4 py-2 rounded-full flex items-center transition-colors border border-zinc-700"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Retake
            </button>
          </div>
        </div>
      ) : hasCamera ? (
        <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted={mode === 'video'} 
            className={`h-full object-contain ${mode === 'photo' ? '-scale-x-100' : ''}`} // Mirror photo
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            {mode === 'photo' ? (
              <button 
                type="button" 
                onClick={takePhoto}
                className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center hover:bg-white/20 transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${isRecording ? 'border-red-500 bg-transparent' : 'border-white/50 bg-red-500'}`}
              >
                {isRecording ? <Square className="w-6 h-6 text-red-500 fill-red-500" /> : <Video className="w-6 h-6 text-white" />}
              </button>
            )}
          </div>
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse mr-2" />
              <span className="text-red-500 text-sm font-medium">Recording</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 flex flex-col items-center justify-center space-y-4">
          {mode === 'photo' ? <Camera className="w-12 h-12 text-zinc-600" /> : <Video className="w-12 h-12 text-zinc-600" />}
          <button 
            type="button" 
            onClick={startCamera}
            className="px-6 py-3 text-black font-medium rounded-xl transition-all hover:opacity-90 flex items-center"
            style={{ backgroundColor: primaryColor }}
          >
            {mode === 'photo' ? 'Enable Camera' : 'Enable Camera & Mic'}
          </button>
          <p className="text-sm text-zinc-500 text-center max-w-sm">
            This will ask for permission to use your device&apos;s camera to submit feedback.
          </p>
        </div>
      )}
    </div>
  );
}
