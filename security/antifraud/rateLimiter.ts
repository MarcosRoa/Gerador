// ============================================
// security/antifraud/rateLimiter.ts
// Rate limiting para proteção da API
// ============================================

import { env } from '../../config/env.js';

interface RateLimitRecord {
    count: number;
    windowStart: number;
}

export interface RateLimitConfig {
    windowSeconds: number;
    maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
    windowSeconds: env.rateLimit.windowSeconds,
    maxRequests: env.rateLimit.maxRequests
};

export const GENERATE_RATE_LIMIT: RateLimitConfig = {
    windowSeconds: env.rateLimit.generateWindowSeconds,
    maxRequests: env.rateLimit.maxGenerateRequests
};

export const LOGIN_RATE_LIMIT: RateLimitConfig = {
    windowSeconds: 60,
    maxRequests: 5
};

class InMemoryRateLimiter {
    private records: Map<string, RateLimitRecord> = new Map();

    check(key: string, config: RateLimitConfig = DEFAULT_CONFIG): { 
        allowed: boolean; 
        remaining: number; 
        resetTime: number 
    } {
        const now = Date.now();
        const record = this.records.get(key);
        
        if (!record) {
            this.records.set(key, { count: 1, windowStart: now });
            return { 
                allowed: true, 
                remaining: config.maxRequests - 1, 
                resetTime: now + config.windowSeconds * 1000 
            };
        }
        
        const windowElapsed = now - record.windowStart;
        
        if (windowElapsed > config.windowSeconds * 1000) {
            this.records.set(key, { count: 1, windowStart: now });
            return { 
                allowed: true, 
                remaining: config.maxRequests - 1, 
                resetTime: now + config.windowSeconds * 1000 
            };
        }
        
        if (record.count >= config.maxRequests) {
            const resetTime = record.windowStart + config.windowSeconds * 1000;
            return { allowed: false, remaining: 0, resetTime };
        }
        
        record.count++;
        this.records.set(key, record);
        return { 
            allowed: true, 
            remaining: config.maxRequests - record.count, 
            resetTime: record.windowStart + config.windowSeconds * 1000 
        };
    }

    reset(key: string): void {
        this.records.delete(key);
    }

    clear(): void {
        this.records.clear();
    }
}

export const rateLimiter = new InMemoryRateLimiter();

export function getRateLimitKey(req: any): string {
    const uid = req.headers['x-user-id'] || req.query?.uid;
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    return uid ? `user:${uid}` : `ip:${ip}`;
}
