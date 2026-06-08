// ============================================
// repositories/user.repository.ts
// Repositório de usuários (abstração do banco)
// ============================================

import { createClient } from '@supabase/supabase-js';
import { User } from '../core/entities/User.js';
import { env } from '../config/env.js';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByFirebaseUid(uid: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>;
    update(user: User): Promise<void>;
    updateBalance(userId: string, newBalance: number): Promise<void>;
    delete(id: string): Promise<void>;
    list(limit?: number, offset?: number): Promise<User[]>;
}

export class SupabaseUserRepository implements UserRepository {
    async findById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    async findByFirebaseUid(uid: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('uid', uid)
            .single();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    async findByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    async save(user: User): Promise<void> {
        const { error } = await supabase
            .from('usuarios')
            .insert(this.mapToDB(user));

        if (error) throw new Error(`Erro ao salvar usuário: ${error.message}`);
    }

    async update(user: User): Promise<void> {
        const { error } = await supabase
            .from('usuarios')
            .update(this.mapToDB(user))
            .eq('id', user.id);

        if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    async updateBalance(userId: string, newBalance: number): Promise<void> {
        const { error } = await supabase
            .from('usuarios')
            .update({ creditos: newBalance, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw new Error(`Erro ao atualizar saldo: ${error.message}`);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }

    async list(limit: number = 50, offset: number = 0): Promise<User[]> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) return [];
        return data.map(row => this.mapToEntity(row));
    }

    private mapToEntity(row: any): User {
        let role: 'free' | 'pro' | 'admin' | 'super_admin' = 'free';
        if (row.is_admin) role = 'admin';
        else if (row.is_pro) role = 'pro';
        
        return User.restore({
            id: row.id,
            firebaseUid: row.uid,
            name: row.nome,
            email: row.email,
            photoUrl: row.foto_url,
            role: role,
            credits: row.creditos,
            isPro: row.is_pro,
            proExpiresAt: row.pro_expires_at ? new Date(row.pro_expires_at) : null,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }

    private mapToDB(user: User): any {
        return {
            id: user.id,
            uid: user.firebaseUid,
            nome: user.name,
            email: user.email,
            foto_url: user.photoUrl,
            creditos: user.credits,
            is_pro: user.isPro,
            pro_expires_at: user.proExpiresAt?.toISOString(),
            updated_at: user.updatedAt.toISOString()
        };
    }
}
