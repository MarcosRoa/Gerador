// ============================================
// config/env.ts
// Centraliza todas as configurações do sistema
// ============================================

export const env = {
    // Ambiente
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    
    // Supabase
    supabase: {
        url: 'https://fuiaikymhsjdgdhojjhq.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aWFpa3ltaHNqZGdkaG9qamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODI1NTEsImV4cCI6MjA5MzY1ODU1MX0.X9Qa1eJ6ut-QdKEZdjX2Ttm2STgJqOkEdNyohDpH3bk'
    },
    
    // Jogo
    game: {
        pricePerGame: 3,
        maxGamesPerRequest: 20,
        defaultCredits: 5
    },
    
    // PRO
    pro: {
        fixedEmail: 'mresquadriasaluminio@gmail.com',
        fixedCredits: 100,
        defaultDays: 365
    },
    
    // Cache
    cache: {
        defaultTTL: 300,     // 5 minutos
        userTTL: 60,         // 1 minuto
        gamesTTL: 86400      // 24 horas
    },
    
    // Rate Limit
    rateLimit: {
        windowSeconds: 60,
        maxRequests: 30,
        generateWindowSeconds: 10,
        maxGenerateRequests: 5
    }
} as const;

export type Env = typeof env;
export default env;
