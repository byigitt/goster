'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, Check, ExternalLink, Clock, CheckCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { getStoredLinks, deleteLink as deleteStoredLink } from '@/lib/localStorage';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, linkId: null });

  useEffect(() => {
    loadLinks();
    setLoading(false);
  }, []);

  const loadLinks = () => {
    const storedLinks = getStoredLinks();
    setLinks(storedLinks);
  };

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, linkId: id });
  };

  const confirmDelete = () => {
    if (deleteModal.linkId) {
      deleteStoredLink(deleteModal.linkId);
      loadLinks();
      setDeleteModal({ isOpen: false, linkId: null });
    }
  };

  const copyToClipboard = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).toLowerCase();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-950 px-4">
        <Loader2 className="w-16 h-16 animate-spin text-green-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-black to-green-950 p-4 sm:p-8">
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, linkId: null })}
        onConfirm={confirmDelete}
        title="Delete Link"
        message="Are you sure you want to delete this link? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">your links</h1>
            <p className="text-gray-400 mt-2 text-lg sm:text-xl">manage and track all your recording links</p>
          </div>
          
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-green-950 text-white rounded-xl hover:bg-green-900 transition-colors border border-green-800 text-base sm:text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            back
          </Link>
        </div>

        {links.length === 0 ? (
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-green-950">
            <p className="text-gray-400 text-xl sm:text-2xl">no links created yet</p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-green-950 text-white rounded-xl hover:bg-green-900 transition-colors border border-green-800 text-lg sm:text-xl"
            >
              create your first link
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-black/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-green-950 hover:border-green-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {link.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        )}
                        <span className={`text-base sm:text-lg font-medium ${
                          link.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {link.status === 'completed' ? 'recorded' : 'waiting'}
                        </span>
                      </div>
                      
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={link.url}
                        readOnly
                        className="flex-1 bg-green-950/30 text-white font-mono text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg outline-none overflow-hidden text-ellipsis"
                      />
                      
                      <button
                        onClick={() => copyToClipboard(link.url, link.id)}
                        className="p-2 hover:bg-green-900/50 rounded-lg transition-colors"
                        title="copy link"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-6 h-6 text-green-400" />
                        ) : (
                          <Copy className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      
                      <Link
                        href={`/${link.shortCode}`}
                        className="p-2 hover:bg-green-900/50 rounded-lg transition-colors"
                        title="view"
                      >
                        <ExternalLink className="w-6 h-6 text-gray-400" />
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-2 hover:bg-red-900/50 rounded-lg transition-colors"
                        title="delete"
                      >
                        <Trash2 className="w-6 h-6 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                    
                    <p className="text-base sm:text-lg text-gray-500">
                      created {formatDate(link.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}