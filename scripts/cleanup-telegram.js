require('dotenv').config({ path: '.env.local' });
const { cleanupExpiredTelegramMessages } = require('../src/lib/cleanup-job.js');

async function runCleanup() {
  console.log('Running manual Telegram cleanup...\n');
  
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
    console.error('❌ Telegram configuration missing in .env.local');
    process.exit(1);
  }
  
  try {
    await cleanupExpiredTelegramMessages();
    console.log('\n✅ Cleanup completed successfully');
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

runCleanup();