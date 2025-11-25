import { Router } from 'express';
import { search, getSearchHistory, getSuggestions, getAllProducts } from '../controllers/searchController';
import { validateSearchParams } from '../middleware/validateSearchParams';
import { rateLimit } from '../middleware/rateLimit';

/**
 * @swagger
 * tags:
 *   - name: Productos
 *     description: Operaciones relacionadas con productos
 *   - name: Búsquedas
 *     description: Gestión de búsquedas y sugerencias
 *   - name: Analítica
 *     description: Endpoints para análisis de datos y métricas
 *   - name: Integración
 *     description: Endpoints para integración con sistemas externos
 */

const router = Router();

/**
 * @swagger
 * /api/search/products:
 *   get:
 *     summary: Buscar productos con filtros
 *     tags: [Productos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar productos
 *       - in: query
 *         name: precio
 *         schema:
 *           type: string
 *           enum: [hasta 100, entre 100 - 200, entre 200 - 300]
 *         description: Rango de precios
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Categoría del producto
 *       - in: query
 *         name: ubicacion
 *         schema:
 *           type: string
 *         description: Ubicación del producto
 *       - in: query
 *         name: condicion
 *         schema:
 *           type: string
 *           enum: [nuevo, usado]
 *         description: Condición del producto
 *     responses:
 *       200:
 *         description: Lista de productos filtrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Error en los parámetros de búsqueda
 *       429:
 *         description: Demasiadas solicitudes
 */
router.get('/products', rateLimit, validateSearchParams, search);

/**
 * @swagger
 * /api/search/products/all:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error del servidor
 */
router.get('/products/all', getAllProducts);

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Obtener sugerencias de búsqueda
 *     tags: [Sugerencias]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: texto
 *         schema:
 *           type: string
 *         description: Texto para obtener sugerencias
 *     responses:
 *       200:
 *         description: Lista de sugerencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sugerencia'
 *       429:
 *         description: Demasiadas solicitudes
 */
router.get('/suggestions', rateLimit, getSuggestions);

/**
 * @swagger
 * /api/search/history:
 *   get:
 *     summary: Obtener historial de búsquedas
 *     tags: [Historial]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de búsquedas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistorialBusqueda'
 *       429:
 *         description: Demasiadas solicitudes
 */
router.get('/history', rateLimit, getSearchHistory);

export default router;