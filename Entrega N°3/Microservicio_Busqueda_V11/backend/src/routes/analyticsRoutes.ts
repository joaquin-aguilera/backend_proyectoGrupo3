import { Router } from 'express';
import {
  getTopProducts,
  getSearchStats,
  getTopSearchTerms,
  getSearchTrends
} from '../controllers/analyticsController';
import { rateLimit } from '../middleware/rateLimit';
import { validateNumericParams } from '../middleware/sanitize';

const router = Router();

/**
 * @swagger
 * /api/analytics/top-products:
 *   get:
 *     summary: Obtiene los productos más buscados
 *     description: Retorna los productos más populares basándose en el historial de búsquedas
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *           minimum: 1
 *           maximum: 20
 *         description: Número de productos a retornar
 *     responses:
 *       200:
 *         description: Lista de productos más buscados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 productos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       searchCount:
 *                         type: integer
 *                       lastSearched:
 *                         type: string
 *                         format: date-time
 *                       producto:
 *                         type: object
 *       500:
 *         description: Error del servidor
 */
router.get('/top-products', rateLimit, validateNumericParams, getTopProducts);

/**
 * @swagger
 * /api/analytics/stats:
 *   get:
 *     summary: Obtiene estadísticas generales de búsquedas
 *     description: Retorna métricas generales sobre las búsquedas realizadas
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Estadísticas de búsquedas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *       500:
 *         description: Error del servidor
 */
router.get('/stats', rateLimit, getSearchStats);

/**
 * @swagger
 * /api/analytics/top-terms:
 *   get:
 *     summary: Obtiene los términos de búsqueda más populares
 *     description: Retorna los términos más buscados
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Número de términos a retornar
 *     responses:
 *       200:
 *         description: Lista de términos populares
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 terms:
 *                   type: array
 *       500:
 *         description: Error del servidor
 */
router.get('/top-terms', rateLimit, validateNumericParams, getTopSearchTerms);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Obtiene tendencias de búsqueda por período
 *     description: Analiza la evolución de búsquedas en el tiempo
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *           minimum: 1
 *           maximum: 90
 *         description: Número de días atrás para analizar
 *     responses:
 *       200:
 *         description: Tendencias de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 period:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 trends:
 *                   type: array
 *       500:
 *         description: Error del servidor
 */
router.get('/trends', rateLimit, validateNumericParams, getSearchTrends);

export default router;
