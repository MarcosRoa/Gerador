// ============================================
// api/_lib/types.ts
// Tipos compartilhados para a API
// ============================================

// ============================================
// USUÁRIOS
// ============================================

export interface Usuario {
    id: string;
    uid: string;
    nome: string;
    email: string;
    foto_url: string | null;
    creditos: number;
    is_pro: boolean;
    pro_expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UsuarioCreate {
    uid: string;
    nome: string;
    email: string;
    foto_url?: string | null;
    creditos?: number;
    is_pro?: boolean;
}

export interface UsuarioUpdate {
    nome?: string;
    email?: string;
    foto_url?: string | null;
    creditos?: number;
    is_pro?: boolean;
    pro_expires_at?: string | null;
}

// ============================================
// HISTÓRICO DE PALPITES
// ============================================

export interface Jogo {
    numeros: number[];
    confianca?: number;
    mesSorte?: number;
    trevos?: number[];
    timeCoracao?: string;
}

export interface HistoricoPalpite {
    id: string;
    usuario_uid: string;
    loteria: string;
    jogos: Jogo[];
    filtros: string | null;
    extras: string | null;
    meses: number[] | null;
    quantidade_numeros: number | null;
    times: string[] | null;
    data: string;
}

export interface HistoricoPalpiteCreate {
    usuario_uid: string;
    loteria: string;
    jogos: Jogo[];
    filtros?: string | null;
    extras?: string | null;
    meses?: number[] | null;
    quantidade_numeros?: number | null;
    times?: string[] | null;
}

// ============================================
// TRANSAÇÕES
// ============================================

export type TransacaoTipo = 'compra' | 'uso' | 'pro_ativacao';

export interface Transacao {
    id: string;
    usuario_uid: string;
    tipo: TransacaoTipo;
    quantidade: number;
    saldo_apos: number;
    data: string;
}

export interface TransacaoCreate {
    usuario_uid: string;
    tipo: TransacaoTipo;
    quantidade: number;
    saldo_apos: number;
}

// ============================================
// CONFIGURAÇÕES DAS LOTERIAS
// ============================================

export type LotteryId = 
    | 'megasena'
    | 'quina'
    | 'lotofacil'
    | 'lotomania'
    | 'duplasena'
    | 'timemania'
    | 'milionaria'
    | 'loteca'
    | 'diadesorte'
    | 'supersete';

export interface LotteryConfig {
    id: LotteryId;
    nome: string;
    icone: string;
    numeros: number;
    maxNumero: number;
    cor: string;
    temDispersao: boolean;
    dispersaoPadrao: number;
    dispersaoMin: number;
    dispersaoMax: number;
    minNumeros: number;
    maxNumeros: number;
    permiteBolao: boolean;
    jogoSimples: number;
    incluirZero: boolean;
    temMes?: boolean;
    temTime?: boolean;
    temTrevos?: boolean;
    numTrevos?: number;
    maxTrevo?: number;
}

// ============================================
// MODOS DE IA
// ============================================

export type AIMode = 
    | 'ia_especialista'
    | 'aleatorio_inteligente'
    | 'probabilistico'
    | 'aleatorio_puro';

// ============================================
// RESPOSTAS DA API
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface CreditsResponse {
    success: boolean;
    credits: number;
    isPro: boolean;
    userId: string;
    name: string;
    email: string;
    proExpiresAt?: string | null;
}

export interface GenerateGameResponse {
    success: boolean;
    games: number[][];
    creditsSpent: number;
    creditsRemaining: number;
    requestId: string;
}

export interface ProStatusResponse {
    success: boolean;
    isPro: boolean;
    isProFixed: boolean;
    expiresAt: string | null;
    daysLeft: number;
}

export interface HistoryResponse {
    success: boolean;
    history: HistoricoPalpite[];
    count: number;
}
