"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoriesController_1 = require("../controllers/categoriesController");
const rateLimit_1 = require("../middleware/rateLimit");
const sanitize_1 = require("../middleware/sanitize");
/**
 * @swagger
 * tags:
 *   - name: Categorías
 *     description: Gestión de categorías de productos
 */
const router = (0, express_1.Router)();
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
router.get('/', rateLimit_1.rateLimit, categoriesController_1.getAllCategories);
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
router.get('/top-clicked', rateLimit_1.rateLimit, sanitize_1.validateNumericParams, categoriesController_1.getTopClickedProducts);
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
router.get('/:category/products', rateLimit_1.rateLimit, sanitize_1.validateCategoryName, categoriesController_1.getProductsByCategory);
exports.default = router;
