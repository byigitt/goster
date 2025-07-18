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


export function isLinkExpired(link) {
  if (!link) return true;
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return true;
  return false;
}

export { prisma };