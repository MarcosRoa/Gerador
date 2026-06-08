// ============================================
// BLOCO: API - CONSULTAR CRÉDITOS
// FUNÇÃO: Retorna saldo do usuário logado
// ENDPOINT: GET /api/user/credits
// HEADER: Authorization: Bearer {firebase_token}
// ============================================

import supabase from '../_lib/supabase.js'
import { getUserIdFromRequest } from '../_lib/auth.js'

export default async function handler(req, res) {
    // ============================================
    // 1. MÉTODO
    // ============================================
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // ============================================
    // 2. AUTENTICAÇÃO
    // ============================================
    const uid = getUserIdFromRequest(req)
    if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    // ============================================
    // 3. BUSCAR USUÁRIO
    // ============================================
    try {
        // Buscar usuário existente
        let { data: user, error } = await supabase
            .from('users')
            .select('id, firebase_uid, nome, email, is_active, is_admin')
            .eq('firebase_uid', uid)
            .single()

        // Se não existir, criar
        if (error && error.code === 'PGRST116') {
            const email = getUserEmailFromRequest(req) || `${uid}@temp.com`
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    firebase_uid: uid,
                    email: email,
                    nome: req.headers['x-user-name'] || 'Usuário',
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .select()
                .single()

            if (insertError) throw insertError
            user = newUser
        } else if (error) {
            throw error
        }

        // ============================================
        // 4. CONSULTAR SALDO
        // ============================================
        const { data: balance, error: balanceError } = await supabase
            .rpc('get_user_balance', { p_user_id: user.id })

        if (balanceError) throw balanceError

        // ============================================
        // 5. VERIFICAR SE É PRO (EMAIL FIXO)
        // ============================================
        const config = await supabase
            .from('configuracoes')
            .select('valor')
            .eq('chave', 'pro_email_fixo')
            .single()

        const proEmail = config.data?.valor?.replace(/"/g, '') || ''
        const isProFixo = user.email === proEmail

        // ============================================
        // 6. RETORNAR
        // ============================================
        return res.status(200).json({
            success: true,
            credits: balance || 0,
            userId: user.id,
            firebaseUid: user.firebase_uid,
            nome: user.nome,
            email: user.email,
            isPro: isProFixo,
            isAdmin: user.is_admin || false
        })

    } catch (error) {
        console.error('Erro em /user/credits:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
