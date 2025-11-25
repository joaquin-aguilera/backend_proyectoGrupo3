"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchParams = validateSearchParams;
const security_1 = require("../utils/security");
const ALLOWED_KEYS = new Set(['busqueda', 'precio', 'categoria', 'ubicacion', 'condicion', 'ordenar']);
const RANGOS_PRECIO = new Set(['hasta 50', 'entre 50 - 100', 'entre 100 - 300', 'entre 300 - 500', 'mas de 500']);
const ORDENAMIENTO_VALIDOS = new Set(['precio-asc', 'precio-desc']);
function validateSearchParams(req, res, next) {
    try {
        // 1) Bloquea llaves peligrosas ($, .) y no permitidas + anti-HPP (no arrays)
        const cleaned = (0, security_1.sanitizePlainObject)(req.query);
        for (const key of Object.keys(cleaned)) {
            if (!ALLOWED_KEYS.has(key)) {
                return res.status(400).json({ error: `Parámetro no permitido: ${key}` });
            }
            if (Array.isArray(cleaned[key])) {
                return res.status(400).json({ error: `Parámetro duplicado no permitido: ${key}` });
            }
        }
        // 2) Tipos y tamaños
        const busquedaRaw = cleaned.busqueda;
        const precioRaw = cleaned.precio;
        const categoriaRaw = cleaned.categoria;
        const ubicacionRaw = cleaned.ubicacion;
        const condicionRaw = cleaned.condicion;
        const ordenarRaw = cleaned.ordenar;
        if (busquedaRaw !== undefined && typeof busquedaRaw !== 'string') {
            return res.status(400).json({ error: 'busqueda debe ser string' });
        }
        if (categoriaRaw !== undefined && typeof categoriaRaw !== 'string') {
            return res.status(400).json({ error: 'categoria debe ser string' });
        }
        if (ubicacionRaw !== undefined && typeof ubicacionRaw !== 'string') {
            return res.status(400).json({ error: 'ubicacion debe ser string' });
        }
        if (condicionRaw !== undefined && typeof condicionRaw !== 'string') {
            return res.status(400).json({ error: 'condicion debe ser string' });
        }
        if (precioRaw !== undefined && typeof precioRaw !== 'string') {
            return res.status(400).json({ error: 'precio debe ser string' });
        }
        if (ordenarRaw !== undefined && typeof ordenarRaw !== 'string') {
            return res.status(400).json({ error: 'ordenar debe ser string' });
        }
        const busqueda = typeof busquedaRaw === 'string' ? busquedaRaw.trim() : undefined;
        const categoria = typeof categoriaRaw === 'string' ? categoriaRaw.trim() : undefined;
        const ubicacion = typeof ubicacionRaw === 'string' ? ubicacionRaw.trim() : undefined;
        const condicion = typeof condicionRaw === 'string' ? condicionRaw.trim() : undefined;
        const precio = typeof precioRaw === 'string' ? precioRaw.trim() : undefined;
        const ordenar = typeof ordenarRaw === 'string' ? ordenarRaw.trim() : undefined;
        if (busqueda && busqueda.length > 100)
            return res.status(400).json({ error: 'busqueda demasiado larga' });
        if (categoria && categoria.length > 50)
            return res.status(400).json({ error: 'categoria demasiado larga' });
        if (ubicacion && ubicacion.length > 50)
            return res.status(400).json({ error: 'ubicacion demasiado larga' });
        if (condicion && condicion.length > 20)
            return res.status(400).json({ error: 'condicion demasiado larga' });
        if (precio && !RANGOS_PRECIO.has(precio)) {
            return res.status(400).json({
                error: 'precio inválido (use: "hasta 50", "entre 50 - 100", "entre 100 - 300", "entre 300 - 500", "mas de 500")',
            });
        }
        if (ordenar && !ORDENAMIENTO_VALIDOS.has(ordenar)) {
            return res.status(400).json({
                error: 'ordenar inválido (use: "precio-asc" o "precio-desc")',
            });
        }
        // 3) Preparar valores seguros (escape regex)
        const safe_busqueda = busqueda ? (0, security_1.escapeRegex)(busqueda) : undefined;
        const safe_categoria = categoria ? (0, security_1.escapeRegex)(categoria) : undefined;
        const safe_ubicacion = ubicacion ? (0, security_1.escapeRegex)(ubicacion) : undefined;
        const safe_condicion = condicion ? (0, security_1.escapeRegex)(condicion) : undefined;
        // 4) Guardar query saneada para el controller
        req.searchQuery = {
            busqueda: safe_busqueda,
            precio,
            categoria: safe_categoria,
            ubicacion: safe_ubicacion,
            condicion: safe_condicion,
            ordenar,
        };
        return next();
    }
    catch (err) {
        console.error('validateSearchParams error:', err);
        return res.status(400).json({ error: 'Parámetros inválidos' });
    }
}
