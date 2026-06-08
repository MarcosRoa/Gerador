// ============================================
// core/ia/training.ts
// Gerenciamento de treinamento da IA
// ============================================

import { AdvancedLotteryAI } from './AdvancedLotteryAI.js';

export interface TrainingResult {
    success: boolean;
    confidence: number;
    dataPointsUsed: number;
    error?: string;
}

export interface BacktestResult {
    accuracyIA: number;
    accuracyRandom: number;
    improvement: number;
    totalTests: number;
}

export class IATrainingService {
    private static readonly MIN_DATA_POINTS = 10;

    static train(
        dados: number[][],
        maxNumero: number,
        loteriaNome: string
    ): TrainingResult {
        if (dados.length < this.MIN_DATA_POINTS) {
            return {
                success: false,
                confidence: 0,
                dataPointsUsed: dados.length,
                error: `Dados insuficientes. Mínimo ${this.MIN_DATA_POINTS} concursos, recebido ${dados.length}`
            };
        }

        try {
            const ai = new AdvancedLotteryAI(dados, maxNumero, loteriaNome);
            const success = ai.treinar();
            
            return {
                success,
                confidence: ai.confidence,
                dataPointsUsed: dados.length
            };
        } catch (error) {
            return {
                success: false,
                confidence: 0,
                dataPointsUsed: dados.length,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }

    static backtest(
        dados: number[][],
        maxNumero: number,
        loteriaNome: string,
        windowSize: number = 30
    ): BacktestResult {
        if (dados.length < windowSize + 10) {
            return {
                accuracyIA: 0,
                accuracyRandom: 0,
                improvement: 0,
                totalTests: 0
            };
        }

        let acertosIA = 0;
        let acertosRand = 0;
        let total = 0;
        const numerosPorConcurso = this.getNumerosPorLoteria(loteriaNome);

        for (let i = windowSize; i < dados.length; i++) {
            const hist = dados.slice(i - windowSize, i);
            const teste = new AdvancedLotteryAI(hist, maxNumero, loteriaNome);
            teste.treinar();
            
            const pred = teste.predizerIAEspecialista(numerosPorConcurso, true, 15, i);
            acertosIA += pred.filter(n => dados[i].includes(n)).length;
            
            const rand = this.generateRandomNumbers(numerosPorConcurso, maxNumero);
            acertosRand += rand.filter(n => dados[i].includes(n)).length;
            
            total++;
        }

        const accuracyIA = total > 0 ? (acertosIA / (total * numerosPorConcurso)) * 100 : 0;
        const accuracyRand = total > 0 ? (acertosRand / (total * numerosPorConcurso)) * 100 : 0;
        const improvement = accuracyIA - accuracyRand;

        return {
            accuracyIA: Math.round(accuracyIA * 10) / 10,
            accuracyRandom: Math.round(accuracyRand * 10) / 10,
            improvement: Math.round(improvement * 10) / 10,
            totalTests: total
        };
    }

    private static generateRandomNumbers(quantidade: number, maxNumero: number): number[] {
        const res = new Set<number>();
        while (res.size < quantidade) {
            res.add(Math.floor(Math.random() * (maxNumero + 1)));
        }
        return Array.from(res).sort((a, b) => a - b);
    }

    private static getNumerosPorLoteria(loteriaNome: string): number {
        const mapa: Record<string, number> = {
            'Mega-Sena': 6,
            'megasena': 6,
            'Quina': 5,
            'quina': 5,
            'Lotofácil': 15,
            'lotofacil': 15,
            'Lotomania': 50,
            'lotomania': 50,
            'Dupla Sena': 6,
            'duplasena': 6,
            'Timemania': 7,
            'timemania': 7,
            '+Milionária': 6,
            'milionaria': 6,
            'Loteca': 14,
            'loteca': 14,
            'Dia de Sorte': 7,
            'diadesorte': 7,
            'Super Sete': 7,
            'supersete': 7
        };
        return mapa[loteriaNome] || 6;
    }
}
