// ============================================
// security/rbac/roles.ts
// Definição de papéis (roles) e permissões
// ============================================

export type Role = 'guest' | 'free' | 'pro' | 'admin' | 'super_admin';

export type Permission =
    // Jogos
    | 'game:generate'
    | 'game:view_history'
    | 'game:export_pdf'
    | 'game:bolao'
    // Créditos
    | 'credits:view'
    | 'credits:buy'
    // IA
    | 'ia:train'
    | 'ia:backtest'
    | 'ia:view_report'
    // Administração
    | 'admin:users'
    | 'admin:csv'
    | 'admin:config';

export interface RoleDefinition {
    name: Role;
    permissions: Permission[];
    priority: number;
}

export const ROLES: Record<Role, RoleDefinition> = {
    guest: {
        name: 'guest',
        permissions: [],
        priority: 0
    },
    free: {
        name: 'free',
        permissions: [
            'game:generate',
            'game:view_history',
            'credits:view',
            'credits:buy',
            'ia:train',
            'ia:view_report'
        ],
        priority: 10
    },
    pro: {
        name: 'pro',
        permissions: [
            'game:generate',
            'game:view_history',
            'game:export_pdf',
            'game:bolao',
            'credits:view',
            'credits:buy',
            'ia:train',
            'ia:backtest',
            'ia:view_report'
        ],
        priority: 50
    },
    admin: {
        name: 'admin',
        permissions: [
            'game:generate',
            'game:view_history',
            'game:export_pdf',
            'game:bolao',
            'credits:view',
            'credits:buy',
            'ia:train',
            'ia:backtest',
            'ia:view_report',
            'admin:users',
            'admin:csv',
            'admin:config'
        ],
        priority: 90
    },
    super_admin: {
        name: 'super_admin',
        permissions: [
            'game:generate',
            'game:view_history',
            'game:export_pdf',
            'game:bolao',
            'credits:view',
            'credits:buy',
            'ia:train',
            'ia:backtest',
            'ia:view_report',
            'admin:users',
            'admin:csv',
            'admin:config'
        ],
        priority: 100
    }
};

export function getRolePermissions(role: Role): Permission[] {
    return ROLES[role]?.permissions || [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
    return getRolePermissions(role).includes(permission);
}

export function isAdmin(role: Role): boolean {
    return role === 'admin' || role === 'super_admin';
}
