import { NextResponse } from 'next/server';
import { getLink, updateLinkWithVideo, updateLinkWithTelegramData } from '@/lib/db';
import { uploadVideoToTelegram } from '@/lib/telegram';

export async function POST(request, { params }) {
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
    
    const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
    
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
      console.error('Telegram upload failed, falling back to database storage:', telegramError);
      
      // Fallback to database storage if Telegram fails
      await updateLinkWithVideo(shortCode, videoBuffer);
      
      return NextResponse.json({
        success: true,
        message: 'Video uploaded successfully'
      });
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload video' },
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
    console.error('Error checking upload status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}