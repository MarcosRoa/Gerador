// ============================================
// repositories/transaction.repository.ts
// Repositório de transações financeiras
// ============================================

import { createClient } from '@supabase/supabase-js';
import { Transaction } from '../core/entities/Transaction.js';
import type { TransactionType } from '../core/entities/Transaction.js';
import { env } from '../config/env.js';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

export interface TransactionInput {
    userId: string;
    type: TransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string | null;
    referenceId: string | null;
    metadata?: Record<string, any>;
}

export interface TransactionRepository {
    save(input: Omit<TransactionInput, 'id' | 'createdAt'>): Promise<Transaction>;
    findByUser(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
    findByReference(referenceId: string): Promise<Transaction | null>;
    getBalanceHistory(userId: string, days?: number): Promise<Transaction[]>;
}

export class SupabaseTransactionRepository implements TransactionRepository {
    async save(input: Omit<TransactionInput, 'id' | 'createdAt'>): Promise<Transaction> {
        const { data, error } = await supabase
            .from('transacoes')
            .insert({
                usuario_uid: input.userId,
                tipo: input.type,
                quantidade: Math.abs(input.amount),
                saldo_apos: input.balanceAfter,
                data: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw new Error(`Erro ao salvar transação: ${error.message}`);
        
        return Transaction.restore({
            id: data.id,
            userId: data.usuario_uid,
            type: data.tipo,
            amount: input.amount,
            balanceBefore: input.balanceBefore,
            balanceAfter: data.saldo_apos,
            description: input.description,
            referenceId: input.referenceId,
            metadata: input.metadata || {},
            createdAt: new Date(data.data)
        });
    }
    
    async findByUser(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('usuario_uid', userId)
            .order('data', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) return [];
        
        return data.map(item => Transaction.restore({
            id: item.id,
            userId: item.usuario_uid,
            type: item.tipo,
            amount: item.tipo === 'compra' ? item.quantidade : -item.quantidade,
            balanceBefore: 0,
            balanceAfter: item.saldo_apos,
            description: null,
            referenceId: null,
            metadata: {},
            createdAt: new Date(item.data)
        }));
    }
    
    async findByReference(referenceId: string): Promise<Transaction | null> {
        // O banco atual não tem reference_id
        // Implementar depois
        return null;
    }
    
    async getBalanceHistory(userId: string, days: number = 30): Promise<Transaction[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('usuario_uid', userId)
            .gte('data', cutoffDate.toISOString())
            .order('data', { ascending: true });
        
        if (error) return [];
        
        return data.map(item => Transaction.restore({
            id: item.id,
            userId: item.usuario_uid,
            type: item.tipo,
            amount: item.tipo === 'compra' ? item.quantidade : -item.quantidade,
            balanceBefore: 0,
            balanceAfter: item.saldo_apos,
            description: null,
            referenceId: null,
            metadata: {},
            createdAt: new Date(item.data)
        }));
    }
}
