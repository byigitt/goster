import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createLink } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(request) {
  // Apply rate limiting
  const rateLimiter = rateLimit('/api/links/create');
  const rateLimitResult = await rateLimiter(request);
  
  if (rateLimitResult.error) {
    return NextResponse.json(
      { success: false, error: rateLimitResult.error },
      { status: rateLimitResult.status, headers: rateLimitResult.headers }
    );
  }
  
  try {
    // Increased length for better entropy (62^12 possible combinations)
    const shortCode = nanoid(12);
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const link = await createLink(shortCode, expiresAt);
    
    return NextResponse.json({
      success: true,
      shortCode,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${shortCode}`
    }, { headers: rateLimitResult.headers });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}