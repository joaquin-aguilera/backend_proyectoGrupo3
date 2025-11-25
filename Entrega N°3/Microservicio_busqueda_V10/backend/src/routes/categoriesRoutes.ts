import { Router } from 'express';
import { getAllCategories, getTopClickedProducts, getProductsByCategory } from '../controllers/categoriesController';
import { rateLimit } from '../middleware/rateLimit';
import { validateNumericParams, validateCategoryName } from '../middleware/sanitize';

/**
 * @swagger
 * tags:
 *   - name: Categorías
 *     description: Gestión de categorías de productos
 */

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorías con imágenes
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías con sus imágenes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Error del servidor
 */
router.get('/',
    rateLimit,
    getAllCategories
);

/**
 * @swagger
 * /api/categories/top-clicked:
 *   get:
 *     summary: Obtener productos más buscados (Top 6)
 *     description: Retorna los productos más populares basados en la cantidad de búsquedas. La analítica se calcula agregando la colección 'searches' y contando cuántas veces aparece cada producto en los resultados de búsqueda.
 *     tags: [Categorías]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *           minimum: 1
 *           maximum: 20
 *         description: Cantidad de productos a retornar
 *     responses:
 *       200:
 *         description: Lista de productos más buscados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 limit:
 *                   type: integer
 *                   example: 6
 *                 total:
 *                   type: integer
 *                   example: 6
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TopProduct'
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 */
router.get('/top-clicked',
    rateLimit,
    validateNumericParams,
    getTopClickedProducts
);

/**
 * @swagger
 * /api/categories/{category}/products:
 *   get:
 *     summary: Obtener productos de una categoría específica
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la categoría
 *     responses:
 *       200:
 *         description: Productos de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoria:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Categoría no especificada
 *       500:
 *         description: Error del servidor
 */
router.get('/:category/products',
    rateLimit,
    validateCategoryName,
    getProductsByCategory
);

export default router;