// ============================================
// config/index.ts
// Centralização de todas as configurações
// ============================================

// Exportar todas as configurações de um único lugar
export { env, default as envDefault } from './env.js';
export { appConfig } from './app.config.js';
export { getSupabaseAdmin, getSupabaseAnon, databaseConfig } from './database.config.js';
export { redisConfig, CacheKeys, TTL, isRedisAvailable } from './redis.config.js';

// ========================================
// CONFIGURAÇÃO UNIFICADA
// ========================================

import { env } from './env.js';
import { appConfig } from './app.config.js';
import { databaseConfig } from './database.config.js';
import { redisConfig } from './redis.config.js';

export const config = {
    app: appConfig,
    env: env,
    database: databaseConfig,
    cache: redisConfig,
    
    // Helper para saber se está em desenvolvimento
    isDev: env.isDev,
    isProd: env.isProd,
    
    // Helper para saber se uma feature está habilitada
    isFeatureEnabled: (feature: keyof typeof appConfig.features): boolean => {
        return appConfig.features[feature];
    }
} as const;

export type Config = typeof config;
export default config;
