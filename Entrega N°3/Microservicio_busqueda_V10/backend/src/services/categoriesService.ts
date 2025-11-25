import { productsService } from './productsService';
import Click from '../models/Click';
import fs from 'fs';
import path from 'path';

export interface Category {
  nombre: string;
  imagen: string | null;
  totalProductos: number;
}

export interface TopProduct {
  productId: string;
  totalClicks: number;
  producto?: any;
}

export class CategoriesService {
  private static categoriesImagePath = path.join(__dirname, '../../public/images/categories');
  private static imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  /**
   * Busca la imagen de una categoría soportando múltiples extensiones
   * Maneja nombres con mayúsculas/minúsculas y acentos
   * Retorna URL de imagen optimizada
   */
  private static findCategoryImage(categoryName: string): string | null {
    // Primero intentar con el nombre exacto
    for (const ext of this.imageExtensions) {
      const imagePath = path.join(this.categoriesImagePath, `${categoryName}${ext}`);
      if (fs.existsSync(imagePath)) {
        // Retornar URL de API de imágenes optimizadas
        return `/api/images/categories/${categoryName}${ext}`;
      }
    }

    // Si no encuentra, buscar case-insensitive con capitalización
    try {
      const files = fs.readdirSync(this.categoriesImagePath);
      const categoryLower = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      for (const file of files) {
        const fileNameWithoutExt = path.parse(file).name;
        const fileLower = fileNameWithoutExt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        if (fileLower === categoryLower) {
          // Retornar URL de API de imágenes optimizadas
          return `/api/images/categories/${file}`;
        }
      }
    } catch (error) {
      console.error('Error al buscar imagen de categoría:', error);
    }

    return null;
  }

  /**
   * Obtiene todas las categorías con sus imágenes y conteo de productos
   */
  static async getAllCategories(): Promise<Category[]> {
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
      const productos = await productsService.getProductos();

      // Agrupar por categoría y contar
      const categoriesMap = new Map<string, number>();
      productos.forEach(producto => {
        const categoria = producto.categoria;
        categoriesMap.set(categoria, (categoriesMap.get(categoria) || 0) + 1);
      });

      // Construir array de categorías con TODAS las categorías oficiales
      const categories: Category[] = CATEGORIAS_OFICIALES.map(categoria => ({
        nombre: categoria,
        imagen: this.findCategoryImage(categoria),
        totalProductos: categoriesMap.get(categoria) || 0
      }));

      // Ordenar alfabéticamente
      return categories.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtiene los productos más clickeados con sus detalles
   */
  static async getTopClickedProducts(limit: number = 6): Promise<TopProduct[]> {
    try {
      // Agregación en MongoDB para contar clicks por producto
      const topProducts = await Click.aggregate([
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
      const productos = await productsService.getProductos();
      
      // Mapear con información del producto
      const topProductsWithDetails: TopProduct[] = topProducts.map(item => {
        const producto = productos.find(p => p.id_producto.toString() === item._id);
        return {
          productId: item._id,
          totalClicks: item.totalClicks,
          producto: producto || null
        };
      });

      return topProductsWithDetails.filter(p => p.producto !== null);
    } catch (error) {
      console.error('Error al obtener productos más clickeados:', error);
      throw error;
    }
  }

  /**
   * Obtiene productos de una categoría específica
   */
  static async getProductsByCategory(categoryName: string): Promise<any[]> {
    try {
      const productos = await productsService.getProductos({
        categoria: categoryName
      });
      return productos;
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      throw error;
    }
  }
}
