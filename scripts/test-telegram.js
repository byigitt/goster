const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config({ path: '.env.local' });

async function testTelegramConnection() {
  console.log('Testing Telegram configuration...\n');
  
  // Check environment variables
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env.local');
    return;
  }
  
  if (!process.env.TELEGRAM_CHANNEL_ID) {
    console.error('❌ TELEGRAM_CHANNEL_ID is not set in .env.local');
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log(`Channel ID: ${process.env.TELEGRAM_CHANNEL_ID}`);
  console.log(`Bot Token: ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
  
  try {
    // Initialize bot
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    
    // Test bot info
    const botInfo = await bot.getMe();
    console.log(`\n✅ Bot connected successfully!`);
    console.log(`Bot username: @${botInfo.username}`);
    console.log(`Bot name: ${botInfo.first_name}`);
    
    // Test sending a message
    console.log('\nTesting message send to channel...');
    const testMessage = await bot.sendMessage(
      process.env.TELEGRAM_CHANNEL_ID,
      '✅ Test message from göster - Telegram integration working!'
    );
    
    console.log('✅ Message sent successfully!');
    console.log(`Message ID: ${testMessage.message_id}`);
    
    // Test sending a small video (create a test buffer)
    console.log('\nTesting video upload...');
    const testVideoBuffer = Buffer.from('test video content');
    
    try {
      const videoMessage = await bot.sendDocument(
        process.env.TELEGRAM_CHANNEL_ID,
        testVideoBuffer,
        {
          caption: 'Test video upload from göster',
          filename: 'test.webm'
        },
        {
          filename: 'test.webm',
          contentType: 'video/webm'
        }
      );
      
      console.log('✅ Video upload test successful!');
      console.log(`Document file_id: ${videoMessage.document.file_id}`);
    } catch (videoError) {
      console.log('⚠️  Video upload test failed (this is normal for test data)');
      console.log(`Error: ${videoError.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. Your bot token is correct');
    console.error('2. Your channel ID is correct (use @channelname for public or numeric ID for private)');
    console.error('3. Your bot is added as an admin to the channel');
    console.error('4. Your bot has permission to post messages in the channel');
  }
}

testTelegramConnection();