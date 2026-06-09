// ============================================
// api/health.ts
// ENDPOINT: GET /api/health
// Health check para monitoramento
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const start = Date.now();
    const checks: Record<string, { status: 'up' | 'down'; latency?: number; error?: string }> = {};
    
    // 1. Check Supabase
    try {
        const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
        if (error) throw error;
        checks.database = { status: 'up', latency: Date.now() - start };
    } catch (error) {
        checks.database = { status: 'down', error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // 2. Check API internal
    checks.api = { status: 'up', latency: Date.now() - start };
    
    const allUp = Object.values(checks).every(c => c.status === 'up');
    
    res.status(allUp ? 200 : 503).json({
        status: allUp ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: env.isProd ? 'production' : 'development',
        checks
    });
}
