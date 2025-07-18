import { NextResponse } from 'next/server';
import { getLink, updateLinkWithVideo } from '@/lib/db';

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
    
    await updateLinkWithVideo(shortCode, videoBuffer);
    
    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully'
    });
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