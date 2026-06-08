// ============================================
// core/ia/AdvancedLotteryAI.ts
// Classe de IA para loterias
// ============================================

export interface ScoreResult {
    numero: number;
    score: number;
    atraso: number;
}

export class AdvancedLotteryAI {
    private dados: number[][];
    private maxNumero: number;
    private loteriaNome: string;
    private incluirZero: boolean;
    private minNumero: number;
    private treinado: boolean = false;
    private confianca: number = 0;

    constructor(dados: number[][], maxNumero: number, loteriaNome: string) {
        this.dados = dados;
        this.maxNumero = maxNumero;
        this.loteriaNome = loteriaNome;
        
        const loteriasComZero = ['lotomania', 'loteca', 'supersete'];
        this.incluirZero = loteriasComZero.includes(loteriaNome.toLowerCase());
        this.minNumero = this.incluirZero ? 0 : 1;
    }

    private calcularFrequenciaPonderada(): { numero: number; frequencia: number }[] {
        const total = this.dados.length;
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        const freq = new Array(limite).fill(0);
        
        for (let i = 0; i < this.dados.length; i++) {
            const peso = Math.pow(1.2, i / total);
            for (const n of this.dados[i]) {
                if (n >= 0 && n < limite) freq[n] += peso;
            }
        }
        
        const maxFreq = Math.max(...freq.slice(this.minNumero));
        const res: { numero: number; frequencia: number }[] = [];
        
        for (let n = this.minNumero; n < limite; n++) {
            res.push({
                numero: n,
                frequencia: maxFreq > 0 ? freq[n] / maxFreq : 0
            });
        }
        
        return res;
    }

    private calcularAtraso(): { numero: number; atraso: number; fator: number }[] {
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        const atraso = new Array(limite).fill(this.dados.length);
        
        for (let n = this.minNumero; n < limite; n++) {
            for (let i = this.dados.length - 1; i >= 0; i--) {
                if (this.dados[i].includes(n)) {
                    atraso[n] = this.dados.length - 1 - i;
                    break;
                }
            }
        }
        
        const maxAtraso = Math.max(...atraso.slice(this.minNumero));
        const res: { numero: number; atraso: number; fator: number }[] = [];
        
        for (let n = this.minNumero; n < limite; n++) {
            res.push({
                numero: n,
                atraso: atraso[n],
                fator: maxAtraso > 0 ? atraso[n] / maxAtraso : 0
            });
        }
        
        return res;
    }

    private calcularScoreCompleto(): ScoreResult[] {
        const freq = this.calcularFrequenciaPonderada();
        const atraso = this.calcularAtraso();
        const scores: ScoreResult[] = [];
        
        for (let i = 0; i < freq.length; i++) {
            const score = (1 - freq[i].frequencia) * 50 + atraso[i].fator * 50;
            scores.push({
                numero: freq[i].numero,
                score: score,
                atraso: atraso[i].atraso
            });
        }
        
        return scores.sort((a, b) => b.score - a.score);
    }

    treinar(): boolean {
        if (this.dados.length < 10) return false;
        this.treinado = true;
        this.confianca = Math.min(95, Math.floor(this.dados.length / 10) + 50);
        return true;
    }

    predizerIAEspecialista(
        qtd: number,
        usarDispersao: boolean = true,
        windowDispersao: number = 10,
        seed: number = 0
    ): number[] {
        if (!this.treinado) return this.predizerAleatorio(qtd);
        
        const scores = this.calcularScoreCompleto();
        const ruido = (seed % 100) / 100;
        let scoresRuido = scores.map(s => ({
            ...s,
            score: s.score * (0.7 + ruido + Math.random() * 0.6)
        }));
        
        if (usarDispersao && this.dados.length >= windowDispersao) {
            const recentes = new Set<number>();
            this.dados.slice(-windowDispersao).forEach(jogo => {
                jogo.forEach(n => recentes.add(n));
            });
            scoresRuido = scoresRuido.map(s => ({
                ...s,
                score: recentes.has(s.numero) ? s.score * 0.1 : s.score
            }));
        }
        
        scoresRuido.sort((a, b) => b.score - a.score);
        
        const candidatos = scoresRuido.slice(0, Math.max(qtd * 2, 20));
        const resultado = new Set<number>();
        
        while (resultado.size < qtd && candidatos.length > 0) {
            const idx = Math.floor(Math.random() * candidatos.length);
            resultado.add(candidatos[idx].numero);
            candidatos.splice(idx, 1);
        }
        
        if (resultado.size < qtd) {
            const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
            const todos = Array.from(
                { length: limite - this.minNumero },
                (_, i) => i + this.minNumero
            );
            const disp = todos.filter(n => !resultado.has(n));
            while (resultado.size < qtd && disp.length > 0) {
                const idx = Math.floor(Math.random() * disp.length);
                resultado.add(disp[idx]);
                disp.splice(idx, 1);
            }
        }
        
        return Array.from(resultado).sort((a, b) => a - b);
    }

    predizerAleatorio(qtd: number): number[] {
        const res = new Set<number>();
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        
        while (res.size < qtd) {
            const num = Math.floor(Math.random() * (limite - this.minNumero) + this.minNumero);
            res.add(num);
        }
        
        return Array.from(res).sort((a, b) => a - b);
    }

    get isTrained(): boolean {
        return this.treinado;
    }

    get confidence(): number {
        return this.confianca;
    }
}
