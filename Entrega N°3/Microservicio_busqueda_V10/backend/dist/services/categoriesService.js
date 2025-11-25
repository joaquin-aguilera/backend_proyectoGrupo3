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
exports.CategoriesService = void 0;
const productsService_1 = require("./productsService");
const Click_1 = __importDefault(require("../models/Click"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CategoriesService {
    /**
     * Busca la imagen de una categoría soportando múltiples extensiones
     * Maneja nombres con mayúsculas/minúsculas y acentos
     * Retorna URL de imagen optimizada
     */
    static findCategoryImage(categoryName) {
        // Primero intentar con el nombre exacto
        for (const ext of this.imageExtensions) {
            const imagePath = path_1.default.join(this.categoriesImagePath, `${categoryName}${ext}`);
            if (fs_1.default.existsSync(imagePath)) {
                // Retornar URL de API de imágenes optimizadas
                return `/api/images/categories/${categoryName}${ext}`;
            }
        }
        // Si no encuentra, buscar case-insensitive con capitalización
        try {
            const files = fs_1.default.readdirSync(this.categoriesImagePath);
            const categoryLower = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            for (const file of files) {
                const fileNameWithoutExt = path_1.default.parse(file).name;
                const fileLower = fileNameWithoutExt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (fileLower === categoryLower) {
                    // Retornar URL de API de imágenes optimizadas
                    return `/api/images/categories/${file}`;
                }
            }
        }
        catch (error) {
            console.error('Error al buscar imagen de categoría:', error);
        }
        return null;
    }
    /**
     * Obtiene todas las categorías con sus imágenes y conteo de productos
     */
    static getAllCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Lista completa de categorías oficiales
                const CATEGORIAS_OFICIALES = [
                    'ELECTRÓNICA',
                    'ROPA',
                    'CALZADO',
                    'HOGAR',
                    'JUGUETES',
                    'DEPORTES',
                    'LIBROS',
                    'ALIMENTOS',
                    'BELLEZA',
                    'OFICINA',
                    'AUTOMOTRIZ',
                    'MASCOTAS',
                    'GENERAL'
                ];
                // Obtener todos los productos
                const productos = yield productsService_1.productsService.getProductos();
                // Agrupar por categoría y contar
                const categoriesMap = new Map();
                productos.forEach(producto => {
                    const categoria = producto.categoria;
                    categoriesMap.set(categoria, (categoriesMap.get(categoria) || 0) + 1);
                });
                // Construir array de categorías con TODAS las categorías oficiales
                const categories = CATEGORIAS_OFICIALES.map(categoria => ({
                    nombre: categoria,
                    imagen: this.findCategoryImage(categoria),
                    totalProductos: categoriesMap.get(categoria) || 0
                }));
                // Ordenar alfabéticamente
                return categories.sort((a, b) => a.nombre.localeCompare(b.nombre));
            }
            catch (error) {
                console.error('Error al obtener categorías:', error);
                throw error;
            }
        });
    }
    /**
     * Obtiene los productos más clickeados con sus detalles
     */
    static getTopClickedProducts() {
        return __awaiter(this, arguments, void 0, function* (limit = 6) {
            try {
                // Agregación en MongoDB para contar clicks por producto
                const topProducts = yield Click_1.default.aggregate([
                    {
                        $group: {
                            _id: '$productId',
                            totalClicks: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { totalClicks: -1 }
                    },
                    {
                        $limit: limit
                    }
                ]);
                // Obtener detalles de los productos desde la API
                const productos = yield productsService_1.productsService.getProductos();
                // Mapear con información del producto
                const topProductsWithDetails = topProducts.map(item => {
                    const producto = productos.find(p => p.id_producto.toString() === item._id);
                    return {
                        productId: item._id,
                        totalClicks: item.totalClicks,
                        producto: producto || null
                    };
                });
                return topProductsWithDetails.filter(p => p.producto !== null);
            }
            catch (error) {
                console.error('Error al obtener productos más clickeados:', error);
                throw error;
            }
        });
    }
    /**
     * Obtiene productos de una categoría específica
     */
    static getProductsByCategory(categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const productos = yield productsService_1.productsService.getProductos({
                    categoria: categoryName
                });
                return productos;
            }
            catch (error) {
                console.error('Error al obtener productos por categoría:', error);
                throw error;
            }
        });
    }
}
exports.CategoriesService = CategoriesService;
CategoriesService.categoriesImagePath = path_1.default.join(__dirname, '../../public/images/categories');
CategoriesService.imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
