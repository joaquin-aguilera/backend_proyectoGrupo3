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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearImageCache = exports.getCategoryImage = void 0;
const imageService_1 = require("../services/imageService");
/**
 * Servir imagen de categoría optimizada
 */
const getCategoryImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { imageName } = req.params;
        if (!imageName) {
            return res.status(400).json({ error: 'Nombre de imagen requerido' });
        }
        // Validar nombre de archivo (seguridad)
        if (imageName.includes('..') || imageName.includes('/') || imageName.includes('\\')) {
            return res.status(400).json({ error: 'Nombre de archivo inválido' });
        }
        // Obtener dimensiones de query params (opcional)
        const width = req.query.width ? parseInt(req.query.width) : undefined;
        const height = req.query.height ? parseInt(req.query.height) : undefined;
        const quality = req.query.quality ? parseInt(req.query.quality) : undefined;
        // Obtener imagen optimizada
        const imageBuffer = yield imageService_1.ImageService.getOptimizedImage(imageName, {
            width,
            height,
            quality
        });
        if (!imageBuffer) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        // Configurar headers de caché (1 día)
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('ETag', `"${imageName}-${width}-${height}"`);
        res.send(imageBuffer);
    }
    catch (error) {
        console.error('Error al servir imagen:', error);
        res.status(500).json({ error: 'Error al procesar la imagen' });
    }
});
exports.getCategoryImage = getCategoryImage;
/**
 * Limpiar caché de imágenes (endpoint administrativo)
 */
const clearImageCache = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        imageService_1.ImageService.clearCache();
        res.json({ success: true, message: 'Caché de imágenes limpiado' });
    }
    catch (error) {
        console.error('Error al limpiar caché:', error);
        res.status(500).json({ error: 'Error al limpiar caché' });
    }
});
exports.clearImageCache = clearImageCache;
