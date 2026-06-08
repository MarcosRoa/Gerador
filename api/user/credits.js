// ============================================
// api/user/credits.js
// ENDPOINT: GET /api/user/credits
// ============================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fuiaikymhsjdgdhojjhq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aWFpa3ltaHNqZGdkaG9qamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODI1NTEsImV4cCI6MjA5MzY1ODU1MX0.X9Qa1eJ6ut-QdKEZdjX2Ttm2STgJqOkEdNyohDpH3bk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
    // 1. Apenas GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Obter UID
    const uid = req.query.uid || req.headers['x-user-id'];
    if (!uid) {
        return res.status(400).json({ error: 'UID é obrigatório' });
    }

    try {
        // 3. Buscar usuário
        let { data: user, error } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email')
            .eq('uid', uid)
            .single();

        // 4. Se não existir, criar
        if (error && error.code === 'PGRST116') {
            const email = req.headers['x-user-email'] || `${uid}@temp.com`;
            const nome = req.headers['x-user-name'] || email.split('@')[0];
            
            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    uid: uid,
                    nome: nome,
                    email: email,
                    creditos: 5,
                    is_pro: false,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .select('creditos, is_pro, email')
                .single();

            if (insertError) {
                console.error('Erro ao criar usuário:', insertError);
                return res.status(500).json({ error: 'Erro ao criar usuário' });
            }
            user = newUser;
        } else if (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).json({ error: 'Erro ao buscar usuário' });
        }

        // 5. Verificar PRO fixo
        const PRO_FIXED_EMAIL = 'mresquadriasaluminio@gmail.com';
        const isProFixed = user.email === PRO_FIXED_EMAIL;
        
        let credits = user.creditos;
        let isPro = user.is_pro;

        if (isProFixed) {
            isPro = true;
            if (credits !== 100) {
                await supabase
                    .from('usuarios')
                    .update({ creditos: 100, is_pro: true, updated_at: new Date() })
                    .eq('uid', uid);
                credits = 100;
            }
        }

        // 6. Retornar
        return res.status(200).json({
            success: true,
            credits: credits,
            isPro: isPro
        });

    } catch (error) {
        console.error('Erro em /user/credits:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
