"use client";

import { useRef, useState } from "react";
import { Upload, X, FileVideo } from "lucide-react";

export function FileUpload({ onFileSelect, maxSize = 100 * 1024 * 1024, accept = "video/*" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setError(null);

    // Check file type
    if (!file.type.startsWith("video/")) {
      setError("Please select a video file");
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File is too large (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-green-400 bg-green-950/30"
              : "border-gray-700 hover:border-gray-600 bg-black/30"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
          
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
          
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Drop your video here
          </h3>
          
          <p className="text-gray-400 mb-4">
            or click to browse files
          </p>
          
          <p className="text-sm text-gray-500">
            Maximum file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
          </p>
          
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: MP4, WebM, MOV, AVI
          </p>
        </div>
      ) : (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl border border-green-950 p-6">
          <div className="flex items-center gap-4">
            <FileVideo className="w-10 h-10 text-green-400 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            
            <button
              onClick={clearSelection}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-950/50 backdrop-blur-sm rounded-xl border border-red-800">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}