// ============================================
// security/audit/auditLogger.ts
// Log de auditoria para ações importantes
// ============================================

import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env.js';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

export type AuditAction =
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'LOGOUT'
    | 'GENERATE_GAME'
    | 'BUY_CREDITS'
    | 'ACTIVATE_PRO'
    | 'ADMIN_ACTION'
    | 'CONFIG_CHANGE'
    | 'CSV_UPLOAD'
    | 'USER_UPDATE'
    | 'PASSWORD_RESET'
    | 'PAYMENT_WEBHOOK'
    | 'ANOMALY_DETECTED'
    | 'RATE_LIMIT_HIT';

export interface AuditLogEntry {
    id?: string;
    userId: string | null;
    userEmail: string | null;
    action: AuditAction;
    details: Record<string, any>;
    ip: string | null;
    userAgent: string | null;
    timestamp: Date;
}

class AuditLoggerClass {
    private static readonly ENABLE_DB_LOGGING = process.env.ENABLE_AUDIT_DB === 'true';

    async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
        const fullEntry: AuditLogEntry = {
            ...entry,
            timestamp: new Date()
        };

        // Log no console (sempre)
        console.log('[AUDIT]', JSON.stringify(fullEntry));

        // Salvar no banco de dados (opcional)
        if (AuditLoggerClass.ENABLE_DB_LOGGING) {
            try {
                // Verificar se a tabela audit_logs existe, se não, criar
                await this.ensureTable();
                
                await supabase
                    .from('audit_logs')
                    .insert({
                        usuario_uid: entry.userId,
                        email: entry.userEmail,
                        acao: entry.action,
                        detalhes: entry.details,
                        ip: entry.ip,
                        user_agent: entry.userAgent,
                        created_at: new Date().toISOString()
                    });
            } catch (error) {
                console.error('Erro ao salvar log de auditoria:', error);
            }
        }
    }

    private async ensureTable(): Promise<void> {
        // Tabela de auditoria (criar se não existir)
        const { error } = await supabase.rpc('create_audit_table_if_not_exists');
        if (error) {
            // Se a RPC não existe, tentar criar a tabela via SQL
            console.warn('Tabela de auditoria não disponível:', error);
        }
    }

    async loginSuccess(userId: string, email: string, ip: string | null, userAgent: string | null): Promise<void> {
        await this.log({
            userId,
            userEmail: email,
            action: 'LOGIN_SUCCESS',
            details: {},
            ip,
            userAgent
        });
    }

    async loginFailed(email: string, ip: string | null, reason: string): Promise<void> {
        await this.log({
            userId: null,
            userEmail: email,
            action: 'LOGIN_FAILED',
            details: { reason },
            ip,
            userAgent: null
        });
    }

    async generateGame(userId: string, email: string, lottery: string, quantity: number, cost: number, ip: string | null): Promise<void> {
        await this.log({
            userId,
            userEmail: email,
            action: 'GENERATE_GAME',
            details: { lottery, quantity, cost },
            ip,
            userAgent: null
        });
    }

    async buyCredits(userId: string, email: string, amount: number, paymentMethod: string, ip: string | null): Promise<void> {
        await this.log({
            userId,
            userEmail: email,
            action: 'BUY_CREDITS',
            details: { amount, paymentMethod },
            ip,
            userAgent: null
        });
    }

    async activatePro(userId: string, email: string, days: number, ip: string | null): Promise<void> {
        await this.log({
            userId,
            userEmail: email,
            action: 'ACTIVATE_PRO',
            details: { days },
            ip,
            userAgent: null
        });
    }

    async anomalyDetected(userId: string | null, email: string | null, reason: string, score: number, ip: string | null): Promise<void> {
        await this.log({
            userId: userId || null,
            userEmail: email || null,
            action: 'ANOMALY_DETECTED',
            details: { reason, score },
            ip,
            userAgent: null
        });
    }

    async rateLimitHit(userId: string | null, ip: string, endpoint: string): Promise<void> {
        await this.log({
            userId: userId || null,
            userEmail: null,
            action: 'RATE_LIMIT_HIT',
            details: { endpoint, ip },
            ip,
            userAgent: null
        });
    }
}

export const auditLogger = new AuditLoggerClass();
