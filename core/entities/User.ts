// ============================================
// core/entities/User.ts
// Entidade User (domínio puro)
// ============================================

export type UserRole = 'free' | 'pro' | 'admin' | 'super_admin';

export interface UserProps {
    id: string;
    firebaseUid: string;
    name: string;
    email: string;
    photoUrl: string | null;
    role: UserRole;
    credits: number;
    isPro: boolean;
    proExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export class User {
    private constructor(private props: UserProps) {}

    static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
        return new User({
            id: crypto.randomUUID(),
            firebaseUid: props.firebaseUid,
            name: props.name,
            email: props.email,
            photoUrl: props.photoUrl || null,
            role: props.role || 'free',
            credits: props.credits ?? 5,
            isPro: props.isPro ?? false,
            proExpiresAt: props.proExpiresAt || null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    static restore(props: UserProps): User {
        return new User(props);
    }

    // Getters
    get id(): string { return this.props.id; }
    get firebaseUid(): string { return this.props.firebaseUid; }
    get name(): string { return this.props.name; }
    get email(): string { return this.props.email; }
    get photoUrl(): string | null { return this.props.photoUrl; }
    get role(): UserRole { return this.props.role; }
    get credits(): number { return this.props.credits; }
    get isPro(): boolean { return this.props.isPro; }
    get proExpiresAt(): Date | null { return this.props.proExpiresAt; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    // Métodos de negócio
    isAdmin(): boolean {
        return this.props.role === 'admin' || this.props.role === 'super_admin';
    }

    hasActivePro(): boolean {
        if (!this.props.isPro) return false;
        if (!this.props.proExpiresAt) return true;
        return this.props.proExpiresAt > new Date();
    }

    updateName(newName: string): User {
        return new User({
            ...this.props,
            name: newName,
            updatedAt: new Date()
        });
    }

    activatePro(expiresAt: Date): User {
        return new User({
            ...this.props,
            isPro: true,
            proExpiresAt: expiresAt,
            updatedAt: new Date()
        });
    }

    toJSON() {
        return {
            id: this.props.id,
            firebaseUid: this.props.firebaseUid,
            name: this.props.name,
            email: this.props.email,
            photoUrl: this.props.photoUrl,
            role: this.props.role,
            credits: this.props.credits,
            isPro: this.props.isPro,
            proExpiresAt: this.props.proExpiresAt?.toISOString(),
            createdAt: this.props.createdAt.toISOString(),
            updatedAt: this.props.updatedAt.toISOString()
        };
    }
}
