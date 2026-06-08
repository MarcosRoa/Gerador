// ============================================
// tests/unit/credits.test.ts
// Testes unitários para o Value Object Credits
// ============================================

import { Credits } from '../../core/value-objects/Credits.js';

describe('Credits', () => {
    describe('create', () => {
        test('deve criar créditos com valor positivo', () => {
            const credits = Credits.create(100);
            expect(credits.getValue()).toBe(100);
        });

        test('deve criar créditos com valor zero', () => {
            const credits = Credits.create(0);
            expect(credits.getValue()).toBe(0);
            expect(credits.isZero()).toBe(true);
        });

        test('deve lançar erro para valor negativo', () => {
            expect(() => Credits.create(-10)).toThrow('Credits cannot be negative');
        });

        test('deve lançar erro para valor não inteiro', () => {
            expect(() => Credits.create(10.5)).toThrow('Credits must be an integer');
        });
    });

    describe('zero', () => {
        test('deve criar créditos com valor zero', () => {
            const credits = Credits.zero();
            expect(credits.getValue()).toBe(0);
            expect(credits.isZero()).toBe(true);
        });
    });

    describe('add', () => {
        test('deve adicionar valor positivo', () => {
            const credits = Credits.create(50);
            const result = credits.add(30);
            expect(result.getValue()).toBe(80);
        });

        test('deve lançar erro ao adicionar valor negativo', () => {
            const credits = Credits.create(50);
            expect(() => credits.add(-10)).toThrow('Cannot add negative amount');
        });
    });

    describe('subtract', () => {
        test('deve subtrair valor positivo', () => {
            const credits = Credits.create(50);
            const result = credits.subtract(30);
            expect(result.getValue()).toBe(20);
        });

        test('deve lançar erro ao subtrair valor negativo', () => {
            const credits = Credits.create(50);
            expect(() => credits.subtract(-10)).toThrow('Cannot subtract negative amount');
        });

        test('deve lançar erro quando saldo insuficiente', () => {
            const credits = Credits.create(10);
            expect(() => credits.subtract(20)).toThrow('Insufficient credits: 10 < 20');
        });
    });

    describe('canAfford', () => {
        test('deve retornar true quando saldo suficiente', () => {
            const credits = Credits.create(100);
            expect(credits.canAfford(50)).toBe(true);
        });

        test('deve retornar false quando saldo insuficiente', () => {
            const credits = Credits.create(10);
            expect(credits.canAfford(50)).toBe(false);
        });
    });

    describe('equals', () => {
        test('deve retornar true para valores iguais', () => {
            const credits1 = Credits.create(100);
            const credits2 = Credits.create(100);
            expect(credits1.equals(credits2)).toBe(true);
        });

        test('deve retornar false para valores diferentes', () => {
            const credits1 = Credits.create(100);
            const credits2 = Credits.create(200);
            expect(credits1.equals(credits2)).toBe(false);
        });
    });

    describe('isPositive', () => {
        test('deve retornar true para valor positivo', () => {
            const credits = Credits.create(50);
            expect(credits.isPositive()).toBe(true);
        });

        test('deve retornar false para valor zero', () => {
            const credits = Credits.create(0);
            expect(credits.isPositive()).toBe(false);
        });
    });

    describe('toString', () => {
        test('deve formatar corretamente', () => {
            const credits = Credits.create(50);
            expect(credits.toString()).toBe('R$ 50');
        });
    });
});
