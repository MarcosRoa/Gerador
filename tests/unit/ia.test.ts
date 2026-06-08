// ============================================
// tests/unit/ia.test.ts
// Testes unitários para a IA
// ============================================

import { AdvancedLotteryAI } from '../../core/ia/AdvancedLotteryAI.js';

describe('AdvancedLotteryAI', () => {
    const mockDados = [
        [1, 2, 3, 4, 5, 6],
        [10, 20, 30, 40, 50, 60],
        [5, 15, 25, 35, 45, 55],
        [2, 4, 6, 8, 10, 12],
        [7, 14, 21, 28, 35, 42],
        [3, 6, 9, 12, 15, 18],
        [11, 22, 33, 44, 55, 60],
        [8, 16, 24, 32, 40, 48],
        [9, 18, 27, 36, 45, 54],
        [12, 24, 36, 48, 52, 58]
    ];

    describe('constructor', () => {
        test('deve criar instância corretamente', () => {
            const ai = new AdvancedLotteryAI(mockDados, 60, 'Mega-Sena');
            expect(ai).toBeDefined();
            expect(ai.isTrained).toBe(false);
        });

        test('deve detectar loteria com zero', () => {
            const ai = new AdvancedLotteryAI(mockDados, 99, 'Lotomania');
            expect(ai).toBeDefined();
        });
    });

    describe('treinar', () => {
        test('deve treinar com dados suficientes', () => {
            const ai = new AdvancedLotteryAI(mockDados, 60, 'Mega-Sena');
            const result = ai.treinar();
            expect(result).toBe(true);
            expect(ai.isTrained).toBe(true);
            expect(ai.confidence).toBeGreaterThan(0);
        });

        test('não deve treinar com dados insuficientes', () => {
            const ai = new AdvancedLotteryAI([], 60, 'Mega-Sena');
            const result = ai.treinar();
            expect(result).toBe(false);
            expect(ai.isTrained).toBe(false);
        });
    });

    describe('predizerIAEspecialista', () => {
        let ai: AdvancedLotteryAI;

        beforeEach(() => {
            ai = new AdvancedLotteryAI(mockDados, 60, 'Mega-Sena');
            ai.treinar();
        });

        test('deve gerar quantidade correta de números', () => {
            const numeros = ai.predizerIAEspecialista(6, true, 10, 0);
            expect(numeros).toHaveLength(6);
        });

        test('números devem estar ordenados', () => {
            const numeros = ai.predizerIAEspecialista(6, true, 10, 0);
            for (let i = 0; i < numeros.length - 1; i++) {
                expect(numeros[i]).toBeLessThan(numeros[i + 1]);
            }
        });

        test('números devem estar dentro do range', () => {
            const numeros = ai.predizerIAEspecialista(6, true, 10, 0);
            for (const n of numeros) {
                expect(n).toBeGreaterThanOrEqual(1);
                expect(n).toBeLessThanOrEqual(60);
            }
        });

        test('não deve ter números duplicados', () => {
            const numeros = ai.predizerIAEspecialista(6, true, 10, 0);
            const unique = new Set(numeros);
            expect(unique.size).toBe(numeros.length);
        });
    });

    describe('predizerAleatorio', () => {
        let ai: AdvancedLotteryAI;

        beforeEach(() => {
            ai = new AdvancedLotteryAI(mockDados, 60, 'Mega-Sena');
        });

        test('deve gerar números mesmo sem treinamento', () => {
            const numeros = ai.predizerAleatorio(6);
            expect(numeros).toHaveLength(6);
        });

        test('números devem estar dentro do range', () => {
            const numeros = ai.predizerAleatorio(6);
            for (const n of numeros) {
                expect(n).toBeGreaterThanOrEqual(1);
                expect(n).toBeLessThanOrEqual(60);
            }
        });
    });

    describe('calcularConfiancaJogo', () => {
        let ai: AdvancedLotteryAI;

        beforeEach(() => {
            ai = new AdvancedLotteryAI(mockDados, 60, 'Mega-Sena');
            ai.treinar();
        });

        test('deve retornar valor entre 0 e 100', () => {
            const confianca = ai.calcularConfiancaJogo([1, 2, 3, 4, 5, 6]);
            expect(confianca).toBeGreaterThanOrEqual(0);
            expect(confianca).toBeLessThanOrEqual(100);
        });
    });
});
