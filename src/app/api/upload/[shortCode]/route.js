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
    const allowedMimeTypes = ['video/webm', 'video/mp4', 'video/ogg'];
    if (!allowedMimeTypes.includes(videoBlob.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
        },
        { status: 400 }
      );
    }
    
    const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
    
    // Additional validation: Check file signature (magic bytes)
    const signatures = {
      'video/webm': [0x1A, 0x45, 0xDF, 0xA3], // WebM
      'video/mp4': [0x00, 0x00, 0x00, [0x18, 0x20], 0x66, 0x74, 0x79, 0x70], // MP4
      'video/ogg': [0x4F, 0x67, 0x67, 0x53] // OGG
    };
    
    // Simple magic byte validation
    let isValidSignature = false;
    if (videoBlob.type === 'video/webm' && videoBuffer.length >= 4) {
      isValidSignature = signatures['video/webm'].every((byte, i) => videoBuffer[i] === byte);
    } else if (videoBlob.type === 'video/mp4' && videoBuffer.length >= 8) {
      isValidSignature = videoBuffer[4] === 0x66 && videoBuffer[5] === 0x74 && 
                        videoBuffer[6] === 0x79 && videoBuffer[7] === 0x70;
    } else if (videoBlob.type === 'video/ogg' && videoBuffer.length >= 4) {
      isValidSignature = signatures['video/ogg'].every((byte, i) => videoBuffer[i] === byte);
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