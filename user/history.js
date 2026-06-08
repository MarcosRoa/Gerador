// ============================================
// BLOCO: API - HISTÓRICO DE JOGOS
// FUNÇÃO: Retorna histórico de palpites do usuário
// ENDPOINT: GET /api/user/history
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
        // Buscar usuário interno
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('firebase_uid', uid)
            .single()

        if (userError) throw userError

        // Buscar histórico
        const { data: history, error: historyError } = await supabase
            .from('generated_games')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (historyError) throw historyError

        return res.status(200).json({
            success: true,
            history: history || [],
            count: history?.length || 0
        })

    } catch (error) {
        console.error('Erro em /user/history:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
