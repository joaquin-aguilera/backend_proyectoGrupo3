"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchTrends = exports.getTopSearchTerms = exports.getSearchStats = exports.getTopProducts = void 0;
const analyticsService_1 = require("../services/analyticsService");
/**
 * Obtiene los productos más buscados
 * @route GET /api/analytics/top-products
 */
const getTopProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
        const limitSafe = Math.min(Math.max(limit, 1), 20); // Entre 1 y 20
        const topProducts = yield analyticsService_1.AnalyticsService.getTopSearchedProducts(limitSafe);
        const endTime = Date.now();
        console.log(`Top productos obtenidos en ${endTime - startTime}ms`);
        res.json({
            success: true,
            total: topProducts.length,
            productos: topProducts
        });
    }
    catch (error) {
        console.error('Error al obtener top productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos más buscados'
        });
    }
});
exports.getTopProducts = getTopProducts;
/**
 * Obtiene estadísticas generales de búsquedas
 * @route GET /api/analytics/stats
 */
const getSearchStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield analyticsService_1.AnalyticsService.getSearchStats();
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas de búsquedas'
        });
    }
});
exports.getSearchStats = getSearchStats;
/**
 * Obtiene los términos de búsqueda más populares
 * @route GET /api/analytics/top-terms
 */
const getTopSearchTerms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const limitSafe = Math.min(Math.max(limit, 1), 50);
        const topTerms = yield analyticsService_1.AnalyticsService.getTopSearchTerms(limitSafe);
        res.json({
            success: true,
            total: topTerms.length,
            terms: topTerms
        });
    }
    catch (error) {
        console.error('Error al obtener términos populares:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener términos de búsqueda populares'
        });
    }
});
exports.getTopSearchTerms = getTopSearchTerms;
/**
 * Obtiene tendencias de búsqueda por período
 * @route GET /api/analytics/trends
 */
const getSearchTrends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const days = req.query.days ? parseInt(req.query.days, 10) : 7;
        const daysSafe = Math.min(Math.max(days, 1), 90); // Entre 1 y 90 días
        const trends = yield analyticsService_1.AnalyticsService.getSearchTrends(daysSafe);
        res.json({
            success: true,
            period: `${daysSafe} días`,
            total: trends.length,
            trends
        });
    }
    catch (error) {
        console.error('Error al obtener tendencias:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener tendencias de búsqueda'
        });
    }
});
exports.getSearchTrends = getSearchTrends;
exports.default = {
    getTopProducts: exports.getTopProducts,
    getSearchStats: exports.getSearchStats,
    getTopSearchTerms: exports.getTopSearchTerms,
    getSearchTrends: exports.getSearchTrends
};
