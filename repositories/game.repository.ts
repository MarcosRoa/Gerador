// ============================================
// repositories/game.repository.ts
// Repositório de jogos gerados (histórico)
// ============================================

import { createClient } from '@supabase/supabase-js';
import { Game } from '../core/entities/Game.js';
import type { LotteryId, AIMode } from '../core/entities/Game.js';
import { env } from '../config/env.js';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

export interface GameRepository {
    save(game: Game): Promise<Game>;
    findById(id: string): Promise<Game | null>;
    findByUser(userId: string, limit?: number, offset?: number): Promise<Game[]>;
    countByUser(userId: string): Promise<number>;
    deleteOld(userId: string, daysOld: number): Promise<number>;
}

export class SupabaseGameRepository implements GameRepository {
    async save(game: Game): Promise<Game> {
        const props = game.toJSON();
        
        const { data, error } = await supabase
            .from('historico_palpites')
            .insert({
                usuario_uid: props.userId,
                loteria: props.lottery,
                jogos: props.numbers,
                filtros: JSON.stringify(props.filters),
                extras: props.metadata?.extras || null,
                quantidade_numeros: props.numbers[0]?.length || 0,
                data: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw new Error(`Erro ao salvar jogo: ${error.message}`);
        
        return this.mapToEntity(data);
    }
    
    async findById(id: string): Promise<Game | null> {
        const { data, error } = await supabase
            .from('historico_palpites')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error || !data) return null;
        return this.mapToEntity(data);
    }
    
    async findByUser(userId: string, limit: number = 50, offset: number = 0): Promise<Game[]> {
        const { data, error } = await supabase
            .from('historico_palpites')
            .select('*')
            .eq('usuario_uid', userId)
            .order('data', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) return [];
        return data.map(item => this.mapToEntity(item));
    }
    
    async countByUser(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('historico_palpites')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_uid', userId);
        
        if (error) return 0;
        return count || 0;
    }
    
    async deleteOld(userId: string, daysOld: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        const { data, error } = await supabase
            .from('historico_palpites')
            .delete()
            .eq('usuario_uid', userId)
            .lt('data', cutoffDate.toISOString())
            .select();
        
        if (error) return 0;
        return data?.length || 0;
    }
    
    private mapToEntity(data: any): Game {
        let mode: AIMode = 'ia_especialista';
        try {
            const filtros = typeof data.filtros === 'string' ? JSON.parse(data.filtros) : data.filtros;
            if (filtros?.mode) mode = filtros.mode;
        } catch (e) {}
        
        return Game.restore({
            id: data.id,
            userId: data.usuario_uid,
            lottery: data.loteria as LotteryId,
            numbers: data.jogos,
            mode: mode,
            creditsCost: 0,
            filters: {},
            metadata: { extras: data.extras, meses: data.meses, times: data.times },
            requestHash: `legacy_${data.id}`,
            clientIp: null,
            userAgent: null,
            createdAt: new Date(data.data)
        });
    }
}
