// ============================================
// security/antifraud/botDetector.ts
// Detecção básica de bots
// ============================================

export interface BotDetectionResult {
    isBot: boolean;
    reason?: string;
    score: number; // 0-100, quanto maior mais suspeito
}

export class BotDetector {
    private static readonly BOT_PATTERNS = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /headless/i,
        /puppeteer/i,
        /selenium/i,
        /phantom/i,
        /curl/i,
        /wget/i,
        /python/i,
        /java/i,
        /perl/i,
        /ruby/i,
        /go-http/i,
        /axios/i,
        /node-fetch/i,
        /postman/i,
        /insomnia/i
    ];

    private static readonly HEADLESS_PATTERNS = [
        /HeadlessChrome/i,
        /Headless/i
    ];

    private static readonly LEGITIMATE_BOTS = [
        /googlebot/i,
        /bingbot/i,
        /slurp/i,
        /duckduckbot/i,
        /baiduspider/i,
        /yandexbot/i,
        /facebookexternalhit/i,
        /twitterbot/i,
        /whatsapp/i,
        /telegrambot/i
    ];

    static detect(userAgent: string | null, ip: string, headers: Record<string, string>): BotDetectionResult {
        let score = 0;
        const reasons: string[] = [];

        // Verificar se é bot legítimo (Google, Bing, etc.)
        if (userAgent) {
            for (const pattern of this.LEGITIMATE_BOTS) {
                if (pattern.test(userAgent)) {
                    return { isBot: false, score: 0, reason: 'Legitimate crawler' };
                }
            }
        }

        if (!userAgent) {
            score += 50;
            reasons.push('Missing User-Agent');
        } else {
            // Verificar padrões de bot
            for (const pattern of this.BOT_PATTERNS) {
                if (pattern.test(userAgent)) {
                    score += 30;
                    reasons.push(`User-Agent matches bot pattern: ${pattern}`);
                    break;
                }
            }

            // Verificar headless browsers
            for (const pattern of this.HEADLESS_PATTERNS) {
                if (pattern.test(userAgent)) {
                    score += 40;
                    reasons.push(`Headless browser detected: ${pattern}`);
                    break;
                }
            }

            // User-Agent muito curto
            if (userAgent.length < 20) {
                score += 20;
                reasons.push('User-Agent too short');
            }
        }

        // Verificar headers suspeitos
        if (!headers['accept-language']) {
            score += 10;
            reasons.push('Missing Accept-Language');
        }

        if (headers['sec-ch-ua'] && !headers['sec-ch-ua-mobile']) {
            score += 5;
        }

        // Limitar score máximo
        score = Math.min(100, score);

        return {
            isBot: score >= 60,
            reason: reasons.join('; '),
            score
        };
    }

    static generateFingerprint(req: any): string {
        const parts = [
            req.headers['user-agent'] || '',
            req.headers['accept-language'] || '',
            req.headers['sec-ch-ua'] || '',
            req.headers['sec-ch-ua-platform'] || '',
            req.ip || req.socket?.remoteAddress || ''
        ];
        const combined = parts.join('|');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash) + combined.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(16);
    }

    static isLikelyHuman(userAgent: string | null, headers: Record<string, string>): boolean {
        const result = this.detect(userAgent, '', headers);
        return !result.isBot && result.score < 40;
    }
}
