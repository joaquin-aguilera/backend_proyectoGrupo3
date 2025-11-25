"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strictLimiter = exports.authLimiter = exports.writeLimiter = exports.searchLimiter = exports.globalLimiter = void 0;
exports.rateLimit = rateLimit;
const windowMs = 60000;
const maxPerWindow = 60;
const bucket = new Map();
function rateLimit(req, res, next) {
    var _a;
    const key = req.ip || ((_a = req.connection) === null || _a === void 0 ? void 0 : _a.remoteAddress) || 'unknown';
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
// ============================================
// NUEVAS IMPLEMENTACIONES CON express-rate-limit
// ============================================
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Rate limiter global para todas las rutas
 */
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Demasiadas solicitudes',
        message: 'Has excedido el límite de solicitudes. Por favor, espera unos minutos.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const ip = req.ip || req.socket.remoteAddress || 'Unknown';
        console.warn(`⚠️ Rate limit global excedido para IP: ${ip} en ${req.originalUrl}`);
        res.status(429).json({
            error: 'Demasiadas solicitudes',
            message: 'Has excedido el límite de solicitudes. Por favor, espera 15 minutos.',
            retryAfter: '15 minutos'
        });
    }
});
/**
 * Rate limiter estricto para búsquedas
 */
exports.searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: {
        error: 'Demasiadas búsquedas',
        message: 'Has realizado demasiadas búsquedas. Por favor, espera un minuto.',
        retryAfter: '1 minuto'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const ip = req.ip || req.socket.remoteAddress || 'Unknown';
        console.warn(`⚠️ Rate limit de búsqueda excedido para IP: ${ip}`);
        res.status(429).json({
            error: 'Demasiadas búsquedas',
            message: 'Has realizado demasiadas búsquedas. Por favor, espera un minuto.',
            retryAfter: '1 minuto'
        });
    }
});
/**
 * Rate limiter para endpoints de escritura
 */
exports.writeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: {
        error: 'Demasiadas operaciones de escritura',
        message: 'Has realizado demasiadas operaciones. Por favor, espera unos minutos.',
        retryAfter: '5 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const ip = req.ip || req.socket.remoteAddress || 'Unknown';
        console.warn(`⚠️ Rate limit de escritura excedido para IP: ${ip}`);
        res.status(429).json({
            error: 'Demasiadas operaciones de escritura',
            message: 'Has realizado demasiadas operaciones. Por favor, espera unos minutos.',
            retryAfter: '5 minutos'
        });
    }
});
/**
 * Rate limiter para autenticación
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Demasiados intentos de autenticación',
        message: 'Has realizado demasiados intentos. Por favor, espera 15 minutos.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        const ip = req.ip || req.socket.remoteAddress || 'Unknown';
        console.error(`🔴 Rate limit de autenticación excedido para IP: ${ip}`);
        res.status(429).json({
            error: 'Demasiados intentos de autenticación',
            message: 'Has realizado demasiados intentos. Por favor, espera 15 minutos.',
            retryAfter: '15 minutos'
        });
    }
});
/**
 * Rate limiter muy estricto para operaciones sensibles
 */
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        error: 'Límite de operaciones excedido',
        message: 'Has excedido el límite de operaciones sensibles. Espera 1 hora.',
        retryAfter: '1 hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const ip = req.ip || req.socket.remoteAddress || 'Unknown';
        console.error(`🔴 Rate limit estricto excedido para IP: ${ip}`);
        res.status(429).json({
            error: 'Límite de operaciones excedido',
            message: 'Has excedido el límite de operaciones sensibles. Espera 1 hora.',
            retryAfter: '1 hora'
        });
    }
});
exports.default = {
    rateLimit, // Exportar el original también
    globalLimiter: // Exportar el original también
    exports.globalLimiter,
    searchLimiter: exports.searchLimiter,
    writeLimiter: exports.writeLimiter,
    authLimiter: exports.authLimiter,
    strictLimiter: exports.strictLimiter
};
