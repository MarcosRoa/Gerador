// ============================================
// services/credits.service.ts
// Serviço de gerenciamento de créditos
// ============================================

import { Credits } from '../core/value-objects/Credits.js';
import type { UserRepository } from '../repositories/user.repository.js';
import type { TransactionRepository } from '../repositories/transaction.repository.js';
import { env } from '../config/env.js';

export interface DebitCreditsInput {
    userId: string;
    amount: number;
    description: string;
    referenceId?: string;
}

export interface CreditCreditsInput {
    userId: string;
    amount: number;
    type: 'compra' | 'reembolso';
    description: string;
    referenceId?: string;
}

export class CreditsService {
    constructor(
        private userRepository: UserRepository,
        private transactionRepository: TransactionRepository
    ) {}

    async getBalance(userId: string): Promise<number> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user.credits;
    }

    async debit(input: DebitCreditsInput): Promise<{ success: boolean; newBalance: number }> {
        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            throw new Error('User not found');
        }

        const credits = Credits.create(user.credits);
        
        if (!credits.canAfford(input.amount)) {
            throw new Error(`Insufficient credits. Need ${input.amount}, have ${credits.getValue()}`);
        }

        const newCredits = credits.subtract(input.amount);
        
        await this.userRepository.updateBalance(input.userId, newCredits.getValue());
        
        await this.transactionRepository.save({
            userId: input.userId,
            type: 'uso',
            amount: -input.amount,
            balanceBefore: credits.getValue(),
            balanceAfter: newCredits.getValue(),
            description: input.description,
            referenceId: input.referenceId
        });

        return {
            success: true,
            newBalance: newCredits.getValue()
        };
    }

    async credit(input: CreditCreditsInput): Promise<{ success: boolean; newBalance: number }> {
        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            throw new Error('User not found');
        }

        const credits = Credits.create(user.credits);
        const newCredits = credits.add(input.amount);
        
        await this.userRepository.updateBalance(input.userId, newCredits.getValue());
        
        await this.transactionRepository.save({
            userId: input.userId,
            type: input.type,
            amount: input.amount,
            balanceBefore: credits.getValue(),
            balanceAfter: newCredits.getValue(),
            description: input.description,
            referenceId: input.referenceId
        });

        return {
            success: true,
            newBalance: newCredits.getValue()
        };
    }

    async validateSufficientCredits(userId: string, requiredAmount: number): Promise<boolean> {
        const balance = await this.getBalance(userId);
        return balance >= requiredAmount;
    }

    calculateCost(quantity: number): number {
        return quantity * env.game.pricePerGame;
    }
}
