// ============================================
// api/_lib/constants.ts
// Constantes compartilhadas para a API
// ============================================

import type { LotteryConfig, LotteryId } from './types.js';

// ============================================
// CONFIGURAÇÕES DAS LOTERIAS
// ============================================

export const LOTERIAS_CONFIG: Record<LotteryId, LotteryConfig> = {
    megasena: {
        id: 'megasena',
        nome: 'Mega-Sena',
        icone: '💰',
        numeros: 6,
        maxNumero: 60,
        cor: '#8b5cf6',
        temDispersao: true,
        dispersaoPadrao: 15,
        dispersaoMin: 5,
        dispersaoMax: 25,
        minNumeros: 6,
        maxNumeros: 20,
        permiteBolao: true,
        jogoSimples: 6,
        incluirZero: false
    },
    quina: {
        id: 'quina',
        nome: 'Quina',
        icone: '🎯',
        numeros: 5,
        maxNumero: 80,
        cor: '#f59e0b',
        temDispersao: true,
        dispersaoPadrao: 10,
        dispersaoMin: 3,
        dispersaoMax: 20,
        minNumeros: 5,
        maxNumeros: 15,
        permiteBolao: true,
        jogoSimples: 5,
        incluirZero: false
    },
    lotofacil: {
        id: 'lotofacil',
        nome: 'Lotofácil',
        icone: '🍀',
        numeros: 15,
        maxNumero: 25,
        cor: '#10b981',
        temDispersao: true,
        dispersaoPadrao: 10,
        dispersaoMin: 3,
        dispersaoMax: 15,
        minNumeros: 15,
        maxNumeros: 20,
        permiteBolao: true,
        jogoSimples: 15,
        incluirZero: false
    },
    lotomania: {
        id: 'lotomania',
        nome: 'Lotomania',
        icone: '🎪',
        numeros: 50,
        maxNumero: 99,
        cor: '#ef4444',
        temDispersao: true,
        dispersaoPadrao: 15,
        dispersaoMin: 5,
        dispersaoMax: 30,
        minNumeros: 50,
        maxNumeros: 50,
        permiteBolao: false,
        jogoSimples: 50,
        incluirZero: true
    },
    duplasena: {
        id: 'duplasena',
        nome: 'Dupla Sena',
        icone: '🎲',
        numeros: 6,
        maxNumero: 50,
        cor: '#06b6d4',
        temDispersao: true,
        dispersaoPadrao: 10,
        dispersaoMin: 3,
        dispersaoMax: 15,
        minNumeros: 6,
        maxNumeros: 15,
        permiteBolao: true,
        jogoSimples: 6,
        incluirZero: false
    },
    timemania: {
        id: 'timemania',
        nome: 'Timemania',
        icone: '⚽',
        numeros: 10,
        maxNumero: 80,
        cor: '#ec4899',
        temDispersao: true,
        dispersaoPadrao: 10,
        dispersaoMin: 3,
        dispersaoMax: 20,
        minNumeros: 10,
        maxNumeros: 10,
        permiteBolao: false,
        jogoSimples: 10,
        incluirZero: false,
        temTime: true
    },
    milionaria: {
        id: 'milionaria',
        nome: '+Milionária',
        icone: '💎',
        numeros: 6,
        maxNumero: 50,
        cor: '#a855f7',
        temDispersao: true,
        dispersaoPadrao: 12,
        dispersaoMin: 5,
        dispersaoMax: 20,
        minNumeros: 6,
        maxNumeros: 12,
        permiteBolao: true,
        jogoSimples: 6,
        incluirZero: false,
        temTrevos: true,
        numTrevos: 2,
        maxTrevo: 6
    },
    loteca: {
        id: 'loteca',
        nome: 'Loteca',
        icone: '⚽',
        numeros: 14,
        maxNumero: 3,
        cor: '#84cc16',
        temDispersao: true,
        dispersaoPadrao: 10,
        dispersaoMin: 3,
        dispersaoMax: 15,
        minNumeros: 14,
        maxNumeros: 14,
        permiteBolao: false,
        jogoSimples: 14,
        incluirZero: true
    },
    diadesorte: {
        id: 'diadesorte',
        nome: 'Dia de Sorte',
        icone: '📅',
        numeros: 7,
        maxNumero: 31,
        cor: '#f97316',
        temDispersao: true,
        dispersaoPadrao: 8,
        dispersaoMin: 3,
        dispersaoMax: 15,
        minNumeros: 7,
        maxNumeros: 15,
        permiteBolao: true,
        jogoSimples: 7,
        incluirZero: false,
        temMes: true
    },
    supersete: {
        id: 'supersete',
        nome: 'Super Sete',
        icone: '🌟',
        numeros: 7,
        maxNumero: 9,
        cor: '#fbbf24',
        temDispersao: true,
        dispersaoPadrao: 7,
        dispersaoMin: 3,
        dispersaoMax: 10,
        minNumeros: 7,
        maxNumeros: 21,
        permiteBolao: true,
        jogoSimples: 7,
        incluirZero: true
    }
};

// ============================================
// CONSTANTES GERAIS
// ============================================

export const JOGO_PRICE = 3;
export const CREDITOS_INICIAIS = 5;
export const PRO_CREDITOS_FIXO = 100;
export const PRO_FIXED_EMAIL = 'mresquadriasaluminio@gmail.com';

export const VALORES_PIX = [12, 24, 36, 48, 60, 120, 180, 240];
