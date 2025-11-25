"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCategoryName = exports.validateNumericParams = exports.validateSearchText = exports.sanitizeInputs = void 0;
const validator_1 = __importDefault(require("validator"));
/**
 * Middleware de sanitización avanzada para prevenir XSS y NoSQL injection
 */
// Lista blanca de caracteres permitidos en búsquedas
const SEARCH_ALLOWED_CHARS = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ.,\-_()]+$/;
// Patrones peligrosos de NoSQL injection
const NOSQL_INJECTION_PATTERNS = [
    /\$where/gi,
    /\$ne/gi,
    /\$gt/gi,
    /\$lt/gi,
    /\$or/gi,
    /\$and/gi,
    /\$regex/gi,
    /\$exists/gi,
    /javascript:/gi,
    /<script/gi,
    /eval\(/gi,
    /function\(/gi
];
/**
 * Sanitiza un string eliminando caracteres peligrosos
 */
function sanitizeString(input) {
    if (!input || typeof input !== 'string')
        return '';
    // Eliminar espacios extras
    let sanitized = input.trim();
    // Escapar HTML para prevenir XSS
    sanitized = validator_1.default.escape(sanitized);
    // Limitar longitud (máximo 200 caracteres)
    sanitized = sanitized.substring(0, 200);
    return sanitized;
}
/**
 * Verifica si un string contiene patrones de NoSQL injection
 */
function containsNoSQLInjection(input) {
    return NOSQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}
/**
 * Verifica si un string contiene solo caracteres permitidos
 */
function hasValidCharacters(input) {
    return SEARCH_ALLOWED_CHARS.test(input);
}
/**
 * Middleware principal de sanitización
 */
const sanitizeInputs = (req, res, next) => {
    try {
        // Sanitizar query parameters
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                const value = req.query[key];
                if (typeof value === 'string') {
                    // Verificar NoSQL injection
                    if (containsNoSQLInjection(value)) {
                        console.warn(`⚠️ Intento de NoSQL injection detectado en query.${key}: ${value}`);
                        res.status(400).json({
                            error: 'Parámetro inválido detectado',
                            message: 'La búsqueda contiene caracteres no permitidos'
                        });
                        return;
                    }
                    // Sanitizar el valor
                    req.query[key] = sanitizeString(value);
                }
            });
        }
        // Sanitizar body
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                const value = req.body[key];
                if (typeof value === 'string') {
                    // Verificar NoSQL injection
                    if (containsNoSQLInjection(value)) {
                        console.warn(`⚠️ Intento de NoSQL injection detectado en body.${key}: ${value}`);
                        res.status(400).json({
                            error: 'Datos inválidos detectados',
                            message: 'Los datos enviados contienen caracteres no permitidos'
                        });
                        return;
                    }
                    // Sanitizar el valor
                    req.body[key] = sanitizeString(value);
                }
            });
        }
        // Sanitizar params
        if (req.params) {
            Object.keys(req.params).forEach(key => {
                const value = req.params[key];
                if (typeof value === 'string') {
                    // Verificar NoSQL injection
                    if (containsNoSQLInjection(value)) {
                        console.warn(`⚠️ Intento de NoSQL injection detectado en params.${key}: ${value}`);
                        res.status(400).json({
                            error: 'Parámetro inválido detectado',
                            message: 'El parámetro contiene caracteres no permitidos'
                        });
                        return;
                    }
                    // Sanitizar el valor
                    req.params[key] = sanitizeString(value);
                }
            });
        }
        next();
    }
    catch (error) {
        console.error('❌ Error en sanitización:', error);
        res.status(500).json({
            error: 'Error al procesar la solicitud',
            message: 'Ha ocurrido un error interno'
        });
    }
};
exports.sanitizeInputs = sanitizeInputs;
/**
 * Middleware específico para validar búsquedas de texto
 */
const validateSearchText = (req, res, next) => {
    const searchText = req.query.busqueda || req.query.q || req.query.texto;
    if (searchText) {
        // Verificar longitud mínima
        if (searchText.length < 2) {
            res.status(400).json({
                error: 'Búsqueda muy corta',
                message: 'La búsqueda debe tener al menos 2 caracteres'
            });
            return;
        }
        // Verificar longitud máxima
        if (searchText.length > 100) {
            res.status(400).json({
                error: 'Búsqueda muy larga',
                message: 'La búsqueda no puede superar los 100 caracteres'
            });
            return;
        }
        // Verificar caracteres válidos
        if (!hasValidCharacters(searchText)) {
            res.status(400).json({
                error: 'Caracteres no permitidos',
                message: 'La búsqueda contiene caracteres no permitidos. Use solo letras, números y espacios.'
            });
            return;
        }
    }
    next();
};
exports.validateSearchText = validateSearchText;
/**
 * Middleware para validar números (precios, IDs, etc.)
 */
const validateNumericParams = (req, res, next) => {
    const numericParams = ['precio_min', 'precio_max', 'limit', 'page', 'limite'];
    for (const param of numericParams) {
        const value = req.query[param];
        if (value !== undefined) {
            // Verificar que sea un número válido
            if (!validator_1.default.isNumeric(value)) {
                res.status(400).json({
                    error: 'Parámetro inválido',
                    message: `El parámetro '${param}' debe ser un número válido`
                });
                return;
            }
            // Convertir a número
            const numValue = parseFloat(value);
            // Verificar que sea positivo
            if (numValue < 0) {
                res.status(400).json({
                    error: 'Parámetro inválido',
                    message: `El parámetro '${param}' debe ser un número positivo`
                });
                return;
            }
            // Verificar límites razonables
            if ((param === 'limit' || param === 'limite') && numValue > 10000) {
                res.status(400).json({
                    error: 'Límite excedido',
                    message: 'El límite máximo de resultados es 10000'
                });
                return;
            }
        }
    }
    next();
};
exports.validateNumericParams = validateNumericParams;
/**
 * Middleware para validar nombre de categoría en URL params
 */
const validateCategoryName = (req, res, next) => {
    const { category } = req.params;
    if (!category) {
        res.status(400).json({
            error: 'Categoría no especificada',
            message: 'Debes proporcionar una categoría válida'
        });
        return;
    }
    // Sanitizar categoría
    const sanitizedCategory = sanitizeString(category);
    // Validar longitud
    if (sanitizedCategory.length > 50) {
        res.status(400).json({
            error: 'Categoría inválida',
            message: 'El nombre de la categoría es demasiado largo'
        });
        return;
    }
    // Validar caracteres permitidos para categorías
    const categoryRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/;
    if (!categoryRegex.test(sanitizedCategory)) {
        res.status(400).json({
            error: 'Categoría inválida',
            message: 'El nombre de la categoría contiene caracteres no permitidos'
        });
        return;
    }
    // Reemplazar el parámetro con la versión sanitizada
    req.params.category = sanitizedCategory;
    next();
};
exports.validateCategoryName = validateCategoryName;
exports.default = {
    sanitizeInputs: exports.sanitizeInputs,
    validateSearchText: exports.validateSearchText,
    validateNumericParams: exports.validateNumericParams,
    validateCategoryName: exports.validateCategoryName
};
