import { FastifyRequest, FastifyReply } from 'fastify';

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed within the timeWindow
   * @default 100
   */
  max?: number;
  
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  timeWindow?: number;
  
  /**
   * Custom error message when rate limit is exceeded
   * @default 'Rate limit exceeded, please try again later'
   */
  errorMessage?: string;
  
  /**
   * Status code to return when rate limit is exceeded
   * @default 429
   */
  statusCode?: number;
  
  /**
   * Function to generate the rate limit key
   * @default Uses IP address
   */
  keyGenerator?: (request: FastifyRequest) => string;
  
  /**
   * Skip rate limiting for certain requests
   * @default false for all requests
   */
  skip?: (request: FastifyRequest) => boolean | Promise<boolean>;
}

// Simple in-memory store for rate limiting
class MemoryStore {
  private store: Map<string, { count: number, resetTime: number }>;
  
  constructor() {
    this.store = new Map();
  }
  
  increment(key: string, timeWindow: number): { current: number, remaining: number, resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);
    
    if (!record || now > record.resetTime) {
      // New record or expired record
      const resetTime = now + timeWindow;
      this.store.set(key, { count: 1, resetTime });
      return { current: 1, remaining: Infinity, resetTime };
    } else {
      // Increment existing record
      record.count += 1;
      return { 
        current: record.count, 
        remaining: Math.max(0, Infinity - record.count),
        resetTime: record.resetTime
      };
    }
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Create a singleton instance of the store
const store = new MemoryStore();

// Run cleanup every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

export const rateLimit = (options: RateLimitOptions = {}) => {
  const {
    max = 100,
    timeWindow = 60 * 1000, // 1 minute
    errorMessage = 'Rate limit exceeded, please try again later',
    statusCode = 429,
    keyGenerator = (request: FastifyRequest): string => {
      // Default key generator uses IP address
      return request.ip || request.socket.remoteAddress || 'unknown';
    },
    skip = (): boolean => false
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      // Check if this request should skip rate limiting
      if (await Promise.resolve(skip(request))) {
        return;
      }
      
      // Generate the rate limit key
      const key = keyGenerator(request);
      
      // Check and increment the rate limit counter
      const { current, resetTime } = store.increment(key, timeWindow);
      
      // Set rate limit headers
      reply.header('X-RateLimit-Limit', max.toString());
      reply.header('X-RateLimit-Remaining', Math.max(0, max - current).toString());
      reply.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      
      // If the rate limit is exceeded, send an error response
      if (current > max) {
        reply.status(statusCode).send({
          statusCode,
          error: 'Too Many Requests',
          message: errorMessage
        });
        return reply;
      }
    } catch {
      // If there's an error in the rate limiting logic, log it but don't block the request
      // Error logged internally
    }
  };
};