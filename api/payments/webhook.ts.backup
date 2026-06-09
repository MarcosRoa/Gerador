// ============================================
// api/payments/webhook.ts
// ENDPOINT: POST /api/payments/webhook
// Recebe confirmação do Mercado Pago PIX
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env.js';
import crypto from 'crypto';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

// Chave secreta do webhook (configurar no .env)
const WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET || 'sua-chave-secreta-aqui';

function verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Method check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // 2. Verify signature (segurança)
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    if (!verifySignature(payload, signature, WEBHOOK_SECRET)) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 3. Process webhook
    const { action, data } = req.body;
    
    if (action !== 'payment.created') {
        return res.status(200).json({ message: 'Ignored' });
    }
    
    const paymentId = data.id;
    const status = data.status;
    const userId = data.external_reference; // Seu identificador do usuário
    const amount = data.transaction_amount;
    
    if (status !== 'approved') {
        return res.status(200).json({ message: 'Payment not approved yet' });
    }
    
    if (!userId) {
        console.error('Missing external_reference in webhook');
        return res.status(400).json({ error: 'Missing user reference' });
    }
    
    try {
        // 4. Chamar RPC para adicionar créditos (idempotente)
        const idempotencyKey = `webhook_${paymentId}`;
        
        const { data: result, error } = await supabase.rpc('add_credits', {
            p_user_uid: userId,
            p_amount: amount,
            p_payment_id: paymentId,
            p_idempotency_key: idempotencyKey
        });
        
        if (error) {
            console.error('Error adding credits:', error);
            return res.status(500).json({ error: 'Internal error' });
        }
        
        console.log(`✅ Créditos adicionados: ${amount} para usuário ${userId}`);
        
        return res.status(200).json({ success: true, result });
        
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
