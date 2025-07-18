'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, VideoOff, Send, RotateCcw, Loader2 } from 'lucide-react';
import { SimpleMediaPlayer } from '@/components/ui/simple-media-player';

export default function RecordingPage() {
  const { shortCode } = useParams();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);
  const recordedBlob = useRef(null);

  useEffect(() => {
    checkLinkStatus();
    
    // Only set up polling if recording is not complete
    if (!recordingComplete) {
      const interval = setInterval(() => {
        if (!recordingComplete) {
          checkLinkStatus();
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [shortCode, recordingComplete]);

  const checkLinkStatus = async () => {
    try {
      const response = await fetch(`/api/upload/${shortCode}`);
      const data = await response.json();
      
      if (data.success && data.isRecordingComplete) {
        setRecordingComplete(true);
        setVideoUrl(`/api/video/${shortCode}`);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const startRecording = async () => {
    console.log('Starting recording process...');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      console.log('Got display media stream:', stream);

      streamRef.current = stream;
      recordedChunks.current = [];

      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log('vp9 not supported, trying vp8...');
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log('vp8 not supported, using basic webm...');
        options.mimeType = 'video/webm';
      }
      console.log('Using mimeType:', options.mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, options);
      console.log('MediaRecorder created:', mediaRecorder);

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available event:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
          console.log('Total chunks:', recordedChunks.current.length);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
        console.log('Recorded chunks:', recordedChunks.current.length);
        
        if (recordedChunks.current.length === 0) {
          console.error('No recorded data available');
          alert('No recording data was captured. Please try again.');
          return;
        }
        
        const totalSize = recordedChunks.current.reduce((acc, chunk) => acc + chunk.size, 0);
        console.log('Total recording size:', totalSize, 'bytes');
        
        const blob = new Blob(recordedChunks.current, {
          type: options.mimeType
        });
        console.log('Created blob:', blob.size, 'bytes', blob.type);
        
        recordedBlob.current = blob;
        const url = URL.createObjectURL(blob);
        console.log('Created preview URL:', url);
        
        setPreviewUrl(url);
        setHasRecorded(true);
        console.log('Recording preview should now be visible');
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        alert('Recording error: ' + event.error);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Capture data every second
      console.log('MediaRecorder started with 1s timeslice');
      setIsRecording(true);

      stream.getVideoTracks()[0].onended = () => {
        console.log('Video track ended by user');
        stopRecording();
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    console.log('Stop recording called');
    console.log('mediaRecorderRef.current:', mediaRecorderRef.current);
    console.log('isRecording:', isRecording);
    console.log('MediaRecorder state:', mediaRecorderRef.current?.state);
    
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      
      if (streamRef.current) {
        console.log('Stopping stream tracks...');
        streamRef.current.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind);
          track.stop();
        });
      }
      
      console.log('Calling mediaRecorder.stop()...');
      mediaRecorderRef.current.stop();
    }
  };

  const reRecord = () => {
    setHasRecorded(false);
    recordedChunks.current = [];
    recordedBlob.current = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const uploadRecording = async () => {
    if (!recordedBlob.current) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', recordedBlob.current, 'recording.webm');

      const response = await fetch(`/api/upload/${shortCode}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        router.push(`/${shortCode}`);
      } else {
        console.error('Upload failed:', data.error);
      }
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setIsUploading(false);
    }
  };


  if (checkingStatus) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-950 px-4">
        <Loader2 className="w-16 h-16 animate-spin text-green-400" />
      </main>
    );
  }

  if (recordingComplete) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-950 p-4 sm:p-8">
        <div className="max-w-4xl w-full space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-white tracking-tight">recording ready</h1>
          
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-green-950">
            <MediaPlayer src={videoUrl} className="w-full" />
          </div>
          
          <p className="text-center text-gray-400 text-lg sm:text-xl">
            this recording has already been submitted
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-950 p-4 sm:p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">share your screen</h1>
          <p className="text-gray-400 text-lg sm:text-xl">
            {isRecording ? 'recording in progress...' : 
             hasRecorded ? 'preview your recording' : 
             'click record to start'}
          </p>
        </div>

        {hasRecorded && previewUrl && (
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-green-950">
            <SimpleMediaPlayer src={previewUrl} className="w-full" />
          </div>
        )}
        
        {hasRecorded && !previewUrl && (
          <div className="bg-red-950/50 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-red-400">Recording completed but preview not available. Check console for errors.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!hasRecorded ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-4 sm:px-8 sm:py-5 rounded-2xl text-xl sm:text-2xl font-bold tracking-tight transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 ${
                isRecording 
                  ? 'bg-red-950 text-white hover:bg-red-900 border border-red-800' 
                  : 'bg-green-950 text-white hover:bg-green-900 border border-green-800'
              }`}
            >
              {isRecording ? (
                <>
                  <VideoOff className="w-7 h-7 sm:w-8 sm:h-8" />
                  stop recording
                </>
              ) : (
                <>
                  <Video className="w-7 h-7 sm:w-8 sm:h-8" />
                  record
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={reRecord}
                className="px-6 py-4 sm:px-8 sm:py-5 bg-gray-900 text-white rounded-2xl text-xl sm:text-2xl font-bold tracking-tight hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 border border-gray-700"
              >
                <RotateCcw className="w-7 h-7 sm:w-8 sm:h-8" />
                re-record
              </button>
              
              <button
                onClick={uploadRecording}
                disabled={isUploading}
                className="px-6 py-4 sm:px-8 sm:py-5 bg-green-950 text-white rounded-2xl text-xl sm:text-2xl font-bold tracking-tight hover:bg-green-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 border border-green-800"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
                    sending...
                  </>
                ) : (
                  <>
                    <Send className="w-7 h-7 sm:w-8 sm:h-8" />
                    send
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}