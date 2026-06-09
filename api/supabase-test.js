import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        res.status(200).json({ success: true, message: 'Supabase conectado!' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            code: error.code
        });
    }
}
