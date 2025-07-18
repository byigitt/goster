import { NextResponse } from 'next/server';
import { getLink } from '@/lib/db';

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
    
    if (!link.isRecordingComplete || !link.videoData) {
      return NextResponse.json(
        { success: false, error: 'Video not yet uploaded' },
        { status: 404 }
      );
    }
    
    return new NextResponse(link.videoData, {
      headers: {
        'Content-Type': 'video/webm',
        'Content-Length': link.videoData.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error retrieving video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve video' },
      { status: 500 }
    );
  }
}