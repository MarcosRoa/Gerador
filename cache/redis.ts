// ============================================
// cache/redis.ts
// Cliente Redis com fallback para memória
// ============================================

import { env } from '../config/env.js';

// Cache em memória (fallback)
class MemoryCache {
    private store = new Map<string, { value: any; expiresAt: number }>();

    async get(key: string): Promise<any> {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async set(key: string, value: any, ttlSeconds: number): Promise<void> {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        });
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        const item = this.store.get(key);
        if (!item) return false;
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return false;
        }
        return true;
    }

    async flush(): Promise<void> {
        this.store.clear();
    }
}

class RedisCache {
    private memoryCache = new MemoryCache();
    private useRedis = false; // Redis desabilitado por enquanto

    async get(key: string): Promise<any> {
        return this.memoryCache.get(key);
    }

    async set(key: string, value: any, ttlSeconds: number = env.cache.defaultTTL): Promise<void> {
        await this.memoryCache.set(key, value, ttlSeconds);
    }

    async del(key: string): Promise<void> {
        await this.memoryCache.del(key);
    }

    async exists(key: string): Promise<boolean> {
        return this.memoryCache.exists(key);
    }

    async flush(): Promise<void> {
        await this.memoryCache.flush();
    }
}

export const cache = new RedisCache();
export default cache;
