// api/status-simple.js
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
            .select('is_pro, pro_expires_at, email')
            .eq('uid', uid)
            .single();
        
        if (error) {
            return res.status(200).json({ success: true, isPro: false, daysLeft: 0 });
        }
        
        const PRO_FIXED_EMAIL = 'mresquadriasaluminio@gmail.com';
        
        if (user.email === PRO_FIXED_EMAIL) {
            return res.status(200).json({ success: true, isPro: true, daysLeft: 365 });
        }
        
        let daysLeft = 0;
        if (user.is_pro && user.pro_expires_at) {
            const expiresAt = new Date(user.pro_expires_at);
            const now = new Date();
            daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
        }
        
        return res.status(200).json({ success: true, isPro: user.is_pro || false, daysLeft });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
