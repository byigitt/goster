import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function createLink(shortCode, expiresAt = null) {
  try {
    const link = await prisma.link.create({
      data: {
        shortCode,
        expiresAt,
      },
    });
    return link;
  } catch (error) {
    console.error('Error creating link:', error);
    throw error;
  }
}

export async function getLink(shortCode) {
  try {
    const link = await prisma.link.findUnique({
      where: {
        shortCode,
      },
    });
    return link;
  } catch (error) {
    console.error('Error getting link:', error);
    throw error;
  }
}

export async function updateLinkWithVideo(shortCode, videoData) {
  try {
    const link = await prisma.link.update({
      where: {
        shortCode,
      },
      data: {
        videoData,
        isRecordingComplete: true,
      },
    });
    return link;
  } catch (error) {
    console.error('Error updating link with video:', error);
    throw error;
  }
}

export async function updateLinkWithTelegramData(shortCode, telegramFileId, telegramMessageId) {
  try {
    const link = await prisma.link.update({
      where: {
        shortCode,
      },
      data: {
        telegramFileId,
        telegramMessageId,
        isRecordingComplete: true,
        videoData: null, // Clear old video data to save space
      },
    });
    return link;
  } catch (error) {
    console.error('Error updating link with Telegram data:', error);
    throw error;
  }
}


export function isLinkExpired(link) {
  if (!link) return true;
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return true;
  return false;
}

export async function getExpiredLinksWithTelegram() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const expiredLinks = await prisma.link.findMany({
      where: {
        OR: [
          // Links with explicit expiry date that have passed
          {
            expiresAt: {
              lt: new Date()
            }
          },
          // Links older than 24 hours
          {
            createdAt: {
              lt: twentyFourHoursAgo
            }
          }
        ],
        // Only get links that have Telegram data
        telegramMessageId: {
          not: null
        }
      },
      select: {
        id: true,
        shortCode: true,
        telegramMessageId: true,
        telegramFileId: true,
        createdAt: true,
        expiresAt: true
      }
    });
    
    return expiredLinks;
  } catch (error) {
    console.error('Error getting expired links:', error);
    return [];
  }
}

export async function markLinkAsCleanedUp(id) {
  try {
    await prisma.link.update({
      where: { id },
      data: {
        telegramMessageId: null,
        telegramFileId: null
      }
    });
  } catch (error) {
    console.error('Error marking link as cleaned up:', error);
  }
}

export { prisma };