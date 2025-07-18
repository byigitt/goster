'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, Check, Loader2, Share2 } from 'lucide-react';
import { updateLinkStatus } from '@/lib/localStorage';
import { SimpleMediaPlayer } from '@/components/ui/simple-media-player';

export default function SenderViewPage() {
  const { shortCode } = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [checking, setChecking] = useState(true);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${shortCode}`;

  useEffect(() => {
    checkRecordingStatus();
    
    // Only set up polling if recording is not complete
    if (!recordingComplete) {
      const interval = setInterval(() => {
        if (!recordingComplete) {
          checkRecordingStatus();
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [shortCode, recordingComplete]);

  const checkRecordingStatus = async () => {
    try {
      const response = await fetch(`/api/upload/${shortCode}`);
      const data = await response.json();
      
      if (data.success && data.isRecordingComplete) {
        setRecordingComplete(true);
        setVideoUrl(`/api/video/${shortCode}`);
        // Update localStorage status
        updateLinkStatus(shortCode, { 
          status: 'completed'
        });
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'göster recording link',
          text: 'record your screen for me',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-950 px-4">
        <Loader2 className="w-16 h-16 animate-spin text-green-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-950 p-4 sm:p-8">
      <div className="max-w-4xl w-full space-y-8">
        {!recordingComplete ? (
          <>
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">share this link</h1>
              <p className="text-gray-400 text-lg sm:text-xl">
                send this link to someone to record their screen
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-green-950">
              <div className="flex items-center gap-4 bg-green-950/30 rounded-xl p-4 border border-green-900">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent outline-none text-white font-mono text-sm sm:text-base md:text-lg truncate"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-green-900/50 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <Copy className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>

              <button
                onClick={shareLink}
                className="w-full px-6 py-4 bg-green-950 text-white rounded-xl text-xl sm:text-2xl font-bold tracking-tight hover:bg-green-900 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border border-green-800"
              >
                <Share2 className="w-6 h-6 sm:w-7 sm:h-7" />
                share link
              </button>

              <div className="text-center text-gray-400">
                <p className="text-lg sm:text-xl">waiting for recording...</p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="w-3 h-3 bg-green-400/40 rounded-full animate-pulse"></span>
                  <span className="w-3 h-3 bg-green-400/40 rounded-full animate-pulse delay-100"></span>
                  <span className="w-3 h-3 bg-green-400/40 rounded-full animate-pulse delay-200"></span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">recording received!</h1>
              <p className="text-gray-400 text-lg sm:text-xl">
                your recording is ready to view
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-green-950">
              <SimpleMediaPlayer src={videoUrl} className="w-full" />
            </div>

          </>
        )}
      </div>
    </main>
  );
}