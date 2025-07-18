import { NextResponse } from 'next/server';
import { getLink } from '@/lib/db';
import { streamVideoFromTelegram } from '@/lib/telegram';

export async function HEAD(request, { params }) {
  try {
    const { shortCode } = await params;
    
    const link = await getLink(shortCode);
    if (!link || !link.isRecordingComplete) {
      return new NextResponse(null, { status: 404 });
    }
    
    // If video is in Telegram, verify it actually exists
    if (link.telegramFileId) {
      try {
        // Try to get the file info from Telegram
        await streamVideoFromTelegram(link.telegramFileId);
        return new NextResponse(null, { status: 200 });
      } catch (error) {
        console.error('Video not found in Telegram:', error);
        return new NextResponse(null, { status: 404 });
      }
    }
    
    // Check if video exists in database
    if (link.videoData) {
      return new NextResponse(null, { status: 200 });
    }
    
    return new NextResponse(null, { status: 404 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
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
    
    if (!link.isRecordingComplete) {
      return NextResponse.json(
        { success: false, error: 'Video not yet uploaded' },
        { status: 404 }
      );
    }
    
    // Check if video is stored in Telegram
    if (link.telegramFileId) {
      try {
        const response = await streamVideoFromTelegram(link.telegramFileId);
        const videoBuffer = await response.arrayBuffer();
        
        return new NextResponse(videoBuffer, {
          headers: {
            'Content-Type': 'video/webm',
            'Content-Length': videoBuffer.byteLength.toString(),
          },
        });
      } catch (telegramError) {
        console.error('Error fetching from Telegram:', telegramError);
        // If video was in Telegram but is now deleted, return 404
        // Don't fall back to database storage
        return NextResponse.json(
          { success: false, error: 'Video has been deleted' },
          { status: 404 }
        );
      }
    }
    
    // Fallback to database storage
    if (link.videoData) {
      return new NextResponse(link.videoData, {
        headers: {
          'Content-Type': 'video/webm',
          'Content-Length': link.videoData.length.toString(),
        },
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Video data not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error retrieving video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve video' },
      { status: 500 }
    );
  }
}