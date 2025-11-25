/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - id
 *         - nombre
 *         - precio
 *         - categoria
 *         - ubicacion
 *         - condicion
 *       properties:
 *         id:
 *           type: number
 *           description: ID único del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         precio:
 *           type: number
 *           description: Precio del producto
 *         categoria:
 *           type: string
 *           description: Categoría del producto
 *         ubicacion:
 *           type: string
 *           description: Ubicación del producto
 *         condicion:
 *           type: string
 *           enum: [nuevo, usado]
 *           description: Estado del producto
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del producto
 * 
 *     Sugerencia:
 *       type: object
 *       required:
 *         - texto
 *         - tipo
 *       properties:
 *         texto:
 *           type: string
 *           description: Texto de la sugerencia
 *         tipo:
 *           type: string
 *           enum: [coincidencia, historial]
 *           description: Tipo de sugerencia
 * 
 *     HistorialBusqueda:
 *       type: object
 *       required:
 *         - queryText
 *         - timestamp
 *       properties:
 *         userId:
 *           type: string
 *           description: ID del usuario que realizó la búsqueda
 *         queryText:
 *           type: string
 *           description: Texto de búsqueda
 *         filters:
 *           type: object
 *           properties:
 *             precio:
 *               type: string
 *             categoria:
 *               type: string
 *             ubicacion:
 *               type: string
 *             condicion:
 *               type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la búsqueda
 */