import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createLink } from '@/lib/db';

export async function POST(request) {
  try {
    const shortCode = nanoid(8);
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const link = await createLink(shortCode, expiresAt);
    
    return NextResponse.json({
      success: true,
      shortCode,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${shortCode}`
    });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}