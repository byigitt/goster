import TelegramBot from 'node-telegram-bot-api';

// Initialize Telegram bot only if token is available
let bot;
if (process.env.TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
    polling: false,
    filepath: false // Disable deprecated filepath handling
  });
}

/**
 * Upload video to Telegram channel
 * @param {Buffer} videoBuffer - Video buffer to upload
 * @param {string} shortCode - Short code identifier for the video
 * @returns {Promise<{messageId: number, fileId: string}>} - Telegram message ID and file ID
 */
export async function uploadVideoToTelegram(videoBuffer, shortCode) {
  try {
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    
    if (!channelId || !process.env.TELEGRAM_BOT_TOKEN || !bot) {
      throw new Error('Telegram configuration missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID in environment variables.');
    }

    console.log('Uploading to Telegram channel:', channelId);
    console.log('Video buffer size:', videoBuffer.length, 'bytes');

    // Send video to Telegram channel
    // Fix for deprecation warning: explicitly set filename
    const message = await bot.sendVideo(
      channelId, 
      videoBuffer,
      {
        caption: `Recording: ${shortCode}\n#goster_recording`,
        filename: `recording_${shortCode}.webm`
      },
      {
        filename: `recording_${shortCode}.webm`,
        contentType: 'video/webm'
      }
    );

    console.log('Telegram message response:', JSON.stringify(message, null, 2));

    // Handle different response formats
    const videoData = message.video || message.document || message.animation;
    if (!videoData || !videoData.file_id) {
      throw new Error('No file_id in Telegram response');
    }

    return {
      messageId: message.message_id,
      fileId: videoData.file_id
    };
  } catch (error) {
    console.error('Error uploading to Telegram:', error);
    throw new Error(`Failed to upload video to Telegram: ${error.message}`);
  }
}

/**
 * Get video file info from Telegram (internal use only)
 * @param {string} fileId - Telegram file ID
 * @returns {Promise<{file_path: string}>} - File info from Telegram
 */
async function getVideoFileInfo(fileId) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN || !bot) {
      throw new Error('Telegram bot token not configured');
    }

    const file = await bot.getFile(fileId);
    
    // Check if file exists and is accessible
    if (!file || !file.file_path) {
      throw new Error('File not found in Telegram');
    }
    
    return file;
  } catch (error) {
    console.error('Error getting video info from Telegram:', error);
    throw new Error(`Failed to get video info from Telegram: ${error.message}`);
  }
}

/**
 * Stream video from Telegram (server-side only)
 * @param {string} fileId - Telegram file ID
 * @returns {Promise<Response>} - Fetch response with video stream
 */
export async function streamVideoFromTelegram(fileId) {
  try {
    // Get file info without exposing the URL
    const fileInfo = await getVideoFileInfo(fileId);
    
    // Construct URL server-side only
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;
    
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error streaming video from Telegram:', error);
    throw error;
  }
}

/**
 * Delete message from Telegram channel
 * @param {number} messageId - Telegram message ID
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deleteMessageFromTelegram(messageId) {
  try {
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    
    if (!channelId || !process.env.TELEGRAM_BOT_TOKEN || !bot) {
      throw new Error('Telegram configuration missing');
    }

    console.log(`Deleting Telegram message ${messageId} from channel ${channelId}`);
    
    const result = await bot.deleteMessage(channelId, messageId);
    console.log(`Message ${messageId} deleted successfully`);
    
    return result;
  } catch (error) {
    console.error('Error deleting message from Telegram:', error);
    // Don't throw error as message might already be deleted
    return false;
  }
}