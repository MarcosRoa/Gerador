// ============================================
// services/auth.service.ts
// Serviço de autenticação
// ============================================

import type { UserRepository } from '../repositories/user.repository.js';
import { User } from '../core/entities/User.js';
import { env } from '../config/env.js';

export interface AuthUser {
    uid: string;
    email: string;
    name: string;
    photoUrl: string | null;
}

export interface LoginResult {
    success: boolean;
    user?: User;
    isNewUser?: boolean;
    error?: string;
}

export class AuthService {
    constructor(private userRepository: UserRepository) {}

    async processLogin(authUser: AuthUser): Promise<LoginResult> {
        try {
            let user = await this.userRepository.findByFirebaseUid(authUser.uid);
            
            if (!user) {
                const isPro = authUser.email === env.pro.fixedEmail;
                const credits = isPro ? env.pro.fixedCredits : env.game.defaultCredits;
                
                const newUser = User.create({
                    firebaseUid: authUser.uid,
                    name: authUser.name,
                    email: authUser.email,
                    photoUrl: authUser.photoUrl,
                    role: isPro ? 'pro' : 'free',
                    credits: credits,
                    isPro: isPro,
                    proExpiresAt: isPro ? new Date(Date.now() + env.pro.defaultDays * 24 * 60 * 60 * 1000) : null
                });
                
                await this.userRepository.save(newUser);
                
                return {
                    success: true,
                    user: newUser,
                    isNewUser: true
                };
            }
            
            let updatedUser = user;
            if (authUser.email === env.pro.fixedEmail) {
                if (!user.isPro || user.credits !== env.pro.fixedCredits) {
                    const expiresAt = new Date(Date.now() + env.pro.defaultDays * 24 * 60 * 60 * 1000);
                    updatedUser = user.activatePro(expiresAt);
                    await this.userRepository.update(updatedUser);
                    
                    if (updatedUser.credits !== env.pro.fixedCredits) {
                        await this.userRepository.updateBalance(updatedUser.id, env.pro.fixedCredits);
                    }
                }
            }
            
            return {
                success: true,
                user: updatedUser,
                isNewUser: false
            };
            
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao processar login'
            };
        }
    }

    async isUserPro(userId: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) return false;
        return user.hasActivePro();
    }

    async getUserCredits(userId: string): Promise<number> {
        const user = await this.userRepository.findById(userId);
        if (!user) return 0;
        
        if (user.email === env.pro.fixedEmail) {
            return env.pro.fixedCredits;
        }
        
        return user.credits;
    }
}
