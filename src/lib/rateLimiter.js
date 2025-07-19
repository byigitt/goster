// Simple in-memory rate limiter
const requestCounts = new Map();

/**
 * Rate limiter configuration
 */
const RATE_LIMITS = {
  '/api/links/create': { windowMs: 60000, max: 10 }, // 10 requests per minute
  '/api/upload': { windowMs: 60000, max: 5 }, // 5 uploads per minute
  '/api/video': { windowMs: 60000, max: 30 }, // 30 video requests per minute
  'default': { windowMs: 60000, max: 60 } // 60 requests per minute default
};

/**
 * Get client identifier from request
 */
function getClientId(request) {
  // Use X-Forwarded-For if behind proxy, otherwise use direct IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // For local development or direct connections
  const ip = request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') || 
             'unknown';
  return ip;
}

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 300000) { // 5 minutes
      requestCounts.delete(key);
    }
  }
}, 60000); // Run every minute

/**
 * Rate limiting middleware
 */
export function rateLimit(pathname) {
  // Find matching rate limit config
  let config = RATE_LIMITS.default;
  for (const [path, limits] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      config = limits;
      break;
    }
  }
  
  return async function rateLimitMiddleware(request) {
    const clientId = getClientId(request);
    const key = `${clientId}:${pathname}`;
    const now = Date.now();
    
    // Get or create request data
    let requestData = requestCounts.get(key);
    if (!requestData || now - requestData.resetTime > config.windowMs) {
      requestData = {
        count: 0,
        resetTime: now
      };
      requestCounts.set(key, requestData);
    }
    
    // Check if limit exceeded
    if (requestData.count >= config.max) {
      const retryAfter = Math.ceil((requestData.resetTime + config.windowMs - now) / 1000);
      return {
        error: 'Too many requests',
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(requestData.resetTime + config.windowMs).toISOString()
        }
      };
    }
    
    // Increment counter
    requestData.count++;
    
    // Return headers for client awareness
    return {
      headers: {
        'X-RateLimit-Limit': config.max.toString(),
        'X-RateLimit-Remaining': (config.max - requestData.count).toString(),
        'X-RateLimit-Reset': new Date(requestData.resetTime + config.windowMs).toISOString()
      }
    };
  };
}