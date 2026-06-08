// ============================================
// config/database.config.ts
// Configurações do banco de dados (Supabase)
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

// ========================================
// TIPOS DAS TABELAS
// ========================================

export interface Database {
    usuarios: {
        id: string;
        uid: string;
        nome: string;
        email: string;
        foto_url: string | null;
        creditos: number;
        is_pro: boolean;
        pro_expires_at: string | null;
        pro_ativado_em: string | null;
        is_admin: boolean;
        created_at: string;
        updated_at: string;
    };
    historico_palpites: {
        id: string;
        usuario_uid: string;
        loteria: string;
        jogos: any;
        filtros: string | null;
        extras: string | null;
        meses: any;
        quantidade_numeros: number | null;
        times: any;
        data: string;
    };
    transacoes: {
        id: string;
        usuario_uid: string;
        tipo: 'compra' | 'uso' | 'pro_ativacao';
        quantidade: number;
        saldo_apos: number;
        reference_id: string | null;
        idempotency_key: string | null;
        metadata: any;
        resultado: any;
        data: string;
    };
    audit_logs: {
        id: string;
        usuario_uid: string | null;
        email: string | null;
        acao: string;
        detalhes: any;
        ip: string | null;
        user_agent: string | null;
        created_at: string;
    };
}

// ========================================
// CLIENTES SUPABASE
// ========================================

let supabaseAdmin: SupabaseClient<Database> | null = null;
let supabaseAnon: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
    if (!supabaseAdmin) {
        supabaseAdmin = createClient<Database>(
            env.supabase.url,
            env.supabase.serviceRoleKey || env.supabase.anonKey
        );
    }
    return supabaseAdmin;
}

export function getSupabaseAnon(): SupabaseClient<Database> {
    if (!supabaseAnon) {
        supabaseAnon = createClient<Database>(
            env.supabase.url,
            env.supabase.anonKey
        );
    }
    return supabaseAnon;
}

// ========================================
// CONFIGURAÇÕES DO BANCO
// ========================================

export const databaseConfig = {
    tables: {
        USUARIOS: 'usuarios',
        HISTORICO_PALPITES: 'historico_palpites',
        TRANSACOES: 'transacoes',
        AUDIT_LOGS: 'audit_logs'
    },
    
    rpcFunctions: {
        GENERATE_GAME: 'generate_game',
        ADD_CREDITS: 'add_credits',
        GET_PRO_STATUS: 'get_pro_status',
        ACTIVATE_PRO: 'ativar_pro'
    },
    
    pagination: {
        defaultLimit: 50,
        maxLimit: 200
    },
    
    timeouts: {
        query: 30000,      // 30 segundos
        transaction: 60000 // 60 segundos
    }
} as const;

export default { getSupabaseAdmin, getSupabaseAnon, databaseConfig };
