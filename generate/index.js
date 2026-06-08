// ============================================
// BLOCO: API - GERAR JOGOS
// FUNÇÃO: Valida saldo, debita e registra jogo
// ENDPOINT: POST /api/generate
// ============================================

import supabase from '../_lib/supabase.js'
import { getUserIdFromRequest } from '../_lib/auth.js'
import crypto from 'crypto'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const uid = getUserIdFromRequest(req)
    if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const { lottery, quantidade, generation_mode, numeros, metadata } = req.body

    if (!lottery || !quantidade || !numeros) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        // Buscar usuário interno
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('firebase_uid', uid)
            .single()

        if (userError) throw userError

        // Calcular custo (R$ 3 por jogo)
        const custo = quantidade * 3

        // Criar hash para idempotência
        const hash = crypto
            .createHash('md5')
            .update(`${user.id}-${lottery}-${quantidade}-${Date.now()}`)
            .digest('hex')

        // Aplicar débito
        const { data: newBalance, error: debitError } = await supabase
            .rpc('apply_credit_transaction', {
                p_user_id: user.id,
                p_amount: -custo,
                p_transaction_type: 'generate_game',
                p_reference_id: hash,
                p_description: `${quantidade} jogo(s) de ${lottery}`,
                p_idempotency_key: hash,
                p_source: 'web'
            })

        if (debitError) throw debitError

        // Registrar jogos gerados
        const { error: saveError } = await supabase
            .from('generated_games')
            .insert({
                user_id: user.id,
                lottery: lottery,
                generated_numbers: numeros,
                generation_mode: generation_mode || 'ia_especialista',
                credits_cost: custo,
                metadata: metadata || {},
                request_hash: hash,
                client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                user_agent: req.headers['user-agent'],
                source: 'web'
            })

        if (saveError) throw saveError

        return res.status(200).json({
            success: true,
            credits_remaining: newBalance,
            games: numeros,
            cost: custo,
            hash: hash
        })

    } catch (error) {
        console.error('Erro em /generate:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
