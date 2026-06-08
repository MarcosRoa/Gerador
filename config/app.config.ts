// ============================================
// config/app.config.ts
// Configurações da aplicação
// ============================================

export const appConfig = {
    // ========================================
    // Informações da aplicação
    // ========================================
    name: 'Loterias IA',
    version: '7.0.0',
    environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
    
    // ========================================
    // URLs
    // ========================================
    url: process.env.APP_URL || 'https://loterias-ia.vercel.app',
    apiUrl: process.env.API_URL || '/api',
    
    // ========================================
    // Features
    // ========================================
    features: {
        enablePix: process.env.ENABLE_PIX === 'true',
        enablePro: true,
        enableBolao: true,
        enableExportPDF: true,
        enableBacktest: true,
        enableStatistics: true
    },
    
    // ========================================
    // Limites
    // ========================================
    limits: {
        maxGamesPerRequest: 20,
        minGamesPerRequest: 1,
        maxExtraNumbers: 50,
        maxHistoryDays: 90,
        maxHistoryItems: 100
    },
    
    // ========================================
    // Preços
    // ========================================
    pricing: {
        gamePrice: 3,
        proPrice: 19.90,
        proDays: 30,
        proFreeCredits: 100
    },
    
    // ========================================
    // Suporte
    // ========================================
    support: {
        email: 'suporte@loteriasia.com',
        whatsapp: '(11) 99999-9999',
        hours: 'Segunda a Sexta: 9h às 18h'
    }
} as const;

export type AppConfig = typeof appConfig;
