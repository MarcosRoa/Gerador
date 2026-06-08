// ============================================
// shared/constants.ts
// Constantes compartilhadas
// ============================================

// ============================================
// MODOS DE IA
// ============================================

export const AI_MODES = {
    ia_especialista: {
        label: '🎓 IA Especialista',
        description: 'Usa algoritmos avançados de padrões e dispersão'
    },
    aleatorio_inteligente: {
        label: '🎲 Aleatório Inteligente',
        description: 'Baseado em frequência dos números'
    },
    probabilistico: {
        label: '📊 Probabilístico',
        description: 'Calcula probabilidades reais'
    },
    aleatorio_puro: {
        label: '🎯 Aleatório Puro',
        description: 'Geração completamente aleatória'
    }
} as const;

export type AIMode = keyof typeof AI_MODES;

// ============================================
// MENSAGENS DO SISTEMA
// ============================================

export const MESSAGES = {
    // Sucesso
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    LOGOUT_SUCCESS: 'Logout realizado!',
    GAMES_GENERATED: (qtd: number) => `${qtd} jogo(s) gerado(s)!`,
    CREDITS_ADDED: (valor: number) => `R$ ${valor} adicionados!`,
    PRO_ACTIVATED: '⭐ Plano PRO ativado com sucesso!',
    
    // Erro
    INSUFFICIENT_CREDITS: (necessario: number, disponivel: number) => 
        `Saldo insuficiente! Necessário R$ ${necessario}, disponível R$ ${disponivel}`,
    LOGIN_REQUIRED: 'Faça login para continuar',
    INSUFFICIENT_DATA: (min: number, atual: number) => 
        `Dados insuficientes! Mínimo ${min} concursos, atualmente ${atual}`,
    
    // Aviso
    PRO_ONLY: '⭐ Recurso exclusivo para assinantes PRO',
    TRAIN_IA_FIRST: 'Treine a IA primeiro!'
} as const;

// ============================================
// CORES DAS LOTERIAS
// ============================================

export const LOTTERY_COLORS: Record<string, string> = {
    megasena: '#8b5cf6',
    quina: '#f59e0b',
    lotofacil: '#10b981',
    lotomania: '#ef4444',
    duplasena: '#06b6d4',
    timemania: '#ec4899',
    milionaria: '#a855f7',
    loteca: '#84cc16',
    diadesorte: '#f97316',
    supersete: '#fbbf24'
};

// ============================================
// CACHE KEYS
// ============================================

export const CACHE_KEYS = {
    USER: (uid: string) => `user:${uid}`,
    USER_BALANCE: (uid: string) => `user:balance:${uid}`,
    USER_PRO: (uid: string) => `user:pro:${uid}`,
    LOTTERY_STATS: (lottery: string) => `stats:${lottery}`,
    GENERATED_GAMES: (hash: string) => `games:${hash}`
} as const;
