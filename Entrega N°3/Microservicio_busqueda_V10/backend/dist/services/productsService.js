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
exports.productsService = exports.ProductsService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Mapeo de categorías de productos de prueba a las categorías estándar
const CATEGORIA_MAPPING = {
    'Electrónica': 'ELECTRÓNICA',
    'electronica': 'ELECTRÓNICA',
    'ELECTRONICA': 'ELECTRÓNICA',
    'ELECTRÓNICA': 'ELECTRÓNICA',
    'Ropa': 'ROPA',
    'ropa': 'ROPA',
    'ROPA': 'ROPA',
    'Calzado': 'CALZADO',
    'calzado': 'CALZADO',
    'CALZADO': 'CALZADO',
    'Hogar': 'HOGAR',
    'hogar': 'HOGAR',
    'HOGAR': 'HOGAR',
    'Muebles': 'HOGAR', // Muebles se mapea a HOGAR
    'muebles': 'HOGAR',
    'MUEBLES': 'HOGAR',
    'Juguetes': 'JUGUETES',
    'juguetes': 'JUGUETES',
    'JUGUETES': 'JUGUETES',
    'Deportes': 'DEPORTES',
    'deportes': 'DEPORTES',
    'DEPORTES': 'DEPORTES',
    'Libros': 'LIBROS',
    'libros': 'LIBROS',
    'LIBROS': 'LIBROS',
    'Alimentos': 'ALIMENTOS',
    'alimentos': 'ALIMENTOS',
    'ALIMENTOS': 'ALIMENTOS',
    'Belleza': 'BELLEZA',
    'belleza': 'BELLEZA',
    'BELLEZA': 'BELLEZA',
    'Oficina': 'OFICINA',
    'oficina': 'OFICINA',
    'OFICINA': 'OFICINA',
    'Automotriz': 'AUTOMOTRIZ',
    'automotriz': 'AUTOMOTRIZ',
    'AUTOMOTRIZ': 'AUTOMOTRIZ',
    'Mascotas': 'MASCOTAS',
    'mascotas': 'MASCOTAS',
    'MASCOTAS': 'MASCOTAS',
    'Accesorios': 'GENERAL', // Accesorios se mapea a GENERAL
    'accesorios': 'GENERAL',
    'ACCESORIOS': 'GENERAL',
    'General': 'GENERAL',
    'general': 'GENERAL',
    'GENERAL': 'GENERAL',
};
// Mapeo de condiciones
const CONDICION_MAPPING = {
    'nuevo': 'NUEVO',
    'Nuevo': 'NUEVO',
    'NUEVO': 'NUEVO',
    'usado': 'USADO',
    'Usado': 'USADO',
    'USADO': 'USADO',
    'reacondicionado': 'REACONDICIONADO',
    'Reacondicionado': 'REACONDICIONADO',
    'REACONDICIONADO': 'REACONDICIONADO',
};
class ProductsService {
    constructor() {
        this.baseURL = process.env.PRODUCTS_API_URL || 'http://localhost:4040/api';
        this.apiClient = axios_1.default.create({
            baseURL: this.baseURL,
            timeout: 10000,
        });
        // Agregar token si existe
        if (process.env.PRODUCTS_API_TOKEN) {
            this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${process.env.PRODUCTS_API_TOKEN}`;
        }
    }
    /**
     * Normaliza un producto de la API externa al formato interno
     */
    normalizeProduct(producto) {
        // Normalizar categoría usando el mapeo
        const categoriaNormalizada = CATEGORIA_MAPPING[producto.categoria] || 'GENERAL';
        // Normalizar condición usando el mapeo
        const condicionNormalizada = CONDICION_MAPPING[producto.condicion] || 'NUEVO';
        return {
            id_producto: producto.id_producto,
            id_tienda: producto.id_tienda,
            nombre: producto.nombre,
            precio: producto.precio,
            categoria: categoriaNormalizada,
            condicion: condicionNormalizada,
            stock: producto.stock,
            sku: producto.sku,
            descripcion: producto.descripcion || 'Sin descripción',
            marca: producto.marca || 'Genérica',
            fecha_creacion: producto.fecha_creacion,
        };
    }
    /**
     * Datos de demostración cuando la API no está disponible
     * Alineados con la especificación OpenAPI real
     */
    getDemoProducts() {
        return [
            { id_producto: 1, id_tienda: 3, nombre: "Laptop HP Pavilion 15", precio: 450, categoria: "ELECTRÓNICA", condicion: "NUEVO", stock: 10, sku: "HP-PAV-001", descripcion: "Laptop HP Pavilion 15.6 pulgadas, procesador Intel Core i5", marca: "HP", fecha_creacion: new Date().toISOString() },
            { id_producto: 2, id_tienda: 3, nombre: "Monitor LG 24 pulgadas", precio: 180, categoria: "ELECTRÓNICA", condicion: "NUEVO", stock: 15, sku: "LG-MON-002", descripcion: "Monitor LG 24 pulgadas Full HD IPS", marca: "LG", fecha_creacion: new Date().toISOString() },
            { id_producto: 3, id_tienda: 3, nombre: "Teclado Mecánico RGB", precio: 85, categoria: "GENERAL", condicion: "NUEVO", stock: 25, sku: "KEY-RGB-003", descripcion: "Teclado mecánico con iluminación RGB programable", marca: "Corsair", fecha_creacion: new Date().toISOString() },
            { id_producto: 4, id_tienda: 3, nombre: "Mouse Inalámbrico Logitech", precio: 35, categoria: "GENERAL", condicion: "NUEVO", stock: 30, sku: "MOUSE-LOG-004", descripcion: "Mouse inalámbrico Logitech con batería de larga duración", marca: "Logitech", fecha_creacion: new Date().toISOString() },
            { id_producto: 5, id_tienda: 3, nombre: "Silla Gamer Premium", precio: 280, categoria: "HOGAR", condicion: "NUEVO", stock: 8, sku: "CHAIR-GAM-005", descripcion: "Silla gamer con soporte lumbar ajustable", marca: "DXRacer", fecha_creacion: new Date().toISOString() },
            { id_producto: 6, id_tienda: 3, nombre: "Escritorio Ajustable", precio: 320, categoria: "HOGAR", condicion: "NUEVO", stock: 5, sku: "DESK-ADJ-006", descripcion: "Escritorio ajustable en altura con motor eléctrico", marca: "FlexiSpot", fecha_creacion: new Date().toISOString() },
            { id_producto: 7, id_tienda: 3, nombre: "Webcam 1080p HD", precio: 55, categoria: "GENERAL", condicion: "NUEVO", stock: 20, sku: "WEBCAM-HD-007", descripcion: "Webcam Full HD 1080p con micrófono integrado", marca: "Logitech", fecha_creacion: new Date().toISOString() },
            { id_producto: 8, id_tienda: 3, nombre: "Headset Gamer Pro", precio: 120, categoria: "GENERAL", condicion: "NUEVO", stock: 18, sku: "HEADSET-PRO-008", descripcion: "Headset gamer con cancelación de ruido y sonido 7.1", marca: "SteelSeries", fecha_creacion: new Date().toISOString() },
            { id_producto: 9, id_tienda: 3, nombre: "Hub USB 3.0 (7 puertos)", precio: 45, categoria: "GENERAL", condicion: "NUEVO", stock: 22, sku: "HUB-USB-009", descripcion: "Hub USB 3.0 con 7 puertos independientes", marca: "Belkin", fecha_creacion: new Date().toISOString() },
            { id_producto: 10, id_tienda: 3, nombre: "Micrófono Condenser USB", precio: 95, categoria: "GENERAL", condicion: "NUEVO", stock: 12, sku: "MIC-COND-010", descripcion: "Micrófono condenser USB profesional para streaming", marca: "Audio-Technica", fecha_creacion: new Date().toISOString() },
            { id_producto: 11, id_tienda: 3, nombre: "Laptop Dell XPS 13", precio: 850, categoria: "ELECTRÓNICA", condicion: "USADO", stock: 3, sku: "DELL-XPS-011", descripcion: "Laptop Dell XPS 13 usada, excelente estado", marca: "Dell", fecha_creacion: new Date().toISOString() },
            { id_producto: 12, id_tienda: 3, nombre: "Teclado Inalámbrico", precio: 42, categoria: "GENERAL", condicion: "USADO", stock: 5, sku: "KEY-WIRELESS-012", descripcion: "Teclado inalámbrico usado en buen estado", marca: "Microsoft", fecha_creacion: new Date().toISOString() },
            { id_producto: 13, id_tienda: 3, nombre: "Monitor 27 pulgadas 144Hz", precio: 320, categoria: "ELECTRÓNICA", condicion: "NUEVO", stock: 7, sku: "MON-27-144-013", descripcion: "Monitor 27 pulgadas para gaming 144Hz", marca: "ASUS", fecha_creacion: new Date().toISOString() },
            { id_producto: 14, id_tienda: 3, nombre: "Dock para Laptop", precio: 65, categoria: "GENERAL", condicion: "NUEVO", stock: 14, sku: "DOCK-LAPTOP-014", descripcion: "Dock USB-C para conectar múltiples dispositivos", marca: "Anker", fecha_creacion: new Date().toISOString() },
            { id_producto: 15, id_tienda: 3, nombre: "Mousepad Grande", precio: 25, categoria: "GENERAL", condicion: "NUEVO", stock: 50, sku: "MOUSEPAD-L-015", descripcion: "Mousepad XXL con superficie antideslizante", marca: "SteelSeries", fecha_creacion: new Date().toISOString() },
        ];
    }
    /**
     * Obtiene productos de la API con filtros opcionales
     * En caso de error 401, retorna datos de demostración
     */
    getProductos(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const params = {
                    take: (filters === null || filters === void 0 ? void 0 : filters.take) || 100,
                };
                if ((filters === null || filters === void 0 ? void 0 : filters.precio_min) !== undefined) {
                    params.precio_min = filters.precio_min;
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.precio_max) !== undefined) {
                    params.precio_max = filters.precio_max;
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.page) !== undefined) {
                    params.page = filters.page;
                }
                const response = yield this.apiClient.get('/publicaciones', { params });
                // Si el endpoint retorna array directamente o dentro de data
                const data = Array.isArray(response.data) ? response.data : response.data.data;
                if (!data || !Array.isArray(data)) {
                    console.warn('Respuesta inesperada de API de productos, usando datos de demostración');
                    return this.getDemoProducts();
                }
                // Normalizar productos desde API
                let productos = data.map((p) => this.normalizeProduct(p));
                // Filtrar por categoría y condición en memoria
                if (filters === null || filters === void 0 ? void 0 : filters.categoria) {
                    productos = productos.filter((p) => p.categoria.toLowerCase() === filters.categoria.toLowerCase());
                }
                if (filters === null || filters === void 0 ? void 0 : filters.condicion) {
                    productos = productos.filter((p) => p.condicion.toLowerCase() === filters.condicion.toLowerCase());
                }
                return productos;
            }
            catch (error) {
                // Si hay error (401, timeout, etc), usar datos de demostración
                if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    console.warn('API requiere autenticación (401). Usando datos de demostración.');
                }
                else {
                    console.warn('Error fetching products from external API:', error.message, '. Usando datos de demostración.');
                }
                // Retornar datos de demostración para que el usuario pueda probar
                let demoProducts = this.getDemoProducts();
                // Aplicar filtros a los datos de demostración
                if ((filters === null || filters === void 0 ? void 0 : filters.precio_min) || (filters === null || filters === void 0 ? void 0 : filters.precio_max)) {
                    demoProducts = demoProducts.filter(p => {
                        if (filters.precio_min && p.precio < filters.precio_min)
                            return false;
                        if (filters.precio_max && p.precio > filters.precio_max)
                            return false;
                        return true;
                    });
                }
                if (filters === null || filters === void 0 ? void 0 : filters.categoria) {
                    demoProducts = demoProducts.filter(p => p.categoria.toLowerCase() === filters.categoria.toLowerCase());
                }
                if (filters === null || filters === void 0 ? void 0 : filters.condicion) {
                    demoProducts = demoProducts.filter(p => p.condicion.toLowerCase() === filters.condicion.toLowerCase());
                }
                return demoProducts;
            }
        });
    }
    /**
     * Obtiene un producto específico por SKU
     */
    getProductoBySKU(sku) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.apiClient.get(`/productos/${sku}`);
                return this.normalizeProduct(response.data);
            }
            catch (error) {
                if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                    return null;
                }
                console.error('Error fetching product by SKU:', error);
                throw new Error('Error al obtener producto');
            }
        });
    }
    /**
     * Busca productos por término de búsqueda (búsqueda en memoria de los productos obtenidos)
     */
    searchProductos(searchTerm, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const productos = yield this.getProductos(filters);
            if (!searchTerm || searchTerm.trim() === '') {
                return productos;
            }
            const searchLower = searchTerm.toLowerCase();
            return productos.filter(p => p.nombre.toLowerCase().includes(searchLower) ||
                p.descripcion.toLowerCase().includes(searchLower) ||
                p.marca.toLowerCase().includes(searchLower));
        });
    }
}
exports.ProductsService = ProductsService;
// Exportar instancia singleton
exports.productsService = new ProductsService();
