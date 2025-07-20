import { NextResponse } from 'next/server';
import { getLink, updateLinkWithVideo, updateLinkWithTelegramData } from '@/lib/db';
import { uploadVideoToTelegram } from '@/lib/telegram';
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(request, { params }) {
  // Apply rate limiting
  const rateLimiter = rateLimit('/api/upload');
  const rateLimitResult = await rateLimiter(request);
  
  if (rateLimitResult.error) {
    return NextResponse.json(
      { success: false, error: rateLimitResult.error },
      { status: rateLimitResult.status, headers: rateLimitResult.headers }
    );
  }
  
  try {
    const { shortCode } = await params;
    
    const link = await getLink(shortCode);
    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }
    
    if (link.isRecordingComplete) {
      return NextResponse.json(
        { success: false, error: 'Recording already uploaded' },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const videoBlob = formData.get('video');
    
    if (!videoBlob) {
      return NextResponse.json(
        { success: false, error: 'No video provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedMimeTypes = [
      'video/webm', 
      'video/mp4', 
      'video/ogg',
      'video/quicktime', // MOV
      'video/x-msvideo', // AVI
      'video/x-ms-wmv', // WMV
      'video/mpeg', // MPEG
      'video/x-matroska' // MKV
    ];
    
    // Some browsers may not set the correct MIME type for certain formats
    const fileExtension = videoBlob.name?.toLowerCase().split('.').pop();
    const extensionMimeMap = {
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'wmv': 'video/x-ms-wmv',
      'mpeg': 'video/mpeg',
      'mpg': 'video/mpeg',
      'mkv': 'video/x-matroska'
    };
    
    let isValidType = allowedMimeTypes.includes(videoBlob.type);
    
    // Fallback to extension check if MIME type is generic
    if (!isValidType && videoBlob.type === 'application/octet-stream' && fileExtension) {
      const mappedMime = extensionMimeMap[fileExtension];
      if (mappedMime && allowedMimeTypes.includes(mappedMime)) {
        isValidType = true;
      }
    }
    
    if (!isValidType) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid file type. Supported formats: WebM, MP4, OGG, MOV, AVI, WMV, MPEG, MKV`
        },
        { status: 400 }
      );
    }
    
    const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
    
    // Additional validation: Check file signature (magic bytes) for common formats
    let isValidSignature = true; // Default to true for formats we don't check
    
    // Only validate signatures for the most common formats
    if (videoBlob.type === 'video/webm' && videoBuffer.length >= 4) {
      isValidSignature = videoBuffer[0] === 0x1A && videoBuffer[1] === 0x45 && 
                        videoBuffer[2] === 0xDF && videoBuffer[3] === 0xA3;
    } else if ((videoBlob.type === 'video/mp4' || videoBlob.type === 'video/quicktime') && videoBuffer.length >= 8) {
      // MP4 and MOV share similar structure (both based on QuickTime format)
      isValidSignature = videoBuffer[4] === 0x66 && videoBuffer[5] === 0x74 && 
                        videoBuffer[6] === 0x79 && videoBuffer[7] === 0x70;
    } else if (videoBlob.type === 'video/ogg' && videoBuffer.length >= 4) {
      isValidSignature = videoBuffer[0] === 0x4F && videoBuffer[1] === 0x67 && 
                        videoBuffer[2] === 0x67 && videoBuffer[3] === 0x53;
    } else if (videoBlob.type === 'video/x-msvideo' && videoBuffer.length >= 4) {
      // AVI files start with RIFF
      isValidSignature = videoBuffer[0] === 0x52 && videoBuffer[1] === 0x49 && 
                        videoBuffer[2] === 0x46 && videoBuffer[3] === 0x46;
    }
    
    if (!isValidSignature) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File content does not match declared type'
        },
        { status: 400 }
      );
    }
    
    // Check file size limit (100MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    if (videoBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File size (${(videoBuffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds the 100MB limit. Please record a shorter video.` 
        },
        { status: 413 } // Payload Too Large
      );
    }
    
    // Try to upload to Telegram first
    try {
      const { messageId, fileId } = await uploadVideoToTelegram(videoBuffer, shortCode);
      await updateLinkWithTelegramData(shortCode, fileId, messageId);
      
      return NextResponse.json({
        success: true,
        message: 'Video uploaded successfully to Telegram'
      });
    } catch (telegramError) {
      console.error('Telegram upload failed, falling back to database storage:', telegramError.message);
      
      // Fallback to database storage if Telegram fails
      await updateLinkWithVideo(shortCode, videoBuffer);
      
      return NextResponse.json({
        success: true,
        message: 'Video uploaded successfully'
      });
    }
  } catch (error) {
    console.error('Error uploading video:', error.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { shortCode } = await params;
    
    const link = await getLink(shortCode);
    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      isRecordingComplete: link.isRecordingComplete
    });
  } catch (error) {
    console.error('Error checking upload status:', error.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}