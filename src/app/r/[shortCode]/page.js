"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Video,
  VideoOff,
  Send,
  RotateCcw,
  Loader2,
  AlertCircle,
  Monitor,
  Upload,
} from "lucide-react";
import { SimpleMediaPlayer } from "@/components/ui/simple-media-player";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";

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
  const [recordingTime, setRecordingTime] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [uploadMode, setUploadMode] = useState("record"); // "record" or "upload"
  const [selectedFile, setSelectedFile] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);
  const recordedBlob = useRef(null);
  const recordingTimerRef = useRef(null);

  const MAX_RECORDING_TIME = 600; // 10 minutes in seconds

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, []);

  const checkLinkStatus = async () => {
    try {
      const response = await fetch(`/api/upload/${shortCode}`);
      const data = await response.json();

      if (data.success && data.isRecordingComplete) {
        setRecordingComplete(true);
        setVideoUrl(`/api/video/${shortCode}`);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const startRecording = async () => {
    console.log("Starting recording process...");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      console.log("Got display media stream:", stream);

      streamRef.current = stream;
      recordedChunks.current = [];

      const options = { mimeType: "video/webm;codecs=vp9,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log("vp9 not supported, trying vp8...");
        options.mimeType = "video/webm;codecs=vp8,opus";
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log("vp8 not supported, using basic webm...");
        options.mimeType = "video/webm";
      }
      console.log("Using mimeType:", options.mimeType);

      const mediaRecorder = new MediaRecorder(stream, options);
      console.log("MediaRecorder created:", mediaRecorder);

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available event:", event.data.size, "bytes");
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
          console.log("Total chunks:", recordedChunks.current.length);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped");
        console.log("Recorded chunks:", recordedChunks.current.length);

        if (recordedChunks.current.length === 0) {
          console.error("No recorded data available");
          toast.error("No Recording Data", {
            description:
              "No data was captured during recording. Please try again.",
            duration: 5000,
          });
          return;
        }

        const totalSize = recordedChunks.current.reduce(
          (acc, chunk) => acc + chunk.size,
          0
        );
        console.log("Total recording size:", totalSize, "bytes");

        const blob = new Blob(recordedChunks.current, {
          type: options.mimeType,
        });
        console.log("Created blob:", blob.size, "bytes", blob.type);

        recordedBlob.current = blob;
        const url = URL.createObjectURL(blob);
        console.log("Created preview URL:", url);

        setPreviewUrl(url);
        setHasRecorded(true);
        console.log("Recording preview should now be visible");
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        toast.error("Recording Error", {
          description: `An error occurred during recording: ${
            event.error?.message || "Unknown error"
          }`,
          duration: 5000,
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Capture data every second
      console.log("MediaRecorder started with 1s timeslice");
      setIsRecording(true);
      setRecordingTime(0);
      setShowTimeWarning(false);

      // Start the recording timer
      recordingTimerRef.current = setInterval(() => {
        // Double-check we're still recording
        if (
          !mediaRecorderRef.current ||
          mediaRecorderRef.current.state !== "recording"
        ) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
          return;
        }

        setRecordingTime((prev) => {
          const newTime = prev + 1;

          // Show warning at 9 minutes (540 seconds)
          if (newTime === 540) {
            setShowTimeWarning(true);
          }

          // Auto-stop at 60 seconds
          if (newTime >= MAX_RECORDING_TIME) {
            console.log("Max recording time reached, stopping...");
            toast.info("Recording Time Limit Reached", {
              description:
                "Your recording has been automatically stopped at 10 minutes.",
              duration: 4000,
            });
            stopRecording();
            return MAX_RECORDING_TIME;
          }

          return newTime;
        });
      }, 1000);

      stream.getVideoTracks()[0].onended = () => {
        console.log("Video track ended by user");
        stopRecording();
      };
    } catch (error) {
      console.error("Error starting recording:", error);

      // Handle specific error cases
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        toast.error("Permission Denied", {
          description:
            "Please allow screen recording permission to continue. Check your browser settings if the prompt did not appear.",
          duration: 6000,
          icon: <AlertCircle className="w-5 h-5" />,
        });
      } else if (error.name === "NotFoundError") {
        toast.error("No Screen Found", {
          description: "Could not find a screen to record. Please try again.",
          duration: 5000,
        });
      } else if (error.name === "NotReadableError") {
        toast.error("Screen Not Readable", {
          description:
            "The screen source could not be read. Another application might be blocking access.",
          duration: 5000,
        });
      } else if (error.name === "OverconstrainedError") {
        toast.error("Recording Failed", {
          description:
            "The requested recording settings are not supported by your device.",
          duration: 5000,
        });
      } else {
        toast.error("Recording Error", {
          description:
            error.message ||
            "An unexpected error occurred while starting the recording.",
          duration: 5000,
        });
      }
    }
  };

  const stopRecording = () => {
    console.log("Stop recording called");
    console.log("mediaRecorderRef.current:", mediaRecorderRef.current);
    console.log("isRecording:", isRecording);
    console.log("MediaRecorder state:", mediaRecorderRef.current?.state);

    // Clear the recording timer immediately
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);

      if (streamRef.current) {
        console.log("Stopping stream tracks...");
        streamRef.current.getTracks().forEach((track) => {
          console.log("Stopping track:", track.kind);
          track.stop();
        });
      }

      console.log("Calling mediaRecorder.stop()...");
      mediaRecorderRef.current.stop();
    }
  };

  const reRecord = () => {
    setHasRecorded(false);
    recordedChunks.current = [];
    recordedBlob.current = null;
    setRecordingTime(0);
    setShowTimeWarning(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file) {
      setHasRecorded(true);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      recordedBlob.current = file;
    } else {
      reRecord();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const uploadRecording = async () => {
    if (!recordedBlob.current) return;

    // Check file size (100MB limit)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    const fileSizeMB = (recordedBlob.current.size / (1024 * 1024)).toFixed(2);

    if (recordedBlob.current.size > MAX_FILE_SIZE) {
      toast.error("File Too Large", {
        description: `Your ${uploadMode === "record" ? "recording" : "video"} is ${fileSizeMB}MB. Please ${uploadMode === "record" ? "record a shorter video" : "select a smaller file"} (max 100MB).`,
        duration: 6000,
        icon: <AlertCircle className="w-5 h-5" />,
      });
      return;
    }

    setIsUploading(true);

    const uploadToast = toast.loading(`Uploading your ${uploadMode === "record" ? "recording" : "video"}...`);

    try {
      const formData = new FormData();
      const filename = uploadMode === "record" ? "recording.webm" : selectedFile?.name || "upload.mp4";
      formData.append("video", recordedBlob.current, filename);

      const response = await fetch(`/api/upload/${shortCode}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Upload Successful!", {
          id: uploadToast,
          description: `Your ${uploadMode === "record" ? "recording" : "video"} has been sent successfully.`,
          duration: 3000,
        });
        setTimeout(() => {
          router.push(`/${shortCode}`);
        }, 500);
      } else {
        toast.error("Upload Failed", {
          id: uploadToast,
          description:
            data.error || `Failed to upload the ${uploadMode === "record" ? "recording" : "video"}. Please try again.`,
          duration: 5000,
        });
        console.error("Upload failed:", data.error);
      }
    } catch (error) {
      toast.error("Upload Error", {
        id: uploadToast,
        description:
          "Network error occurred. Please check your connection and try again.",
        duration: 5000,
      });
      console.error("Error uploading:", error);
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-white tracking-tight">
            recording ready
          </h1>

          <div className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-green-950">
            <SimpleMediaPlayer src={videoUrl} className="w-full" />
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            {uploadMode === "record" ? "share your screen" : "upload video"}
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl">
            {uploadMode === "record" ? (
              isRecording
                ? "recording in progress..."
                : hasRecorded
                ? "preview your recording"
                : "click record to start"
            ) : (
              hasRecorded
                ? "preview your video"
                : "select or drop a video file"
            )}
          </p>
          {!hasRecorded && (
            <div className="space-y-1">
              <p className="text-gray-500 text-base">
                {uploadMode === "record" ? "maximum recording time: 10 minutes" : "supported formats: MP4, WebM, MOV, AVI"}
              </p>
              <p className="text-gray-500 text-base">
                maximum file size: 100 MB
              </p>
            </div>
          )}
        </div>

        {!hasRecorded && !isRecording && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setUploadMode("record");
                reRecord();
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                uploadMode === "record"
                  ? "bg-green-950 text-white border border-green-800"
                  : "bg-gray-900 text-gray-400 border border-gray-700 hover:text-white"
              }`}
            >
              <Monitor className="w-5 h-5" />
              Screen Record
            </button>
            <button
              onClick={() => {
                setUploadMode("upload");
                reRecord();
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                uploadMode === "upload"
                  ? "bg-green-950 text-white border border-green-800"
                  : "bg-gray-900 text-gray-400 border border-gray-700 hover:text-white"
              }`}
            >
              <Upload className="w-5 h-5" />
              Upload File
            </button>
          </div>
        )}

        {isRecording && (
          <div className="text-center space-y-4">
            <div
              className={`text-6xl font-mono font-bold ${
                showTimeWarning
                  ? "text-red-400 animate-pulse"
                  : "text-green-400"
              }`}
            >
              {formatTime(recordingTime)}
            </div>
            {showTimeWarning && (
              <p className="text-red-400 text-lg animate-pulse">
                recording will stop in {MAX_RECORDING_TIME - recordingTime}{" "}
                seconds!
              </p>
            )}
          </div>
        )}

        {hasRecorded && previewUrl && (
          <div className="space-y-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-green-950">
              <SimpleMediaPlayer src={previewUrl} className="w-full" />
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                File size:{" "}
                {recordedBlob.current
                  ? (recordedBlob.current.size / (1024 * 1024)).toFixed(2)
                  : "0"}{" "}
                MB
                {recordedBlob.current &&
                  recordedBlob.current.size > 100 * 1024 * 1024 && (
                    <span className="text-red-400 ml-2">
                      (exceeds 100MB limit)
                    </span>
                  )}
              </p>
            </div>
          </div>
        )}

        {hasRecorded && !previewUrl && (
          <div className="bg-red-950/50 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-red-400">
              Recording completed but preview not available. Check console for
              errors.
            </p>
          </div>
        )}

        {uploadMode === "upload" && !hasRecorded && (
          <FileUpload
            onFileSelect={handleFileSelect}
            maxSize={100 * 1024 * 1024}
            accept="video/*"
          />
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!hasRecorded && uploadMode === "record" ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-4 sm:px-8 sm:py-5 rounded-2xl text-xl sm:text-2xl font-bold tracking-tight transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 ${
                isRecording
                  ? "bg-red-950 text-white hover:bg-red-900 border border-red-800"
                  : "bg-green-950 text-white hover:bg-green-900 border border-green-800"
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
          ) : !hasRecorded && uploadMode === "upload" ? null : (
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
