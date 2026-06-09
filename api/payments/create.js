// api/payments/create.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        // Buscar usuário
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('creditos')
            .eq('uid', userId)
            .single();
        
        if (userError) throw userError;
        
        const novoSaldo = (user.creditos || 0) + amount;
        
        await supabase
            .from('usuarios')
            .update({ 
                creditos: novoSaldo, 
                updated_at: new Date().toISOString() 
            })
            .eq('uid', userId);
        
        return res.status(200).json({
            success: true,
            mode: 'simulation',
            newBalance: novoSaldo,
            message: `R$ ${amount} adicionados com sucesso!`
        });
        
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}
