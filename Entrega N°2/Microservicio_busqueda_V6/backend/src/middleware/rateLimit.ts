type Entry = { count: number; resetAt: number };

const windowMs = 60_000; // 1 minuto
const maxPerWindow = 60; // 60 req/min por IP
const bucket = new Map<string, Entry>();

export function rateLimit(req: any, res: any, next: any) {
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = bucket.get(key);

    if (!entry || now >= entry.resetAt) {
        bucket.set(key, { count: 1, resetAt: now + windowMs });
        return next();
    }

    if (entry.count >= maxPerWindow) {
        const retry = Math.max(0, Math.ceil((entry.resetAt - now) / 1000));
        res.setHeader('Retry-After', retry.toString());
        return res.status(429).json({ error: 'Too many requests' });
    }

    entry.count += 1;
    return next();
}