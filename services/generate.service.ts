// ============================================
// services/generate.service.ts
// Serviço de geração de jogos
// ============================================

import { AdvancedLotteryAI } from '../core/ia/AdvancedLotteryAI.js';
import type { UserRepository } from '../repositories/user.repository.js';
import type { GameRepository } from '../repositories/game.repository.js';
import type { TransactionRepository } from '../repositories/transaction.repository.js';
import { Credits } from '../core/value-objects/Credits.js';
import { Game } from '../core/entities/Game.js';
import { env } from '../config/env.js';
import type { LotteryId, AIMode } from '../core/entities/Game.js';

export interface GenerateGameInput {
    userId: string;
    lottery: LotteryId;
    quantity: number;
    mode: AIMode;
    extraNumbers?: number;
    filters?: Record<string, any>;
    clientIp?: string;
    userAgent?: string;
    requestHash?: string;
}

export interface GenerateGameOutput {
    games: number[][];
    creditsSpent: number;
    creditsRemaining: number;
    confidence: number;
}

const LOTTERY_CONFIGS: Record<LotteryId, { maxNumero: number; numerosPadrao: number; incluiZero: boolean }> = {
    megasena: { maxNumero: 60, numerosPadrao: 6, incluiZero: false },
    quina: { maxNumero: 80, numerosPadrao: 5, incluiZero: false },
    lotofacil: { maxNumero: 25, numerosPadrao: 15, incluiZero: false },
    lotomania: { maxNumero: 99, numerosPadrao: 50, incluiZero: true },
    duplasena: { maxNumero: 50, numerosPadrao: 6, incluiZero: false },
    timemania: { maxNumero: 80, numerosPadrao: 10, incluiZero: false },
    milionaria: { maxNumero: 50, numerosPadrao: 6, incluiZero: false },
    loteca: { maxNumero: 3, numerosPadrao: 14, incluiZero: true },
    diadesorte: { maxNumero: 31, numerosPadrao: 7, incluiZero: false },
    supersete: { maxNumero: 9, numerosPadrao: 7, incluiZero: true }
};

export class GenerateGameService {
    constructor(
        private userRepository: UserRepository,
        private gameRepository: GameRepository,
        private transactionRepository: TransactionRepository
    ) {}

    async execute(input: GenerateGameInput): Promise<GenerateGameOutput> {
        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const totalCost = input.quantity * env.game.pricePerGame;
        const credits = Credits.create(user.credits);

        if (!credits.canAfford(totalCost)) {
            throw new Error(`Saldo insuficiente. Necessário R$ ${totalCost}, disponível R$ ${credits.getValue()}`);
        }

        const lotteryData = await this.loadLotteryData(input.lottery);
        const config = LOTTERY_CONFIGS[input.lottery];

        if (lotteryData.length === 0) {
            throw new Error(`Não há dados históricos para ${input.lottery}`);
        }

        const ai = new AdvancedLotteryAI(lotteryData, config.maxNumero, input.lottery);
        ai.treinar();

        const jogosGerados: number[][] = [];
        const numerosPorJogo = input.extraNumbers || config.numerosPadrao;

        for (let i = 0; i < input.quantity; i++) {
            let numeros: number[];
            
            if (input.mode === 'ia_especialista') {
                numeros = ai.predizerIAEspecialista(numerosPorJogo, true, 15, i);
            } else {
                numeros = this.generateRandom(numerosPorJogo, config.maxNumero, config.incluiZero);
            }
            
            jogosGerados.push(numeros.sort((a, b) => a - b));
        }

        const confiancaMedia = jogosGerados.reduce((acc, jogo) => 
            acc + ai.calcularConfiancaJogo(jogo), 0) / jogosGerados.length;

        const newCredits = credits.subtract(totalCost);
        await this.userRepository.updateBalance(input.userId, newCredits.getValue());

        await this.transactionRepository.save({
            userId: input.userId,
            type: 'uso',
            amount: -totalCost,
            balanceBefore: credits.getValue(),
            balanceAfter: newCredits.getValue(),
            description: `${input.quantity} jogo(s) de ${input.lottery}`,
            referenceId: input.requestHash
        });

        const game = Game.create({
            userId: input.userId,
            lottery: input.lottery,
            numbers: jogosGerados,
            mode: input.mode,
            creditsCost: totalCost,
            filters: input.filters || {},
            metadata: { extraNumbers: input.extraNumbers },
            requestHash: input.requestHash || `gen_${Date.now()}`,
            clientIp: input.clientIp || null,
            userAgent: input.userAgent || null
        });

        await this.gameRepository.save(game);

        return {
            games: jogosGerados,
            creditsSpent: totalCost,
            creditsRemaining: newCredits.getValue(),
            confidence: Math.round(confiancaMedia)
        };
    }

    private async loadLotteryData(lottery: LotteryId): Promise<number[][]> {
        try {
            const response = await fetch(`/csv/${lottery}.csv`);
            if (!response.ok) return [];
            
            const text = await response.text();
            const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
            const sep = lines[0]?.includes(';') ? ';' : ',';
            const dados: number[][] = [];
            
            for (const line of lines) {
                const cols = line.split(sep);
                let startIdx = 0;
                
                for (let i = 0; i < cols.length; i++) {
                    if (/^\d{2}\/\d{2}\/\d{4}/.test(cols[i].trim())) {
                        startIdx = i + 1;
                        break;
                    }
                }
                
                const numeros: number[] = [];
                for (let i = startIdx; i < cols.length; i++) {
                    const num = parseInt(cols[i].trim());
                    if (!isNaN(num)) numeros.push(num);
                }
                
                if (numeros.length > 0) {
                    dados.push(numeros);
                }
            }
            
            return dados;
        } catch (error) {
            console.error(`Erro ao carregar ${lottery}:`, error);
            return [];
        }
    }

    private generateRandom(quantidade: number, maxNumero: number, incluiZero: boolean): number[] {
        const min = incluiZero ? 0 : 1;
        const numerosSet = new Set<number>();
        
        while (numerosSet.size < quantidade) {
            const n = Math.floor(Math.random() * (maxNumero - min + 1)) + min;
            numerosSet.add(n);
        }
        
        return Array.from(numerosSet).sort((a, b) => a - b);
    }
}
