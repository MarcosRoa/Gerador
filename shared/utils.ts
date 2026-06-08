// ============================================
// shared/utils.ts
// Funções utilitárias PURAS (sem efeitos colaterais)
// ============================================

// ============================================
// FORMATAÇÃO
// ============================================

export function formatTwoDigits(num: number): string {
    return String(num).padStart(2, '0');
}

export function formatNumbers(numbers: number[], incluirZero: boolean = false): string {
    return numbers.map(n => formatTwoDigits(n)).join(', ');
}

export function formatMoney(value: number): string {
    return `R$ ${value.toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
}

// ============================================
// VALIDAÇÕES
// ============================================

export function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function isValidPassword(password: string): boolean {
    return password.length >= 6;
}

export function isValidQuantity(quantity: number): boolean {
    return quantity >= 1 && quantity <= 20;
}

// ============================================
// GERAÇÃO DE IDs
// ============================================

export function generateId(): string {
    return crypto.randomUUID();
}

export function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// ============================================
// DELAY E THROTTLE
// ============================================

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ============================================
// MASCARAR CONFIGURAÇÕES (para usuários FREE)
// ============================================

export function maskConfig(texto: string | null | undefined): string {
    if (!texto) return '🔒 Disponível no plano PRO';
    if (typeof texto === 'string' && texto.length > 10) {
        return '🔒 ' + texto.substring(0, 6) + '...';
    }
    return '🔒 Ative o PRO para ver';
}

// ============================================
// GERAÇÃO DE NÚMEROS ALEATÓRIOS
// ============================================

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateUniqueRandomNumbers(
    quantidade: number,
    maxNumero: number,
    incluirZero: boolean = false
): number[] {
    const min = incluirZero ? 0 : 1;
    const numeros = new Set<number>();
    
    while (numeros.size < quantidade) {
        numeros.add(randomInt(min, maxNumero));
    }
    
    return Array.from(numeros).sort((a, b) => a - b);
}
