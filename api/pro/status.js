// ============================================
// api/pro/status.js
// ENDPOINT: GET /api/pro/status
// ============================================
// api/pro/status.js
import { supabase, getOrCreateUser } from '../_lib/supabase.js';
import { PRO_FIXED_EMAIL } from '../_lib/constants.js';

function daysLeft(expiresAt) {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOWED_ORIGIN || 'https://loterias-ia.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const uid = req.query.uid || req.headers['x-user-id'];
    if (!uid) return res.status(400).json({ error: 'UID é obrigatório' });
    
    try {
        const user = await getOrCreateUser(uid, req.headers['x-user-email']);
        
        // PRO fixo (vitalício)
        if (user.email === PRO_FIXED_EMAIL) {
            return res.status(200).json({ success: true, isPro: true, daysLeft: 365, isLifetime: true });
        }
        
        let isPro = user.is_pro;
        let days = daysLeft(user.pro_expires_at);
        
        // Se expirou, atualizar
        if (isPro && days === 0) {
            isPro = false;
            supabase.from('usuarios').update({ is_pro: false }).eq('uid', uid);
        }
        
        return res.status(200).json({ success: true, isPro, daysLeft: days });
        
    } catch (error) {
        console.error('Erro em status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
