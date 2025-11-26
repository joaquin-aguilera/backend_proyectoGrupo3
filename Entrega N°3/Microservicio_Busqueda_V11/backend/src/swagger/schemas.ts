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
 *         - id_producto
 *         - id_tienda
 *         - nombre
 *         - precio
 *         - categoria
 *         - condicion
 *         - stock
 *         - sku
 *       properties:
 *         id_producto:
 *           type: number
 *           description: ID único del producto
 *           example: 1
 *         id_tienda:
 *           type: number
 *           description: ID de la tienda del producto
 *           example: 3
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *           example: "Laptop HP Pavilion 15"
 *         precio:
 *           type: number
 *           description: Precio del producto en USD
 *           example: 450.00
 *         categoria:
 *           type: string
 *           enum: [ELECTRÓNICA, ROPA, CALZADO, HOGAR, JUGUETES, DEPORTES, LIBROS, ALIMENTOS, BELLEZA, OFICINA, AUTOMOTRIZ, MASCOTAS, GENERAL]
 *           description: Categoría del producto (estandarizada en mayúsculas)
 *           example: "ELECTRÓNICA"
 *         condicion:
 *           type: string
 *           enum: [NUEVO, USADO, REACONDICIONADO]
 *           description: Condición/estado del producto
 *           example: "NUEVO"
 *         stock:
 *           type: number
 *           description: Cantidad disponible en stock
 *           example: 10
 *         sku:
 *           type: string
 *           description: SKU único del producto
 *           example: "HP-PAV-001"
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del producto
 *           example: "Laptop HP Pavilion 15.6 pulgadas, procesador Intel Core i5"
 *         marca:
 *           type: string
 *           description: Marca del producto
 *           example: "HP"
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del producto (ISO 8601)
 *           example: "2025-11-20T10:30:00.000Z"
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
 *             condicion:
 *               type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la búsqueda
 * 
 *     Click:
 *       type: object
 *       required:
 *         - searchId
 *         - productId
 *         - clickedAt
 *       properties:
 *         searchId:
 *           type: string
 *           description: ID de la búsqueda asociada
 *         productId:
 *           type: string
 *           description: ID del producto clickeado
 *         userId:
 *           type: string
 *           description: ID del usuario que hizo click
 *         clickedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del click
 * 
 *     Category:
 *       type: object
 *       required:
 *         - nombre
 *         - totalProductos
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la categoría (estandarizado en mayúsculas)
 *           example: "ELECTRÓNICA"
 *         imagen:
 *           type: string
 *           nullable: true
 *           description: URL de la imagen optimizada de la categoría (procesada con Sharp)
 *           example: "/api/images/categories/Electrónica.jpg"
 *         totalProductos:
 *           type: integer
 *           description: Cantidad de productos disponibles en esta categoría
 *           example: 15
 * 
 *     TopProduct:
 *       type: object
 *       required:
 *         - productId
 *         - totalClicks
 *       properties:
 *         productId:
 *           type: string
 *           description: ID del producto
 *           example: "1"
 *         totalClicks:
 *           type: integer
 *           description: Número total de clicks recibidos
 *           example: 45
 *         producto:
 *           $ref: '#/components/schemas/Producto'
 *           description: Información completa del producto
 * 
 *     ProductSearch:
 *       type: object
 *       description: Registro de búsqueda de producto para integración externa
 *       required:
 *         - id_producto
 *         - nombre
 *         - fecha
 *       properties:
 *         id_producto:
 *           type: string
 *           description: ID del producto buscado
 *           example: "1"
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *           example: "Laptop HP Pavilion 15"
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha de la búsqueda (ISO 8601)
 *           example: "2025-11-19T10:30:00.000Z"
 *         queryText:
 *           type: string
 *           description: Término de búsqueda utilizado (opcional)
 *           example: "laptop"
 * 
 *     ProductSearchResponse:
 *       type: object
 *       description: Respuesta del endpoint de integración de búsquedas
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de registros retornados
 *           example: 45
 *         busquedas:
 *           type: integer
 *           description: Total de búsquedas procesadas
 *           example: 12
 *         periodo:
 *           type: object
 *           properties:
 *             desde:
 *               type: string
 *               format: date-time
 *               example: "2025-11-01T00:00:00Z"
 *             hasta:
 *               type: string
 *               format: date-time
 *               example: "2025-11-20T23:59:59Z"
 *         datos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductSearch'
 */