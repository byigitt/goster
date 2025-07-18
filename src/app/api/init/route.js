import { NextResponse } from 'next/server';
import { startCleanupJob } from '@/lib/cleanup-job';

// Track if job is already started
let jobStarted = false;

export async function GET() {
  if (!jobStarted) {
    try {
      // Only start if Telegram is configured
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID) {
        startCleanupJob();
        jobStarted = true;
        console.log('[Init] Cleanup job started successfully');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Cleanup job initialized' 
        });
      } else {
        console.log('[Init] Telegram not configured, skipping cleanup job');
        return NextResponse.json({ 
          success: true, 
          message: 'Cleanup job skipped - Telegram not configured' 
        });
      }
    } catch (error) {
      console.error('[Init] Error starting cleanup job:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Cleanup job already initialized' 
  });
}