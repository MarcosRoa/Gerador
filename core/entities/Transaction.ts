// ============================================
// core/entities/Transaction.ts
// Entidade Transaction (transação financeira)
// ============================================

export type TransactionType = 'compra' | 'uso' | 'pro_ativacao' | 'reembolso';

export interface TransactionProps {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string | null;
    referenceId: string | null;
    metadata: Record<string, any>;
    createdAt: Date;
}

export class Transaction {
    private constructor(private props: TransactionProps) {}

    static create(props: Omit<TransactionProps, 'id' | 'createdAt'>): Transaction {
        return new Transaction({
            id: crypto.randomUUID(),
            userId: props.userId,
            type: props.type,
            amount: props.amount,
            balanceBefore: props.balanceBefore,
            balanceAfter: props.balanceAfter,
            description: props.description || null,
            referenceId: props.referenceId || null,
            metadata: props.metadata || {},
            createdAt: new Date()
        });
    }

    static restore(props: TransactionProps): Transaction {
        return new Transaction(props);
    }

    // Getters
    get id(): string { return this.props.id; }
    get userId(): string { return this.props.userId; }
    get type(): TransactionType { return this.props.type; }
    get amount(): number { return this.props.amount; }
    get balanceBefore(): number { return this.props.balanceBefore; }
    get balanceAfter(): number { return this.props.balanceAfter; }
    get description(): string | null { return this.props.description; }
    get referenceId(): string | null { return this.props.referenceId; }
    get metadata(): Record<string, any> { return this.props.metadata; }
    get createdAt(): Date { return this.props.createdAt; }

    // Métodos de negócio
    isCredit(): boolean {
        return this.props.amount > 0;
    }

    isDebit(): boolean {
        return this.props.amount < 0;
    }

    getAbsoluteAmount(): number {
        return Math.abs(this.props.amount);
    }

    toJSON() {
        return {
            id: this.props.id,
            userId: this.props.userId,
            type: this.props.type,
            amount: this.props.amount,
            balanceBefore: this.props.balanceBefore,
            balanceAfter: this.props.balanceAfter,
            description: this.props.description,
            referenceId: this.props.referenceId,
            metadata: this.props.metadata,
            createdAt: this.props.createdAt.toISOString()
        };
    }
}
