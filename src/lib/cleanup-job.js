import cron from 'node-cron';
import { getExpiredLinksWithTelegram, markLinkAsCleanedUp } from './db.js';
import { deleteMessageFromTelegram } from './telegram.js';

/**
 * Clean up expired Telegram messages
 */
async function cleanupExpiredTelegramMessages() {
  console.log('[Cleanup Job] Starting Telegram cleanup process...');
  
  try {
    // Get all expired links with Telegram data
    const expiredLinks = await getExpiredLinksWithTelegram();
    
    if (expiredLinks.length === 0) {
      console.log('[Cleanup Job] No expired Telegram messages to clean up');
      return;
    }
    
    console.log(`[Cleanup Job] Found ${expiredLinks.length} expired links to clean up`);
    
    // Process each expired link
    for (const link of expiredLinks) {
      try {
        console.log(`[Cleanup Job] Processing link ${link.shortCode} (created: ${link.createdAt})`);
        
        // Delete the Telegram message
        if (link.telegramMessageId) {
          const deleted = await deleteMessageFromTelegram(link.telegramMessageId);
          if (deleted) {
            console.log(`[Cleanup Job] Deleted Telegram message ${link.telegramMessageId} for link ${link.shortCode}`);
          }
        }
        
        // Mark the link as cleaned up in the database
        await markLinkAsCleanedUp(link.id);
        console.log(`[Cleanup Job] Marked link ${link.shortCode} as cleaned up`);
        
      } catch (error) {
        console.error(`[Cleanup Job] Error processing link ${link.shortCode}:`, error);
      }
    }
    
    console.log('[Cleanup Job] Cleanup process completed');
    
  } catch (error) {
    console.error('[Cleanup Job] Error during cleanup:', error);
  }
}

// Schedule the cleanup job to run every hour
export function startCleanupJob() {
  // Run cleanup immediately on startup
  cleanupExpiredTelegramMessages();
  
  // Then run every hour
  cron.schedule('0 * * * *', () => {
    cleanupExpiredTelegramMessages();
  });
  
  console.log('[Cleanup Job] Scheduled to run every hour');
}

// Also export the cleanup function for manual triggering
export { cleanupExpiredTelegramMessages };