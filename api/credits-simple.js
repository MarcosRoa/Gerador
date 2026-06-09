// api/credits-simple.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const uid = req.query.uid || 'teste123';
    
    try {
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email')
            .eq('uid', uid)
            .single();
        
        if (error && error.code === 'PGRST116') {
            // Criar usuário
            const { data: newUser } = await supabase
                .from('usuarios')
                .insert({
                    uid: uid,
                    nome: 'Teste',
                    email: `${uid}@teste.com`,
                    creditos: 5,
                    is_pro: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('creditos, is_pro, email')
                .single();
            
            return res.status(200).json({ success: true, credits: newUser.creditos, isPro: newUser.is_pro });
        }
        
        return res.status(200).json({ success: true, credits: user.creditos, isPro: user.is_pro });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
