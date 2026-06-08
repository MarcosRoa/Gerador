// ============================================
// tests/unit/validators.test.ts
// Testes unitários para validadores
// ============================================

import { 
    isValidEmail, 
    isValidPassword, 
    isValidQuantity,
    formatNumbers,
    formatMoney,
    maskConfig
} from '../../shared/utils.js';

describe('Validators', () => {
    describe('isValidEmail', () => {
        test('deve aceitar email válido', () => {
            expect(isValidEmail('usuario@exemplo.com')).toBe(true);
            expect(isValidEmail('nome.sobrenome@empresa.com.br')).toBe(true);
            expect(isValidEmail('user+tag@dominio.com')).toBe(true);
        });

        test('deve rejeitar email inválido', () => {
            expect(isValidEmail('usuario@')).toBe(false);
            expect(isValidEmail('usuario')).toBe(false);
            expect(isValidEmail('@exemplo.com')).toBe(false);
            expect(isValidEmail('usuario@exemplo')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });
    });

    describe('isValidPassword', () => {
        test('deve aceitar senha com 6+ caracteres', () => {
            expect(isValidPassword('123456')).toBe(true);
            expect(isValidPassword('senha123')).toBe(true);
            expect(isValidPassword('1234567890')).toBe(true);
        });

        test('deve rejeitar senha muito curta', () => {
            expect(isValidPassword('12345')).toBe(false);
            expect(isValidPassword('')).toBe(false);
        });
    });

    describe('isValidQuantity', () => {
        test('deve aceitar quantidade entre 1 e 20', () => {
            expect(isValidQuantity(1)).toBe(true);
            expect(isValidQuantity(10)).toBe(true);
            expect(isValidQuantity(20)).toBe(true);
        });

        test('deve rejeitar quantidade fora do range', () => {
            expect(isValidQuantity(0)).toBe(false);
            expect(isValidQuantity(21)).toBe(false);
            expect(isValidQuantity(-1)).toBe(false);
        });
    });

    describe('formatNumbers', () => {
        test('deve formatar números com 2 dígitos', () => {
            expect(formatNumbers([1, 2, 3])).toBe('01, 02, 03');
            expect(formatNumbers([10, 20, 30])).toBe('10, 20, 30');
        });

        test('deve incluir zero quando solicitado', () => {
            expect(formatNumbers([0, 1], true)).toBe('00, 01');
        });
    });

    describe('formatMoney', () => {
        test('deve formatar valores em reais', () => {
            expect(formatMoney(10)).toBe('R$ 10');
            expect(formatMoney(10.5)).toBe('R$ 10.5');
            expect(formatMoney(1000)).toBe('R$ 1000');
        });
    });

    describe('maskConfig', () => {
        test('deve mascarar texto longo', () => {
            const longText = 'Configuração muito longa para ser exibida';
            const masked = maskConfig(longText);
            expect(masked).toContain('🔒');
            expect(masked).not.toBe(longText);
        });

        test('deve retornar mensagem padrão para null', () => {
            expect(maskConfig(null)).toBe('🔒 Disponível no plano PRO');
            expect(maskConfig(undefined)).toBe('🔒 Disponível no plano PRO');
        });

        test('deve retornar mensagem padrão para texto curto', () => {
            expect(maskConfig('curto')).toBe('🔒 Ative o PRO para ver');
        });
    });
});
