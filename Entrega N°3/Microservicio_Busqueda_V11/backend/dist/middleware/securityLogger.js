"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityEvent = exports.logValidationError = exports.logUnauthorizedAccess = exports.detectSuspiciousActivity = exports.logAccess = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Directorio para logs de seguridad
const LOGS_DIR = path_1.default.join(__dirname, '../../logs');
const SECURITY_LOG_FILE = path_1.default.join(LOGS_DIR, 'security.log');
const ACCESS_LOG_FILE = path_1.default.join(LOGS_DIR, 'access.log');
// Crear directorio de logs si no existe
if (!fs_1.default.existsSync(LOGS_DIR)) {
    fs_1.default.mkdirSync(LOGS_DIR, { recursive: true });
}
/**
 * Escribe un evento de seguridad en el log
 */
function writeSecurityLog(event) {
    const logEntry = `[${event.timestamp}] [${event.type}] IP: ${event.ip} | User: ${event.userId || 'N/A'} | ${event.method} ${event.endpoint} | ${event.message} | UA: ${event.userAgent || 'N/A'}\n`;
    fs_1.default.appendFile(SECURITY_LOG_FILE, logEntry, (err) => {
        if (err) {
            console.error('❌ Error al escribir log de seguridad:', err);
        }
    });
    // También imprimir en consola si es crítico
    if (event.type === 'CRITICAL' || event.type === 'ERROR') {
        console.error('🔴 EVENTO DE SEGURIDAD:', logEntry);
    }
    else if (event.type === 'WARNING') {
        console.warn('🟡 ADVERTENCIA DE SEGURIDAD:', logEntry);
    }
}
/**
 * Escribe un evento de acceso en el log
 */
function writeAccessLog(req, res, responseTime) {
    const logEntry = `[${new Date().toISOString()}] ${req.ip} | ${req.userId || 'ANON'} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${responseTime}ms | UA: ${req.get('user-agent') || 'N/A'}\n`;
    fs_1.default.appendFile(ACCESS_LOG_FILE, logEntry, (err) => {
        if (err) {
            console.error('❌ Error al escribir log de acceso:', err);
        }
    });
}
/**
 * Obtiene la IP real del cliente (considerando proxies)
 */
function getClientIp(req) {
    var _a;
    return (((_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) ||
        req.headers['x-real-ip'] ||
        req.socket.remoteAddress ||
        'Unknown');
}
/**
 * Middleware para registrar todos los accesos
 */
const logAccess = (req, res, next) => {
    const startTime = Date.now();
    // Registrar cuando la respuesta se complete
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        writeAccessLog(req, res, responseTime);
    });
    next();
};
exports.logAccess = logAccess;
/**
 * Middleware para detectar y registrar intentos sospechosos
 */
const detectSuspiciousActivity = (req, res, next) => {
    const ip = getClientIp(req);
    const userAgent = req.get('user-agent') || 'N/A';
    // Patrones sospechosos
    const suspiciousPatterns = [
        /\.\.\//g, // Directory traversal
        /<script/gi, // XSS attempts
        /union.*select/gi, // SQL injection
        /\$where/gi, // NoSQL injection
        /eval\(/gi, // Code injection
        /javascript:/gi, // XSS
        /onerror=/gi, // XSS
        /onclick=/gi, // XSS
    ];
    // Verificar URL
    const fullUrl = req.originalUrl;
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(fullUrl)) {
            writeSecurityLog({
                timestamp: new Date().toISOString(),
                type: 'WARNING',
                ip,
                userId: req.userId,
                endpoint: req.originalUrl,
                method: req.method,
                message: `Patrón sospechoso detectado en URL: ${pattern}`,
                userAgent
            });
            break;
        }
    }
    // Verificar body
    if (req.body) {
        const bodyStr = JSON.stringify(req.body);
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(bodyStr)) {
                writeSecurityLog({
                    timestamp: new Date().toISOString(),
                    type: 'WARNING',
                    ip,
                    userId: req.userId,
                    endpoint: req.originalUrl,
                    method: req.method,
                    message: `Patrón sospechoso detectado en body: ${pattern}`,
                    userAgent,
                    additionalData: { body: req.body }
                });
                break;
            }
        }
    }
    // Verificar query params
    if (req.query) {
        const queryStr = JSON.stringify(req.query);
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(queryStr)) {
                writeSecurityLog({
                    timestamp: new Date().toISOString(),
                    type: 'WARNING',
                    ip,
                    userId: req.userId,
                    endpoint: req.originalUrl,
                    method: req.method,
                    message: `Patrón sospechoso detectado en query: ${pattern}`,
                    userAgent,
                    additionalData: { query: req.query }
                });
                break;
            }
        }
    }
    next();
};
exports.detectSuspiciousActivity = detectSuspiciousActivity;
/**
 * Registra un intento de acceso no autorizado
 */
const logUnauthorizedAccess = (req, endpoint, reason) => {
    writeSecurityLog({
        timestamp: new Date().toISOString(),
        type: 'CRITICAL',
        ip: getClientIp(req),
        userId: req.userId,
        endpoint,
        method: req.method,
        message: `Intento de acceso no autorizado: ${reason}`,
        userAgent: req.get('user-agent')
    });
};
exports.logUnauthorizedAccess = logUnauthorizedAccess;
/**
 * Registra un error de validación
 */
const logValidationError = (req, field, value, reason) => {
    writeSecurityLog({
        timestamp: new Date().toISOString(),
        type: 'WARNING',
        ip: getClientIp(req),
        userId: req.userId,
        endpoint: req.originalUrl,
        method: req.method,
        message: `Error de validación en campo '${field}': ${reason}`,
        userAgent: req.get('user-agent'),
        additionalData: { field, value }
    });
};
exports.logValidationError = logValidationError;
/**
 * Registra un evento de seguridad personalizado
 */
const logSecurityEvent = (req, type, message, additionalData) => {
    writeSecurityLog({
        timestamp: new Date().toISOString(),
        type,
        ip: getClientIp(req),
        userId: req.userId,
        endpoint: req.originalUrl,
        method: req.method,
        message,
        userAgent: req.get('user-agent'),
        additionalData
    });
};
exports.logSecurityEvent = logSecurityEvent;
exports.default = {
    logAccess: exports.logAccess,
    detectSuspiciousActivity: exports.detectSuspiciousActivity,
    logUnauthorizedAccess: exports.logUnauthorizedAccess,
    logValidationError: exports.logValidationError,
    logSecurityEvent: exports.logSecurityEvent
};
