'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Copy, Check, Share2, List } from 'lucide-react';
import { saveLink } from '@/lib/localStorage';

export default function Home() {
  const [isCreating, setIsCreating] = useState(false);
  const [linkData, setLinkData] = useState(null);
  const [copied, setCopied] = useState(false);

  const createLink = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/links/create', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLinkData(data);
        // Save to localStorage
        saveLink({
          shortCode: data.shortCode,
          url: data.url
        });
      } else {
        console.error('Failed to create link');
      }
    } catch (error) {
      console.error('Error creating link:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!linkData) return;
    
    try {
      await navigator.clipboard.writeText(linkData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLink = async () => {
    if (!linkData) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'göster recording link',
          text: 'record your screen for me',
          url: linkData.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  const createNewLink = () => {
    setLinkData(null);
    setCopied(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-950 px-4">
      <div className="text-center space-y-8 p-8 max-w-2xl w-full">
        <div>
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold text-white tracking-tight">göster</h1>
          <p className="text-2xl sm:text-3xl text-gray-400 mt-4 font-medium tracking-tight">share your screen, simply</p>
        </div>
        
        {!linkData ? (
          <div className="space-y-4">
            <button
              onClick={createLink}
              disabled={isCreating}
              className="px-8 py-3 bg-green-950 text-white rounded-xl text-xl sm:text-2xl font-bold tracking-tight hover:bg-green-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto border border-green-800"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  creating...
                </>
              ) : (
                'create link'
              )}
            </button>
            
            <Link
              href="/links"
              className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 text-lg mx-auto w-fit"
            >
              <List className="w-5 h-5" />
              my links
            </Link>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-green-950">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">your link is ready!</h2>
              <p className="text-lg sm:text-xl text-gray-400">share this link to receive a screen recording</p>
            </div>
            
            <div className="flex items-center gap-4 bg-green-950/30 rounded-xl p-4 border border-green-900">
              <input
                type="text"
                value={linkData.url}
                readOnly
                className="flex-1 bg-transparent outline-none text-white font-mono text-sm sm:text-base"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-green-900/50 rounded-lg transition-colors"
                title="copy link"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={shareLink}
                className="flex-1 px-6 py-4 bg-green-950 text-white rounded-xl text-xl sm:text-2xl font-bold tracking-tight hover:bg-green-900 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border border-green-800"
              >
                <Share2 className="w-6 h-6" />
                share link
              </button>
              
              <button
                onClick={createNewLink}
                className="px-6 py-4 bg-gray-900 text-white rounded-xl text-xl sm:text-2xl font-bold tracking-tight hover:bg-gray-800 transition-all duration-200 border border-gray-700"
              >
                create new
              </button>
            </div>
            
            <div className="text-base sm:text-lg text-gray-400">
              <p>link expires in 24 hours</p>
              <p className="mt-2">
                <a 
                  href={`/${linkData.shortCode}`}
                  className="text-green-400 hover:underline text-base sm:text-lg"
                >
                  view status →
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}