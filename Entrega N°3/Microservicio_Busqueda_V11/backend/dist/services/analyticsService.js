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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const Search_1 = __importDefault(require("../models/Search"));
const productsService_1 = require("./productsService");
/**
 * Servicio para generar analíticas de búsquedas y productos
 */
class AnalyticsService {
    /**
     * Obtiene los productos más buscados basándose en el historial de búsquedas
     * @param limit Número de productos a retornar (default: 6)
     * @returns Array de productos con su conteo de búsquedas
     */
    static getTopSearchedProducts() {
        return __awaiter(this, arguments, void 0, function* (limit = 6) {
            try {
                // Agregación para contar cuántas veces aparece cada productId en los resultados
                const topProducts = yield Search_1.default.aggregate([
                    // Descomponer el array de results
                    { $unwind: '$results' },
                    // Agrupar por productId y contar
                    {
                        $group: {
                            _id: '$results.productId',
                            searchCount: { $sum: 1 },
                            lastSearched: { $max: '$requestedAt' }
                        }
                    },
                    // Ordenar por cantidad de búsquedas (descendente)
                    { $sort: { searchCount: -1 } },
                    // Limitar resultados
                    { $limit: limit },
                    // Proyectar campos finales
                    {
                        $project: {
                            _id: 0,
                            productId: '$_id',
                            searchCount: 1,
                            lastSearched: 1
                        }
                    }
                ]);
                // Si no hay datos, retornar array vacío
                if (topProducts.length === 0) {
                    console.log('⚠️ No hay búsquedas registradas aún');
                    return [];
                }
                // Obtener información completa de los productos desde la API
                const productosCompletos = yield productsService_1.productsService.getProductos();
                // Mapear los productos más buscados con su información completa
                const topProductsWithInfo = topProducts
                    .map(item => {
                    const producto = productosCompletos.find(p => p.id_producto.toString() === item.productId);
                    if (!producto) {
                        console.warn(`⚠️ Producto ${item.productId} no encontrado en la API`);
                        return null;
                    }
                    return {
                        productId: item.productId,
                        searchCount: item.searchCount,
                        lastSearched: item.lastSearched,
                        producto: producto
                    };
                })
                    .filter(item => item !== null); // Filtrar productos no encontrados
                console.log(`✅ Top ${topProductsWithInfo.length} productos más buscados obtenidos`);
                return topProductsWithInfo;
            }
            catch (error) {
                console.error('❌ Error al obtener productos más buscados:', error);
                throw error;
            }
        });
    }
    /**
     * Obtiene estadísticas generales de búsquedas
     */
    static getSearchStats() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const stats = yield Search_1.default.aggregate([
                    {
                        $facet: {
                            totalSearches: [{ $count: 'count' }],
                            searchesByCategory: [
                                { $match: { 'filters.categoria': { $exists: true, $ne: null } } },
                                { $group: { _id: '$filters.categoria', count: { $sum: 1 } } },
                                { $sort: { count: -1 } }
                            ],
                            searchesByCondition: [
                                { $match: { 'filters.condicion': { $exists: true, $ne: null } } },
                                { $group: { _id: '$filters.condicion', count: { $sum: 1 } } },
                                { $sort: { count: -1 } }
                            ],
                            recentSearches: [
                                { $sort: { requestedAt: -1 } },
                                { $limit: 10 },
                                {
                                    $project: {
                                        queryText: 1,
                                        requestedAt: 1,
                                        resultsCount: { $size: '$results' }
                                    }
                                }
                            ]
                        }
                    }
                ]);
                return {
                    totalSearches: ((_a = stats[0].totalSearches[0]) === null || _a === void 0 ? void 0 : _a.count) || 0,
                    searchesByCategory: stats[0].searchesByCategory,
                    searchesByCondition: stats[0].searchesByCondition,
                    recentSearches: stats[0].recentSearches
                };
            }
            catch (error) {
                console.error('❌ Error al obtener estadísticas:', error);
                throw error;
            }
        });
    }
    /**
     * Obtiene los términos de búsqueda más populares
     * @param limit Número de términos a retornar
     */
    static getTopSearchTerms() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            try {
                const topTerms = yield Search_1.default.aggregate([
                    // Filtrar búsquedas con texto real (no navegación por categoría)
                    {
                        $match: {
                            queryText: {
                                $exists: true,
                                $nin: ['[navegación por categoría/filtros]', '']
                            }
                        }
                    },
                    // Agrupar por término de búsqueda
                    {
                        $group: {
                            _id: { $toLower: '$queryText' },
                            count: { $sum: 1 },
                            lastSearched: { $max: '$requestedAt' }
                        }
                    },
                    // Ordenar por frecuencia
                    { $sort: { count: -1 } },
                    // Limitar resultados
                    { $limit: limit },
                    // Proyectar
                    {
                        $project: {
                            _id: 0,
                            term: '$_id',
                            count: 1,
                            lastSearched: 1
                        }
                    }
                ]);
                console.log(`✅ Top ${topTerms.length} términos de búsqueda obtenidos`);
                return topTerms;
            }
            catch (error) {
                console.error('❌ Error al obtener términos populares:', error);
                throw error;
            }
        });
    }
    /**
     * Obtiene tendencias de búsqueda por período
     * @param days Número de días atrás para analizar
     */
    static getSearchTrends() {
        return __awaiter(this, arguments, void 0, function* (days = 7) {
            try {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                const trends = yield Search_1.default.aggregate([
                    // Filtrar por fecha
                    { $match: { requestedAt: { $gte: startDate } } },
                    // Agrupar por día
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: '%Y-%m-%d',
                                    date: '$requestedAt'
                                }
                            },
                            count: { $sum: 1 },
                            uniqueUsers: { $addToSet: '$userId' }
                        }
                    },
                    // Ordenar por fecha
                    { $sort: { _id: 1 } },
                    // Proyectar
                    {
                        $project: {
                            _id: 0,
                            date: '$_id',
                            searches: '$count',
                            uniqueUsers: { $size: '$uniqueUsers' }
                        }
                    }
                ]);
                console.log(`✅ Tendencias de búsqueda para últimos ${days} días obtenidas`);
                return trends;
            }
            catch (error) {
                console.error('❌ Error al obtener tendencias:', error);
                throw error;
            }
        });
    }
}
exports.AnalyticsService = AnalyticsService;
exports.default = AnalyticsService;
