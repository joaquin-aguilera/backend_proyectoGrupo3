import { Router } from 'express';
import {
    search,
    getSearchHistory,
    getSuggestions,
    getAllProducts,
    getRandomProducts,
    getProductDetail,
    saveSearchHistory,
    registerProductClick,
    getProductClicks,
    getProductSearches
} from '../controllers/searchController';
import { validateSearchParams } from '../middleware/validateSearchParams';
import { rateLimit } from '../middleware/rateLimit';
import { validateSearchText, validateNumericParams } from '../middleware/sanitize';
import { searchLimiter, writeLimiter } from '../middleware/rateLimit';

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
 *     summary: Buscar productos con filtros avanzados
 *     description: Busca productos consumidos del microservicio de publicaciones con filtros de texto, precio, categoría, condición y ordenamiento. Los productos se normalizan automáticamente al formato estándar.
 *     tags: [Productos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar por nombre, descripción o marca
 *         example: "laptop"
 *       - in: query
 *         name: precio
 *         schema:
 *           type: string
 *           enum: [hasta 50, entre 50 - 100, entre 100 - 300, entre 300 - 500, mas de 500]
 *         description: Rango de precios en USD
 *         example: "entre 100 - 300"
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [ELECTRÓNICA, ROPA, CALZADO, HOGAR, JUGUETES, DEPORTES, LIBROS, ALIMENTOS, BELLEZA, OFICINA, AUTOMOTRIZ, MASCOTAS, GENERAL]
 *         description: Categoría del producto (mayúsculas con acentos)
 *         example: "ELECTRÓNICA"
 *       - in: query
 *         name: ubicacion
 *         schema:
 *           type: string
 *         description: Ubicación del producto (filtro heredado, puede no aplicarse)
 *       - in: query
 *         name: condicion
 *         schema:
 *           type: string
 *           enum: [NUEVO, USADO, REACONDICIONADO]
 *         description: Condición del producto
 *         example: "NUEVO"
 *       - in: query
 *         name: ordenar
 *         schema:
 *           type: string
 *           enum: [precio-asc, precio-desc]
 *         description: Ordenar resultados por precio (ascendente o descendente)
 *         example: "precio-asc"
 *     responses:
 *       200:
 *         description: Lista de productos filtrados y ordenados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *             example:
 *               - id_producto: 1
 *                 id_tienda: 3
 *                 nombre: "Laptop HP Pavilion 15"
 *                 precio: 450.00
 *                 categoria: "ELECTRÓNICA"
 *                 condicion: "NUEVO"
 *                 stock: 10
 *                 sku: "HP-PAV-001"
 *       400:
 *         description: Error en los parámetros de búsqueda
 *       429:
 *         description: Demasiadas solicitudes (rate limit excedido)
 */
router.get('/products',
    searchLimiter,          // Rate limit específico para búsquedas (30/min)
    validateSearchText,     // Validar texto de búsqueda
    validateNumericParams,  // Validar parámetros numéricos
    validateSearchParams,   // Tu validación original
    search
);

/**
 * @swagger
 * /api/search/products/all:
 *   get:
 *     summary: Obtener todos los productos disponibles
 *     description: Retorna todos los productos consumidos desde el microservicio de publicaciones (puerto 4040). Si el endpoint externo no está disponible, retorna productos de demostración.
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
 *             example:
 *               - id_producto: 1
 *                 id_tienda: 3
 *                 nombre: "Laptop HP Pavilion 15"
 *                 precio: 450.00
 *                 categoria: "ELECTRÓNICA"
 *                 condicion: "NUEVO"
 *                 stock: 10
 *                 sku: "HP-PAV-001"
 *                 descripcion: "Laptop HP Pavilion 15.6 pulgadas"
 *                 marca: "HP"
 *                 fecha_creacion: "2025-11-20T10:30:00.000Z"
 *       500:
 *         description: Error del servidor
 */
router.get('/products/all',
    rateLimit,  // Rate limit básico
    getAllProducts
);

/**
 * @swagger
 * /api/search/products/random:
 *   get:
 *     summary: Obtener productos aleatorios
 *     description: Retorna productos seleccionados aleatoriamente. Excluye productos de la categoría "TODO".
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Cantidad de productos aleatorios a retornar (máximo 50)
 *     responses:
 *       200:
 *         description: Productos aleatorios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productos:
 *                   type: array
 *                   items:
 *                     type: object
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de productos disponibles
 *                     totalDisponible:
 *                       type: integer
 *                       description: Total de productos retornados
 *                     hasMore:
 *                       type: boolean
 *                       description: Indica si hay más productos disponibles
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 */
router.get('/products/random',
    rateLimit,
    validateNumericParams,
    getRandomProducts
);

/**
 * @swagger
 * /api/search/products/:id/detail:
 *   get:
 *     summary: Obtener detalle completo del producto con información del vendedor
 *     description: Retorna información detallada del producto, incluyendo datos del vendedor/tienda y multimedia
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Detalle del producto obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 producto:
 *                   type: object
 *                   description: Información del producto/publicación
 *                 vendedor:
 *                   type: object
 *                   description: Información del vendedor o tienda
 *                 publicacion:
 *                   type: object
 *                   description: Detalles adicionales de la publicación (multimedia, despacho, etc)
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/products/:id/detail',
    rateLimit,
    getProductDetail
);

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
router.get('/suggestions',
    searchLimiter,       // Rate limit para sugerencias
    validateSearchText,  // Validar texto de búsqueda
    getSuggestions
);

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
router.get('/history',
    rateLimit,  // Rate limit básico
    getSearchHistory
);

/**
 * @swagger
 * /api/search/history:
 *   post:
 *     summary: Guardar una búsqueda en el historial
 *     tags: [Historial]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busqueda:
 *                 type: string
 *                 description: Término de búsqueda
 *               filtros:
 *                 type: object
 *                 description: Filtros aplicados
 *     responses:
 *       200:
 *         description: Búsqueda guardada exitosamente
 *       400:
 *         description: Error en los parámetros
 *       500:
 *         description: Error del servidor
 */
router.post('/history',
    writeLimiter,  // Rate limit para escritura (20/5min)
    saveSearchHistory
);

/**
 * @swagger
 * /api/search/clicks:
 *   post:
 *     summary: Registrar un click en un producto
 *     tags: [Analítica]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - searchId
 *               - productId
 *             properties:
 *               searchId:
 *                 type: string
 *                 description: ID de la búsqueda asociada
 *               productId:
 *                 type: string
 *                 description: ID del producto clickeado
 *     responses:
 *       200:
 *         description: Click registrado exitosamente
 *       400:
 *         description: Error en los parámetros
 *       500:
 *         description: Error del servidor
 */
router.post('/clicks',
    writeLimiter,  // Rate limit para escritura
    registerProductClick
);

/**
 * @swagger
 * /api/search/clicks/{productId}:
 *   get:
 *     summary: Obtener clicks de un producto específico
 *     tags: [Analítica]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Información de clicks del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productId:
 *                   type: string
 *                 totalClicks:
 *                   type: number
 *                 clicks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Click'
 *       400:
 *         description: Error en los parámetros
 *       500:
 *         description: Error del servidor
 */
router.get('/clicks/:productId',
    rateLimit,  // Rate limit básico
    getProductClicks
);

/**
 * @swagger
 * /api/search/product-searches:
 *   get:
 *     summary: Obtener búsquedas de productos para integración externa
 *     description: Endpoint para compartir con otros grupos. Retorna id_producto, nombre y fecha de cada búsqueda.
 *     tags: [Integración]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicial (ISO 8601)
 *         example: "2025-11-01T00:00:00Z"
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha final (ISO 8601)
 *         example: "2025-11-20T23:59:59Z"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 1000
 *           minimum: 1
 *           maximum: 10000
 *         description: Cantidad máxima de registros a retornar
 *     responses:
 *       200:
 *         description: Lista de búsquedas de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 busquedas:
 *                   type: integer
 *                 periodo:
 *                   type: object
 *                   properties:
 *                     desde:
 *                       type: string
 *                     hasta:
 *                       type: string
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_producto:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                       queryText:
 *                         type: string
 *             example:
 *               total: 45
 *               busquedas: 12
 *               periodo:
 *                 desde: "2025-11-01T00:00:00Z"
 *                 hasta: "2025-11-20T23:59:59Z"
 *               datos:
 *                 - id_producto: "1"
 *                   nombre: "Laptop HP Pavilion 15"
 *                   fecha: "2025-11-19T10:30:00Z"
 *                   queryText: "laptop"
 *       500:
 *         description: Error del servidor
 */
router.get('/product-searches',
    rateLimit,              // Rate limit básico
    validateNumericParams,  // Validar parámetro 'limite'
    getProductSearches
);

export default router;