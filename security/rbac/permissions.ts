// ============================================
// security/rbac/permissions.ts
// Verificação de permissões para usuários
// ============================================

import type { User } from '../../core/entities/User.js';
import { hasPermission, isAdmin, Permission, Role } from './roles.js';
import { env } from '../../config/env.js';

export class PermissionChecker {
    static getUserRole(user: User | null): Role {
        if (!user) return 'guest';

        if (user.role === 'super_admin') return 'super_admin';
        if (user.role === 'admin') return 'admin';
        
        if (user.email === env.pro.fixedEmail) return 'pro';
        
        if (user.hasActivePro()) return 'pro';
        
        return 'free';
    }

    static can(user: User | null, permission: Permission): boolean {
        const role = this.getUserRole(user);
        return hasPermission(role, permission);
    }

    static canAll(user: User | null, permissions: Permission[]): boolean {
        return permissions.every(p => this.can(user, p));
    }

    static canAny(user: User | null, permissions: Permission[]): boolean {
        return permissions.some(p => this.can(user, p));
    }

    static isAdmin(user: User | null): boolean {
        const role = this.getUserRole(user);
        return isAdmin(role);
    }
}
