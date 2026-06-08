// ============================================
// web/services/api-client.ts
// Cliente HTTP para comunicação com a API
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface GenerateGameRequest {
    lottery: string;
    quantity: number;
    mode: string;
    extraNumbers?: number;
    filters?: Record<string, any>;
}

export interface GenerateGameResponse {
    games: number[][];
    creditsSpent: number;
    creditsRemaining: number;
    requestId: string;
}

export interface CreditsResponse {
    credits: number;
    isPro: boolean;
    userId: string;
    name: string;
    email: string;
}

export interface ProStatusResponse {
    isPro: boolean;
    isProFixed: boolean;
    expiresAt: string | null;
    daysLeft: number;
}

class ApiClient {
    private baseUrl: string = '/api';

    private async getFirebaseToken(): Promise<string | null> {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const user = firebase.auth().currentUser;
                if (user) {
                    return await user.getIdToken();
                }
            } catch (e) {
                console.error('Erro ao obter token Firebase:', e);
            }
        }
        return null;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const firebaseToken = await this.getFirebaseToken();
        const user = firebase.auth()?.currentUser;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>
        };

        if (firebaseToken) {
            headers['Authorization'] = `Bearer ${firebaseToken}`;
        }

        if (user) {
            headers['X-User-Id'] = user.uid;
            headers['X-User-Email'] = user.email || '';
            headers['X-User-Name'] = user.displayName || '';
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    }

    async getCredits(): Promise<number> {
        try {
            const user = firebase.auth()?.currentUser;
            if (!user) return 0;

            const response = await this.request<CreditsResponse>(`/user/credits?uid=${user.uid}`);
            return response.data?.credits || 0;
        } catch (error) {
            console.error('Erro ao buscar créditos:', error);
            return 0;
        }
    }

    async getProStatus(): Promise<ProStatusResponse> {
        try {
            const user = firebase.auth()?.currentUser;
            if (!user) return { isPro: false, isProFixed: false, expiresAt: null, daysLeft: 0 };

            const response = await this.request<ProStatusResponse>(`/pro/status?uid=${user.uid}`);
            return response.data || { isPro: false, isProFixed: false, expiresAt: null, daysLeft: 0 };
        } catch (error) {
            console.error('Erro ao buscar status PRO:', error);
            return { isPro: false, isProFixed: false, expiresAt: null, daysLeft: 0 };
        }
    }

    async generateGames(request: GenerateGameRequest): Promise<GenerateGameResponse> {
        const user = firebase.auth()?.currentUser;
        if (!user) throw new Error('Usuário não logado');

        const response = await this.request<GenerateGameResponse>('/generate', {
            method: 'POST',
            body: JSON.stringify({
                uid: user.uid,
                lottery: request.lottery,
                quantity: request.quantity,
                mode: request.mode,
                extraNumbers: request.extraNumbers,
                filters: request.filters
            })
        });

        if (!response.success) {
            throw new Error(response.error || 'Erro ao gerar jogos');
        }

        return response.data as GenerateGameResponse;
    }

    async getHistory(limit: number = 50): Promise<any[]> {
        try {
            const user = firebase.auth()?.currentUser;
            if (!user) return [];

            const response = await this.request(`/user/history?uid=${user.uid}&limit=${limit}`);
            return response.data?.history || [];
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            return [];
        }
    }
}

export const apiClient = new ApiClient();
export default apiClient;
