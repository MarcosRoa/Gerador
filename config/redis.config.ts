// ============================================
// config/redis.config.ts
// Configurações do Redis (cache)
// ============================================

import { env } from './env.js';

// ========================================
// TIPOS DE TTL
// ========================================

export const TTL = {
    SHORT: 60,        // 1 minuto
    MEDIUM: 300,      // 5 minutos
    LONG: 3600,       // 1 hora
    VERY_LONG: 86400  // 24 horas
} as const;

// ========================================
// CHAVES DE CACHE
// ========================================

export const CacheKeys = {
    // Usuários
    USER: (uid: string) => `user:${uid}`,
    USER_BALANCE: (uid: string) => `user:balance:${uid}`,
    USER_PRO: (uid: string) => `user:pro:${uid}`,
    
    // Loterias
    LOTTERY_STATS: (lottery: string, period: string) => `lottery:stats:${lottery}:${period}`,
    LOTTERY_DATA: (lottery: string) => `lottery:data:${lottery}`,
    
    // Jogos
    GENERATED_GAMES: (hash: string) => `games:${hash}`,
    
    // Rate Limit
    RATE_LIMIT: (identifier: string) => `rate:${identifier}`,
    
    // Sessão
    SESSION: (sessionId: string) => `session:${sessionId}`
};

// ========================================
// CONFIGURAÇÃO DO REDIS
// ========================================

export const redisConfig = {
    // URL de conexão
    url: env.redis?.url || process.env.REDIS_URL || '',
    
    // TTL padrão
    defaultTTL: TTL.MEDIUM,
    
    // Prefixo para todas as chaves
    keyPrefix: 'loterias:',
    
    // Configurações de conexão
    connection: {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 10000,
        disconnectTimeout: 2000
    },
    
    // Fallback para memória quando Redis não disponível
    fallbackToMemory: true
} as const;

// ========================================
// VERIFICAR SE REDIS ESTÁ DISPONÍVEL
// ========================================

export function isRedisAvailable(): boolean {
    return !!redisConfig.url && redisConfig.url.length > 0;
}

export default { redisConfig, CacheKeys, TTL, isRedisAvailable };
