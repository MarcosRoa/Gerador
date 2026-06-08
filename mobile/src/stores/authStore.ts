import { create } from 'zustand';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { api } from '../services/api';

const firebaseConfig = {
    apiKey: "AIzaSyCA_FoID7Ch8LkcwK5TbQSK23lU7BxQMuE",
    authDomain: "loteriasia.firebaseapp.com",
    projectId: "loteriasia",
    storageBucket: "loteriasia.firebasestorage.app",
    messagingSenderId: "124650527048",
    appId: "1:124650527048:web:bc335922cb9e1586c3fb7d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    loginWithEmail: (email: string, password: string) => Promise<boolean>;
    registerWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: false,
    error: null,

    loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            set({ user: result.user, isLoading: false });
            return true;
        } catch (error: any) {
            let message = 'Erro ao fazer login';
            if (error.code === 'auth/invalid-credential') message = 'E-mail ou senha inválidos';
            if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado';
            if (error.code === 'auth/wrong-password') message = 'Senha incorreta';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    registerWithEmail: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await result.user.updateProfile({ displayName: name });
            set({ user: result.user, isLoading: false });
            return true;
        } catch (error: any) {
            let message = 'Erro ao criar conta';
            if (error.code === 'auth/email-already-in-use') message = 'E-mail já está em uso';
            if (error.code === 'auth/weak-password') message = 'Senha muito fraca (mínimo 6 caracteres)';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    logout: async () => {
        await signOut(auth);
        set({ user: null });
    },

    checkAuth: async () => {
        return new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                set({ user });
                unsubscribe();
                resolve(user);
            });
        });
    },
}));
