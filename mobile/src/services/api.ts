import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = 'https://loterias-ia.vercel.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token Firebase
api.interceptors.request.use(async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['X-User-Id'] = user.uid;
        config.headers['X-User-Email'] = user.email || '';
    }
    return config;
});

// ============================================
// CRÉDITOS
// ============================================
export const getCredits = async (uid: string) => {
    const response = await api.get(`/user/credits?uid=${uid}`);
    return response.data;
};

// ============================================
// GERAR JOGOS
// ============================================
export const generateGames = async (data: {
    lottery: string;
    quantity: number;
    mode: string;
    extraNumbers?: number;
}) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não logado');
    
    const response = await api.post('/generate', {
        uid: user.uid,
        lottery: data.lottery,
        quantity: data.quantity,
        mode: data.mode,
        extraNumbers: data.extraNumbers,
    });
    return response.data;
};

// ============================================
// HISTÓRICO
// ============================================
export const getHistory = async (uid: string, limit: number = 50) => {
    const response = await api.get(`/user/history?uid=${uid}&limit=${limit}`);
    return response.data;
};

// ============================================
// STATUS PRO
// ============================================
export const getProStatus = async (uid: string) => {
    const response = await api.get(`/pro/status?uid=${uid}`);
    return response.data;
};

// ============================================
// CRIAR PAGAMENTO (PIX)
// ============================================
export const createPayment = async (amount: number) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não logado');
    
    const response = await api.post('/payments/create', {
        userId: user.uid,
        amount: amount,
    });
    return response.data;
};

export default api;
