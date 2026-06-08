// ============================================
// core/value-objects/Credits.ts
// Value Object Credits (imutável)
// ============================================

export class Credits {
    private constructor(private readonly value: number) {}

    static create(value: number): Credits {
        if (value < 0) {
            throw new Error('Credits cannot be negative');
        }
        if (!Number.isInteger(value)) {
            throw new Error('Credits must be an integer');
        }
        return new Credits(value);
    }

    static zero(): Credits {
        return new Credits(0);
    }

    getValue(): number {
        return this.value;
    }

    add(amount: number): Credits {
        if (amount < 0) {
            throw new Error('Cannot add negative amount. Use subtract() instead.');
        }
        return new Credits(this.value + amount);
    }

    subtract(amount: number): Credits {
        if (amount < 0) {
            throw new Error('Cannot subtract negative amount. Use add() instead.');
        }
        if (this.value < amount) {
            throw new Error(`Insufficient credits: ${this.value} < ${amount}`);
        }
        return new Credits(this.value - amount);
    }

    canAfford(amount: number): boolean {
        return this.value >= amount;
    }

    equals(other: Credits): boolean {
        return this.value === other.value;
    }

    isZero(): boolean {
        return this.value === 0;
    }

    isPositive(): boolean {
        return this.value > 0;
    }

    toString(): string {
        return `R$ ${this.value}`;
    }

    toJSON(): number {
        return this.value;
    }
}
