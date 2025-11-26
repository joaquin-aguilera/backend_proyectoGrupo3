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
exports.getProductsByCategory = exports.getTopClickedProducts = exports.getAllCategories = void 0;
const categoriesService_1 = require("../services/categoriesService");
/**
 * Obtener todas las categorías con sus imágenes
 */
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        const categories = yield categoriesService_1.CategoriesService.getAllCategories();
        const endTime = Date.now();
        console.log(`Categorías obtenidas en ${endTime - startTime}ms`);
        res.json(categories);
    }
    catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});
exports.getAllCategories = getAllCategories;
/**
 * Obtener productos más clickeados
 */
const getTopClickedProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        const limit = parseInt(req.query.limit) || 6;
        // Validar límite
        if (limit < 1 || limit > 20) {
            return res.status(400).json({ error: 'El límite debe estar entre 1 y 20' });
        }
        const topProducts = yield categoriesService_1.CategoriesService.getTopClickedProducts(limit);
        const endTime = Date.now();
        console.log(`Top productos obtenidos en ${endTime - startTime}ms`);
        res.json({
            limit,
            total: topProducts.length,
            productos: topProducts
        });
    }
    catch (error) {
        console.error('Error al obtener productos más clickeados:', error);
        res.status(500).json({ error: 'Error al obtener productos más clickeados' });
    }
});
exports.getTopClickedProducts = getTopClickedProducts;
/**
 * Obtener productos de una categoría específica
 */
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        const { category } = req.params;
        if (!category) {
            return res.status(400).json({ error: 'La categoría es requerida' });
        }
        const productos = yield categoriesService_1.CategoriesService.getProductsByCategory(decodeURIComponent(category));
        const endTime = Date.now();
        console.log(`Productos de categoría '${category}' obtenidos en ${endTime - startTime}ms`);
        res.json({
            categoria: category,
            total: productos.length,
            productos
        });
    }
    catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        res.status(500).json({ error: 'Error al obtener productos de la categoría' });
    }
});
exports.getProductsByCategory = getProductsByCategory;
