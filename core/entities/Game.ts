// ============================================
// core/entities/Game.ts
// Entidade Game (jogo gerado)
// ============================================

export type AIMode = 'ia_especialista' | 'aleatorio_inteligente' | 'probabilistico' | 'aleatorio_puro';
export type LotteryId = 'megasena' | 'quina' | 'lotofacil' | 'lotomania' | 'duplasena' | 'timemania' | 'milionaria' | 'loteca' | 'diadesorte' | 'supersete';

export interface GameProps {
    id: string;
    userId: string;
    lottery: LotteryId;
    numbers: number[][];
    mode: AIMode;
    creditsCost: number;
    filters: Record<string, any>;
    metadata: Record<string, any>;
    requestHash: string;
    clientIp: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export class Game {
    private constructor(private props: GameProps) {}

    static create(props: Omit<GameProps, 'id' | 'createdAt'>): Game {
        return new Game({
            id: crypto.randomUUID(),
            userId: props.userId,
            lottery: props.lottery,
            numbers: props.numbers,
            mode: props.mode,
            creditsCost: props.creditsCost,
            filters: props.filters || {},
            metadata: props.metadata || {},
            requestHash: props.requestHash,
            clientIp: props.clientIp || null,
            userAgent: props.userAgent || null,
            createdAt: new Date()
        });
    }

    static restore(props: GameProps): Game {
        return new Game(props);
    }

    // Getters
    get id(): string { return this.props.id; }
    get userId(): string { return this.props.userId; }
    get lottery(): LotteryId { return this.props.lottery; }
    get numbers(): number[][] { return this.props.numbers; }
    get mode(): AIMode { return this.props.mode; }
    get creditsCost(): number { return this.props.creditsCost; }
    get filters(): Record<string, any> { return this.props.filters; }
    get metadata(): Record<string, any> { return this.props.metadata; }
    get requestHash(): string { return this.props.requestHash; }
    get clientIp(): string | null { return this.props.clientIp; }
    get userAgent(): string | null { return this.props.userAgent; }
    get createdAt(): Date { return this.props.createdAt; }

    // Métodos de negócio
    getFormattedNumbers(): string[] {
        return this.props.numbers.map(jogo => 
            jogo.map(n => String(n).padStart(2, '0')).join(' • ')
        );
    }

    toJSON() {
        return {
            id: this.props.id,
            userId: this.props.userId,
            lottery: this.props.lottery,
            numbers: this.props.numbers,
            mode: this.props.mode,
            creditsCost: this.props.creditsCost,
            filters: this.props.filters,
            metadata: this.props.metadata,
            requestHash: this.props.requestHash,
            clientIp: this.props.clientIp,
            userAgent: this.props.userAgent,
            createdAt: this.props.createdAt.toISOString()
        };
    }
}
