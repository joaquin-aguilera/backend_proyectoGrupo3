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
exports.getProductDetail = exports.getProductSearches = exports.getProductClicks = exports.registerProductClick = exports.saveSearchHistory = exports.getSearchHistory = exports.getRandomProducts = exports.getAllProducts = exports.search = exports.getSuggestions = void 0;
const searchService_1 = require("../services/searchService");
const productsService_1 = require("../services/productsService");
const BadRequestError_1 = require("../errors/BadRequestError");
const Search_1 = __importDefault(require("../models/Search"));
const Product_1 = __importDefault(require("../models/Product"));
const axios_1 = __importDefault(require("axios"));
const filtrarProductos = (productos, busqueda, filtros) => {
    let resultados = productos.filter(producto => {
        // Si no hay búsqueda, solo aplicar filtros
        if (!busqueda) {
            // Verificar filtros
            if (filtros.precio) {
                const precio = producto.precio;
                switch (filtros.precio) {
                    case 'hasta 50':
                        if (precio > 50)
                            return false;
                        break;
                    case 'entre 50 - 100':
                        if (precio <= 50 || precio > 100)
                            return false;
                        break;
                    case 'entre 100 - 300':
                        if (precio <= 100 || precio > 300)
                            return false;
                        break;
                    case 'entre 300 - 500':
                        if (precio <= 300 || precio > 500)
                            return false;
                        break;
                    case 'mas de 500':
                        if (precio <= 500)
                            return false;
                        break;
                }
            }
            if (filtros.categoria && producto.categoria !== filtros.categoria)
                return false;
            if (filtros.condicion && producto.condicion !== filtros.condicion)
                return false;
            return true;
        }
        // Si hay búsqueda, verificar coincidencia en el nombre (case-insensitive)
        const matchBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
        if (!matchBusqueda)
            return false;
        // Aplicar filtros adicionales si hay coincidencia
        if (filtros.precio) {
            const precio = producto.precio;
            switch (filtros.precio) {
                case 'hasta 50':
                    if (precio > 50)
                        return false;
                    break;
                case 'entre 50 - 100':
                    if (precio <= 50 || precio > 100)
                        return false;
                    break;
                case 'entre 100 - 300':
                    if (precio <= 100 || precio > 300)
                        return false;
                    break;
                case 'entre 300 - 500':
                    if (precio <= 300 || precio > 500)
                        return false;
                    break;
                case 'mas de 500':
                    if (precio <= 500)
                        return false;
                    break;
            }
        }
        if (filtros.categoria && producto.categoria !== filtros.categoria)
            return false;
        if (filtros.condicion && producto.condicion !== filtros.condicion)
            return false;
        return true;
    });
    // Aplicar ordenamiento si se especificó
    if (filtros.ordenar) {
        if (filtros.ordenar === 'precio-asc') {
            resultados.sort((a, b) => a.precio - b.precio);
        }
        else if (filtros.ordenar === 'precio-desc') {
            resultados.sort((a, b) => b.precio - a.precio);
        }
    }
    return resultados;
};
// Controladores
const getSuggestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const startTime = Date.now();
    try {
        const { texto } = req.query;
        // Validación básica de seguridad (tipo y longitud)
        if (texto !== undefined && typeof texto !== 'string') {
            return res.status(400).json({ error: 'texto debe ser string' });
        }
        const textoSafe = typeof texto === 'string' ? texto.trim() : '';
        if (textoSafe.length > 100) {
            return res.status(400).json({ error: 'texto demasiado largo' });
        }
        try {
            // Obtener productos de la API externa
            const productos = yield productsService_1.productsService.getProductos();
            // Buscar coincidencias solo en nombres de productos
            const coincidencias = productos
                .filter(producto => producto.nombre.toLowerCase().includes(textoSafe.toLowerCase()))
                .map(p => ({
                texto: p.nombre,
                tipo: 'coincidencia',
            }));
            // Obtener sugerencias del historial desde MongoDB
            const historial = yield searchService_1.SearchService.getSuggestions(textoSafe, (_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString());
            const sugerencias = [...historial, ...coincidencias.slice(0, 5)];
            const endTime = Date.now();
            console.log(`Sugerencias obtenidas en ${endTime - startTime}ms`);
            res.json(sugerencias);
        }
        catch (serviceError) {
            console.error('Error en servicio de sugerencias:', serviceError);
            res.status(500).json({ error: 'Error al obtener sugerencias' });
        }
    }
    catch (error) {
        console.error('Error al obtener sugerencias:', error);
        res.status(500).json({ error: 'Error al obtener sugerencias' });
    }
});
exports.getSuggestions = getSuggestions;
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const startTime = Date.now();
    try {
        // Preferir parámetros saneados por el middleware (defensa en profundidad)
        const safe = ((_a = req.searchQuery) !== null && _a !== void 0 ? _a : req.query);
        const { busqueda = '', precio, categoria, condicion, ordenar } = safe;
        try {
            // Obtener productos de la API externa con filtros de precio
            const filterOptions = {};
            if (precio) {
                switch (precio) {
                    case 'hasta 50':
                        filterOptions.precio_max = 50;
                        break;
                    case 'entre 50 - 100':
                        filterOptions.precio_min = 50;
                        filterOptions.precio_max = 100;
                        break;
                    case 'entre 100 - 300':
                        filterOptions.precio_min = 100;
                        filterOptions.precio_max = 300;
                        break;
                    case 'entre 300 - 500':
                        filterOptions.precio_min = 300;
                        filterOptions.precio_max = 500;
                        break;
                    case 'mas de 500':
                        filterOptions.precio_min = 500;
                        break;
                }
            }
            if (categoria)
                filterOptions.categoria = categoria;
            if (condicion)
                filterOptions.condicion = condicion;
            const productos = yield productsService_1.productsService.getProductos(filterOptions);
            // Construir objeto de filtros solo con los valores que existen
            const filtros = {};
            if (precio)
                filtros.precio = precio;
            if (categoria)
                filtros.categoria = categoria;
            if (condicion)
                filtros.condicion = condicion;
            if (ordenar)
                filtros.ordenar = ordenar;
            const resultados = filtrarProductos(productos, busqueda || '', filtros);
            // Guardar la búsqueda en MongoDB siempre que haya resultados
            // (incluso si es solo navegación por categoría o filtros)
            let searchId;
            if (resultados.length > 0) {
                const searchRecord = yield searchService_1.SearchService.saveSearch({
                    userId: (_b = req.userId) === null || _b === void 0 ? void 0 : _b.toString(),
                    queryText: busqueda || '[navegación por categoría/filtros]',
                    filters: filtros,
                    results: resultados.map((producto, index) => ({
                        productId: producto.id_producto.toString(),
                        position: index + 1,
                    })),
                });
                searchId = searchRecord._id.toString();
            }
            const endTime = Date.now();
            console.log(`Búsqueda realizada en ${endTime - startTime}ms`);
            console.log(`Resultados encontrados: ${resultados.length}`);
            // Retornar resultados con metadata incluyendo searchId
            res.json({
                productos: resultados,
                metadata: {
                    total: resultados.length,
                    searchId: searchId,
                    hasMore: false
                }
            });
        }
        catch (serviceError) {
            console.error('Error en servicio de búsqueda:', serviceError);
            res.status(500).json({ error: 'Error al realizar la búsqueda' });
        }
    }
    catch (error) {
        console.error('Error en búsqueda:', error);
        if (error instanceof BadRequestError_1.BadRequestError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al realizar la búsqueda' });
    }
});
exports.search = search;
// Nuevo controlador para obtener todos los productos
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        try {
            const productos = yield productsService_1.productsService.getProductos();
            const endTime = Date.now();
            console.log(`Todos los productos obtenidos en ${endTime - startTime}ms`);
            res.json(productos);
        }
        catch (serviceError) {
            console.error('Error en servicio al obtener todos los productos:', serviceError);
            res.status(500).json({ error: 'Error al obtener todos los productos' });
        }
    }
    catch (error) {
        console.error('Error al obtener todos los productos:', error);
        res.status(500).json({ error: 'Error al obtener todos los productos' });
    }
});
exports.getAllProducts = getAllProducts;
// Nuevo controlador para obtener productos aleatorios (excluye categoría TODO)
const getRandomProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const limitSafe = Math.min(Math.max(limit, 1), 50); // Entre 1 y 50
        // Obtener todos los productos
        const todosProductos = yield productsService_1.productsService.getProductos();
        // Mezclar array (algoritmo Fisher-Yates)
        const productosAleatorios = [...todosProductos];
        for (let i = productosAleatorios.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [productosAleatorios[i], productosAleatorios[j]] = [productosAleatorios[j], productosAleatorios[i]];
        }
        // Tomar los primeros N productos
        const resultados = productosAleatorios.slice(0, limitSafe);
        const endTime = Date.now();
        console.log(`Productos aleatorios obtenidos en ${endTime - startTime}ms`);
        console.log(`Total de productos aleatorios: ${resultados.length}`);
        res.json({
            productos: resultados,
            metadata: {
                total: resultados.length,
                totalDisponible: todosProductos.length,
                hasMore: false
            }
        });
    }
    catch (error) {
        console.error('Error al obtener productos aleatorios:', error);
        res.status(500).json({ error: 'Error al obtener productos aleatorios' });
    }
});
exports.getRandomProducts = getRandomProducts;
const getSearchHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const startTime = Date.now();
    try {
        try {
            const historial = yield searchService_1.SearchService.getSearchHistory((_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString());
            const endTime = Date.now();
            console.log(`Historial obtenido en ${endTime - startTime}ms`);
            res.json(historial);
        }
        catch (serviceError) {
            console.error('Error en servicio al obtener historial:', serviceError);
            res.status(500).json({ error: 'Error al obtener el historial' });
        }
    }
    catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener el historial' });
    }
});
exports.getSearchHistory = getSearchHistory;
const saveSearchHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        try {
            const { busqueda, filtros } = req.body;
            // Validación básica
            if (!busqueda || typeof busqueda !== 'string') {
                return res.status(400).json({ error: 'busqueda es requerida y debe ser string' });
            }
            // Guardar la búsqueda en MongoDB
            const resultado = yield searchService_1.SearchService.saveSearch({
                userId: (_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString(),
                queryText: busqueda,
                filters: filtros || {},
                results: [],
            });
            res.json({ success: true, message: 'Búsqueda guardada exitosamente', resultado });
        }
        catch (serviceError) {
            console.error('Error en servicio al guardar búsqueda:', serviceError);
            res.status(500).json({ error: 'Error al guardar la búsqueda' });
        }
    }
    catch (error) {
        console.error('Error al guardar búsqueda:', error);
        res.status(500).json({ error: 'Error al guardar la búsqueda' });
    }
});
exports.saveSearchHistory = saveSearchHistory;
// Controlador para registrar click en producto
const registerProductClick = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { searchId, productId } = req.body;
        // Validación básica
        if (!searchId || typeof searchId !== 'string') {
            return res.status(400).json({ error: 'searchId es requerido y debe ser string' });
        }
        if (!productId || typeof productId !== 'string') {
            return res.status(400).json({ error: 'productId es requerido y debe ser string' });
        }
        // Registrar el click
        yield searchService_1.SearchService.saveClick({
            searchId,
            productId,
            userId: (_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString(),
        });
        res.json({ success: true, message: 'Click registrado exitosamente' });
    }
    catch (error) {
        console.error('Error al registrar click:', error);
        res.status(500).json({ error: 'Error al registrar el click' });
    }
});
exports.registerProductClick = registerProductClick;
// Controlador para obtener clicks de un producto
const getProductClicks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ error: 'productId es requerido' });
        }
        const clicks = yield searchService_1.SearchService.getClicksByProduct(productId);
        res.json({ productId, totalClicks: clicks.length, clicks });
    }
    catch (error) {
        console.error('Error al obtener clicks del producto:', error);
        res.status(500).json({ error: 'Error al obtener clicks del producto' });
    }
});
exports.getProductClicks = getProductClicks;
// Controlador para exportar búsquedas de productos (para integración con otros grupos)
const getProductSearches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        const { desde, hasta, limite } = req.query;
        // Construir filtro de fecha
        const filtroFecha = {};
        if (desde) {
            const fechaDesde = new Date(desde);
            if (!isNaN(fechaDesde.getTime())) {
                filtroFecha.$gte = fechaDesde;
            }
        }
        if (hasta) {
            const fechaHasta = new Date(hasta);
            if (!isNaN(fechaHasta.getTime())) {
                filtroFecha.$lte = fechaHasta;
            }
        }
        const matchFilter = {};
        if (Object.keys(filtroFecha).length > 0) {
            matchFilter.requestedAt = filtroFecha;
        }
        // Agregar limite si se especifica
        const limitNum = limite ? parseInt(limite, 10) : 1000;
        const limiteSafe = Math.min(Math.max(limitNum, 1), 10000); // Entre 1 y 10000
        // Obtener búsquedas desde MongoDB
        const searches = yield Search_1.default.find(matchFilter)
            .sort({ requestedAt: -1 })
            .limit(limiteSafe)
            .select('results requestedAt queryText')
            .lean();
        // Obtener información de productos desde la API
        const productos = yield productsService_1.productsService.getProductos();
        const productosMap = new Map(productos.map(p => [p.id_producto.toString(), p]));
        // Procesar y formatear datos para el otro grupo
        const busquedasProductos = [];
        searches.forEach(search => {
            if (search.results && Array.isArray(search.results)) {
                search.results.forEach(result => {
                    const producto = productosMap.get(result.productId);
                    if (producto) {
                        busquedasProductos.push({
                            id_producto: result.productId,
                            nombre: producto.nombre,
                            fecha: search.requestedAt.toISOString(),
                            queryText: search.queryText // Opcional: término de búsqueda
                        });
                    }
                });
            }
        });
        const endTime = Date.now();
        console.log(`Búsquedas de productos exportadas en ${endTime - startTime}ms`);
        console.log(`Total de registros: ${busquedasProductos.length} de ${searches.length} búsquedas`);
        res.json({
            total: busquedasProductos.length,
            busquedas: searches.length,
            periodo: {
                desde: desde || 'inicio',
                hasta: hasta || 'ahora'
            },
            datos: busquedasProductos
        });
    }
    catch (error) {
        console.error('Error al obtener búsquedas de productos:', error);
        res.status(500).json({ error: 'Error al obtener búsquedas de productos' });
    }
});
exports.getProductSearches = getProductSearches;
/**
 * Obtiene el detalle completo de un producto incluyendo información del vendedor/tienda
 */
const getProductDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'ID de producto requerido' });
        }
        // 1. Intentar obtener la publicación completa del microservicio de publicaciones
        const PUBLICATIONS_API_URL = process.env.PUBLICATIONS_API_URL || 'http://localhost:3000/api';
        let publicacion = null;
        let vendedor = null;
        let producto = null;
        try {
            const pubResponse = yield axios_1.default.get(`${PUBLICATIONS_API_URL}/publicaciones/${id}`, {
                timeout: 5000
            });
            publicacion = pubResponse.data;
            // 2. Intentar obtener información del vendedor desde el servicio de autenticación
            if (publicacion === null || publicacion === void 0 ? void 0 : publicacion.id_vendedor) {
                try {
                    const vendedorResponse = yield axios_1.default.get(`${process.env.AUTH_SERVICE_URL || 'http://localhost:3000'}/api/auth/user/${publicacion.id_vendedor}`, {
                        timeout: 3000,
                        headers: {
                            Authorization: req.headers.authorization || ''
                        }
                    });
                    vendedor = vendedorResponse.data;
                }
                catch (vendedorError) {
                    console.warn('No se pudo obtener info del vendedor:', vendedorError);
                    // Continuar sin información del vendedor
                }
            }
        }
        catch (publicacionError) {
            console.warn('API de publicaciones no disponible, usando datos locales');
            // Fallback: buscar en MongoDB local primero (tiene datos completos)
            const productoMongo = yield Product_1.default.findOne({ id: parseInt(id) }).lean();
            if (productoMongo) {
                console.log('✓ Producto encontrado en MongoDB con datos completos');
                // Construir respuesta con datos de MongoDB
                const detalleCompleto = {
                    producto: {
                        id_producto: productoMongo.id,
                        nombre: productoMongo.nombre,
                        precio: productoMongo.precio,
                        descripcion: productoMongo.descripcion,
                        categoria: productoMongo.categoria,
                        condicion: productoMongo.condicion,
                        stock: productoMongo.stock,
                        marca: productoMongo.marca,
                        sku: productoMongo.sku
                    },
                    vendedor: productoMongo.vendedor || {
                        id: productoMongo.id_vendedor || 'local_vendor',
                        nombre: 'Vendedor Local',
                        tipo: 'vendedor'
                    },
                    publicacion: {
                        multimedia: productoMongo.multimedia || [],
                        despacho: productoMongo.despacho || 'retiro_en_tienda',
                        precio_envio: productoMongo.precio_envio || 0,
                        estado: productoMongo.estado || 'activo',
                        fecha_creacion: productoMongo.fecha_creacion
                    }
                };
                return res.json(detalleCompleto);
            }
            // Si no está en MongoDB, buscar en el servicio (datos demo)
            const productos = yield productsService_1.productsService.getProductos();
            producto = productos.find(p => p.id_producto.toString() === id);
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
        }
        // 3. Construir respuesta combinada
        const detalleCompleto = {
            producto: publicacion || producto,
            vendedor: vendedor || {
                id: (publicacion === null || publicacion === void 0 ? void 0 : publicacion.id_vendedor) || 'unknown',
                nombre: 'Información no disponible',
                tipo: 'vendedor'
            },
            publicacion: publicacion ? {
                multimedia: publicacion.multimedia || [],
                despacho: publicacion.despacho || 'retiro_en_tienda',
                precio_envio: publicacion.precio_envio || 0,
                estado: publicacion.estado || 'activo',
                fecha_creacion: publicacion.fecha_creacion,
                fecha_modificacion: publicacion.fecha_modificacion
            } : null
        };
        res.json(detalleCompleto);
    }
    catch (error) {
        console.error('Error al obtener detalle del producto:', error);
        res.status(500).json({
            error: 'Error al obtener detalle del producto',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.getProductDetail = getProductDetail;
