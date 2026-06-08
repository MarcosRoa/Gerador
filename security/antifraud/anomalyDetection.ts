// ============================================
// security/antifraud/anomalyDetection.ts
// Detecção de anomalias (comportamento suspeito)
// ============================================

interface UserBehavior {
    userId: string;
    timestamp: number;
    action: string;
    metadata: Record<string, any>;
}

// Armazenamento em memória (em produção usar Redis)
const behaviorStore = new Map<string, UserBehavior[]>();

export class AnomalyDetector {
    private static readonly WINDOW_MS = 5 * 60 * 1000; // 5 minutos
    private static readonly MAX_ACTIONS_PER_WINDOW = 50;
    private static readonly MAX_GENERATE_PER_WINDOW = 10;
    private static readonly MAX_FAILED_LOGINS = 5;
    private static readonly SUSPICIOUS_IP_THRESHOLD = 3;

    static recordAction(userId: string, action: string, metadata: Record<string, any> = {}): void {
        const now = Date.now();
        const actions = behaviorStore.get(userId) || [];
        
        const filtered = actions.filter(a => now - a.timestamp < this.WINDOW_MS);
        filtered.push({ userId, timestamp: now, action, metadata });
        
        behaviorStore.set(userId, filtered);
        
        // Limpar cache periodicamente
        setTimeout(() => {
            const current = behaviorStore.get(userId);
            if (current) {
                const cleaned = current.filter(a => Date.now() - a.timestamp < this.WINDOW_MS);
                if (cleaned.length === 0) behaviorStore.delete(userId);
                else behaviorStore.set(userId, cleaned);
            }
        }, this.WINDOW_MS);
    }

    static checkAnomaly(userId: string, action: string): { isAnomaly: boolean; reason?: string; score: number } {
        const actions = behaviorStore.get(userId) || [];
        const now = Date.now();
        const recent = actions.filter(a => now - a.timestamp < this.WINDOW_MS);

        // Muitas ações no período
        if (recent.length > this.MAX_ACTIONS_PER_WINDOW) {
            return {
                isAnomaly: true,
                score: 80,
                reason: `Too many actions (${recent.length} in ${this.WINDOW_MS / 1000}s)`
            };
        }

        // Muitas gerações de jogos
        const generateCount = recent.filter(a => a.action === 'generate').length;
        if (action === 'generate' && generateCount > this.MAX_GENERATE_PER_WINDOW) {
            return {
                isAnomaly: true,
                score: 70,
                reason: `Too many generate requests (${generateCount} in ${this.WINDOW_MS / 1000}s)`
            };
        }

        // Velocidade anômala
        const lastSecond = recent.filter(a => now - a.timestamp < 1000).length;
        if (lastSecond > 5) {
            return {
                isAnomaly: true,
                score: 90,
                reason: `High request frequency (${lastSecond} requests in 1s)`
            };
        }

        // Muitas tentativas de login falhas
        const failedLogins = recent.filter(a => a.action === 'login_failed').length;
        if (action === 'login_failed' && failedLogins > this.MAX_FAILED_LOGINS) {
            return {
                isAnomaly: true,
                score: 85,
                reason: `Too many failed login attempts (${failedLogins})`
            };
        }

        // Mesmo IP com múltiplos usuários (possível ataque)
        const ip = recent[0]?.metadata?.ip;
        if (ip) {
            const uniqueUsers = new Set(recent.map(a => a.userId)).size;
            if (uniqueUsers > this.SUSPICIOUS_IP_THRESHOLD) {
                return {
                    isAnomaly: true,
                    score: 75,
                    reason: `Multiple users from same IP (${uniqueUsers})`
                };
            }
        }

        return { isAnomaly: false, score: 0 };
    }

    static clear(userId?: string): void {
        if (userId) {
            behaviorStore.delete(userId);
        } else {
            behaviorStore.clear();
        }
    }

    static getStats(userId: string): { totalActions: number; windowMs: number; actionsByType: Record<string, number> } {
        const actions = behaviorStore.get(userId) || [];
        const now = Date.now();
        const recent = actions.filter(a => now - a.timestamp < this.WINDOW_MS);
        
        const actionsByType: Record<string, number> = {};
        recent.forEach(a => {
            actionsByType[a.action] = (actionsByType[a.action] || 0) + 1;
        });
        
        return {
            totalActions: recent.length,
            windowMs: this.WINDOW_MS,
            actionsByType
        };
    }
}
