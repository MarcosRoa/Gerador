// ============================================
// cache/strategies/index.ts
// Estratégias de cache com TTL
// ============================================

import { cache } from '../redis.js';
import { env } from '../../config/env.js';

export interface CacheStrategy {
    ttl: number;
    keyPrefix: string;
    buildKey(...parts: string[]): string;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    invalidate(...parts: string[]): Promise<void>;
}

class BaseCacheStrategy implements CacheStrategy {
    constructor(
        public ttl: number,
        public keyPrefix: string
    ) {}

    buildKey(...parts: string[]): string {
        return `${this.keyPrefix}:${parts.join(':')}`;
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await cache.get(key);
        return value as T | null;
    }

    async set<T>(key: string, value: T): Promise<void> {
        await cache.set(key, value, this.ttl);
    }

    async invalidate(...parts: string[]): Promise<void> {
        const key = this.buildKey(...parts);
        await cache.del(key);
    }
}

export const UserCacheStrategy = new BaseCacheStrategy(
    env.cache.userTTL,
    'user'
);

export const UserBalanceStrategy = new BaseCacheStrategy(
    env.cache.userTTL,
    'user:balance'
);

export const ProStatusStrategy = new BaseCacheStrategy(
    env.cache.userTTL,
    'user:pro'
);

export const LotteryStatsStrategy = new BaseCacheStrategy(
    env.cache.defaultTTL,
    'lottery:stats'
);

export const GeneratedGamesStrategy = new BaseCacheStrategy(
    env.cache.gamesTTL,
    'games'
);

export async function cached<T>(
    strategy: CacheStrategy,
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh: boolean = false
): Promise<T> {
    if (!forceRefresh) {
        const cached = await strategy.get<T>(key);
        if (cached !== null) return cached;
    }
    const fresh = await fetcher();
    await strategy.set(key, fresh);
    return fresh;
}

export async function invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
        UserCacheStrategy.invalidate(userId),
        UserBalanceStrategy.invalidate(userId),
        ProStatusStrategy.invalidate(userId)
    ]);
}
