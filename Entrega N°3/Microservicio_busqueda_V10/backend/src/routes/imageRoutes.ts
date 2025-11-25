import { Router } from 'express';
import { getCategoryImage, clearImageCache } from '../controllers/imageController';

/**
 * @swagger
 * tags:
 *   - name: Imágenes
 *     description: Optimización y servicio de imágenes de categorías con Sharp
 */

const router = Router();

/**
 * @swagger
 * /api/images/categories/{imageName}:
 *   get:
 *     summary: Obtener imagen de categoría optimizada
 *     description: Retorna una imagen reescalada y comprimida usando Sharp. Las imágenes se cachean automáticamente para mejorar el rendimiento.
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: imageName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la imagen (ej. Electrónica.jpg, Ropa.jpg)
 *         example: "Electrónica.jpg"
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *           default: 800
 *           minimum: 100
 *           maximum: 2000
 *         description: Ancho deseado en píxeles
 *         example: 800
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *           default: 600
 *           minimum: 100
 *           maximum: 2000
 *         description: Alto deseado en píxeles
 *         example: 600
 *       - in: query
 *         name: quality
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 85
 *         description: Calidad de compresión JPEG (1-100)
 *         example: 85
 *     responses:
 *       200:
 *         description: Imagen optimizada retornada exitosamente
 *         headers:
 *           Cache-Control:
 *             schema:
 *               type: string
 *             description: Política de cache (1 día)
 *           Content-Type:
 *             schema:
 *               type: string
 *             description: image/jpeg
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagen no encontrada
 *       400:
 *         description: Parámetros inválidos o nombre de archivo inseguro
 *       500:
 *         description: Error al procesar la imagen
 */
router.get('/categories/:imageName', getCategoryImage);

/**
 * @swagger
 * /api/images/cache/clear:
 *   post:
 *     summary: Limpiar caché de imágenes optimizadas
 *     description: Elimina todas las imágenes cacheadas. Útil después de actualizar imágenes originales.
 *     tags: [Imágenes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Caché limpiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Caché de imágenes limpiado"
 *       500:
 *         description: Error al limpiar el caché
 */
router.post('/cache/clear', clearImageCache);

export default router;
