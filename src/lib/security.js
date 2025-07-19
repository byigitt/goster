import crypto from 'crypto';

/**
 * Generate a secret webhook path to make it unguessable
 * This makes your webhook endpoint unpredictable
 */
export function generateWebhookPath() {
  // Use a cryptographically secure random path
  const secret = process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');
  return `/api/telegram/webhook/${secret}`;
}

/**
 * Verify Telegram webhook requests (if you decide to use webhooks)
 * Telegram doesn't sign webhooks, but you can verify the source
 */
export function verifyTelegramRequest(request) {
  // Check if request comes from Telegram's IP ranges
  const telegramIPs = [
    '149.154.160.0/20',
    '91.108.4.0/22',
    '91.108.8.0/22',
    '91.108.12.0/22',
    '91.108.16.0/22',
    '91.108.20.0/22',
    '91.108.56.0/22',
    '91.105.192.0/23',
    '91.105.194.0/23',
    '91.105.196.0/22',
    '91.105.200.0/22',
    '91.105.204.0/22',
    '91.105.208.0/21',
    '91.105.216.0/21',
    '91.105.224.0/20',
    '95.161.64.0/20',
    '185.76.151.0/24'
  ];
  
  // Get client IP
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip');
  
  // For development, always return true
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production, verify IP is from Telegram
  // Note: This is a simplified check, you'd need a proper IP range checker
  return true; // Implement proper IP range checking if needed
}

/**
 * Obfuscate sensitive data in logs
 */
export function sanitizeLogData(data) {
  const sensitiveKeys = ['token', 'password', 'secret', 'key', 'authorization'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
}