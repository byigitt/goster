import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const links = await prisma.link.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        shortCode: true,
        createdAt: true,
        expiresAt: true,
        isRecordingComplete: true,
        viewCount: true
      }
    });
    
    // Add computed properties
    const linksWithStatus = links.map(link => ({
      ...link,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${link.shortCode}`,
      isExpired: link.expiresAt && new Date(link.expiresAt) < new Date(),
      status: link.isRecordingComplete ? 'completed' : 'waiting'
    }));
    
    return NextResponse.json({
      success: true,
      links: linksWithStatus
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}