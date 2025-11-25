"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeRegex = escapeRegex;
exports.sanitizePlainObject = sanitizePlainObject;
exports.deepSanitize = deepSanitize;
// ...existing code...
function escapeRegex(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function sanitizePlainObject(obj) {
    const clean = {};
    for (const [k, v] of Object.entries(obj || {})) {
        if (k.includes('$') || k.includes('.'))
            continue;
        clean[k] = v;
    }
    return clean;
}
// Limpieza profunda por si llegan objetos anidados en el futuro
function deepSanitize(value) {
    if (Array.isArray(value))
        return value.map((v) => deepSanitize(v));
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (k.includes('$') || k.includes('.'))
                continue;
            out[k] = deepSanitize(v);
        }
        return out;
    }
    return value;
}
