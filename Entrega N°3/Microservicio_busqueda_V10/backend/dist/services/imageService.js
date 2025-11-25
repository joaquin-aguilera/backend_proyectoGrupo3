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
exports.ImageService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ImageService {
    /**
     * Inicializar directorio de caché
     */
    static initialize() {
        if (!fs_1.default.existsSync(this.cacheDir)) {
            fs_1.default.mkdirSync(this.cacheDir, { recursive: true });
            console.log('✓ Directorio de caché de imágenes creado');
        }
    }
    /**
     * Obtener imagen optimizada (con caché)
     */
    static getOptimizedImage(imageName_1) {
        return __awaiter(this, arguments, void 0, function* (imageName, options = {}) {
            try {
                // Opciones por defecto para imágenes de categorías
                const defaultOptions = {
                    width: 800,
                    height: 600,
                    quality: 85,
                    fit: 'cover'
                };
                const finalOptions = Object.assign(Object.assign({}, defaultOptions), options);
                // Construir nombre de archivo en caché
                const cacheFileName = this.getCacheFileName(imageName, finalOptions);
                const cachePath = path_1.default.join(this.cacheDir, cacheFileName);
                // Verificar si existe en caché
                if (fs_1.default.existsSync(cachePath)) {
                    return fs_1.default.readFileSync(cachePath);
                }
                // Buscar imagen original
                const originalPath = this.findOriginalImage(imageName);
                if (!originalPath) {
                    console.error(`Imagen no encontrada: ${imageName}`);
                    return null;
                }
                // Procesar imagen
                const buffer = yield (0, sharp_1.default)(originalPath)
                    .resize(finalOptions.width, finalOptions.height, {
                    fit: finalOptions.fit,
                    withoutEnlargement: true // No agrandar imágenes pequeñas
                })
                    .jpeg({ quality: finalOptions.quality })
                    .toBuffer();
                // Guardar en caché
                fs_1.default.writeFileSync(cachePath, buffer);
                console.log(`✓ Imagen optimizada y cacheada: ${cacheFileName}`);
                return buffer;
            }
            catch (error) {
                console.error(`Error al optimizar imagen ${imageName}:`, error);
                return null;
            }
        });
    }
    /**
     * Buscar imagen original con múltiples extensiones
     */
    static findOriginalImage(imageName) {
        const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const baseNameWithoutExt = path_1.default.parse(imageName).name;
        for (const ext of extensions) {
            const fullPath = path_1.default.join(this.categoriesDir, `${baseNameWithoutExt}${ext}`);
            if (fs_1.default.existsSync(fullPath)) {
                return fullPath;
            }
        }
        return null;
    }
    /**
     * Generar nombre de archivo para caché
     */
    static getCacheFileName(imageName, options) {
        const baseName = path_1.default.parse(imageName).name;
        const { width, height, quality, fit } = options;
        return `${baseName}_${width}x${height}_q${quality}_${fit}.jpg`;
    }
    /**
     * Limpiar caché de imágenes
     */
    static clearCache() {
        if (fs_1.default.existsSync(this.cacheDir)) {
            const files = fs_1.default.readdirSync(this.cacheDir);
            files.forEach(file => {
                fs_1.default.unlinkSync(path_1.default.join(this.cacheDir, file));
            });
            console.log(`✓ Caché limpiado: ${files.length} archivos eliminados`);
        }
    }
    /**
     * Pre-generar miniaturas de todas las categorías
     */
    static pregenerateCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Pregenerando imágenes optimizadas de categorías...');
            const categoryImages = [
                'Alimentos.jpg',
                'Automotriz.jpg',
                'Belleza.jpg',
                'Calzado.jpg',
                'Deportes.jpg',
                'Electrónica.jpg',
                'General.jpg',
                'Hogar.jpg',
                'Juguetes.jpg',
                'Libros.jpg',
                'Mascotas.jpg',
                'Oficina.jpg',
                'Ropa.jpg',
                'Todo.jpg'
            ];
            let success = 0;
            let failed = 0;
            for (const imageName of categoryImages) {
                try {
                    yield this.getOptimizedImage(imageName, {
                        width: 800,
                        height: 600,
                        quality: 85,
                        fit: 'cover'
                    });
                    success++;
                }
                catch (error) {
                    console.error(`Error al pregenerar ${imageName}:`, error);
                    failed++;
                }
            }
            console.log(`✓ Pregeneración completa: ${success} éxitos, ${failed} fallos`);
        });
    }
}
exports.ImageService = ImageService;
ImageService.cacheDir = path_1.default.join(__dirname, '../../public/images/cache');
ImageService.categoriesDir = path_1.default.join(__dirname, '../../public/images/categories');
