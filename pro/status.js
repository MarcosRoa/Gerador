// ============================================
// BLOCO: API - STATUS DO PLANO PRO
// FUNÇÃO: Verifica se usuário tem PRO ativo
// ENDPOINT: GET /api/pro/status
// ============================================

import supabase from '../_lib/supabase.js'
import { getUserIdFromRequest } from '../_lib/auth.js'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const uid = getUserIdFromRequest(req)
    if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        // Buscar usuário
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .eq('firebase_uid', uid)
            .single()

        if (userError) throw userError

        // Verificar email fixo PRO
        const { data: config } = await supabase
            .from('configuracoes')
            .select('valor')
            .eq('chave', 'pro_email_fixo')
            .single()

        const proEmail = config?.valor?.replace(/"/g, '') || ''
        const isProFixo = user.email === proEmail

        if (isProFixo) {
            return res.status(200).json({
                success: true,
                isPro: true,
                isProFixo: true,
                expiresAt: null,
                daysLeft: 365
            })
        }

        // Verificar assinatura ativa
        const { data: subscription, error: subError } = await supabase
            .rpc('is_subscription_active', { p_user_id: user.id })

        return res.status(200).json({
            success: true,
            isPro: subscription || false,
            isProFixo: false,
            expiresAt: null,
            daysLeft: subscription ? 30 : 0
        })

    } catch (error) {
        console.error('Erro em /pro/status:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
