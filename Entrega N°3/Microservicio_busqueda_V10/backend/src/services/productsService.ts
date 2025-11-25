import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import Product from '../models/Product';

dotenv.config();

export interface ProductoFromAPI {
  id_producto: number;
  id_tienda: number;
  nombre: string;
  stock: number;
  precio: number;
  sku: string;
  condicion: string; // NUEVO, USADO
  fecha_creacion: string;
  marca: string;
  categoria: string; // GENERAL, etc
  descripcion: string;
}

// Interfaz normalizada para el backend (alineada con API real)
export interface ProductoNormalizado {
  id_producto: number;
  id_tienda: number;
  nombre: string;
  precio: number;
  categoria: CategoriaProducto;
  condicion: CondicionProducto;
  stock: number;
  sku: string;
  descripcion: string;
  marca: string;
  fecha_creacion: string;
}

export interface FilterOptions {
  precio_min?: number;
  precio_max?: number;
  categoria?: string;
  condicion?: string;
  page?: number;
  take?: number;
  id_tienda?: number;
  order?: 'ASC' | 'DESC';
}

// Tipos válidos según API OpenAPI y frontend
type CondicionProducto = 'NUEVO' | 'USADO' | 'REACONDICIONADO';
type CategoriaProducto = 
  | 'ELECTRÓNICA'
  | 'ROPA'
  | 'CALZADO'
  | 'HOGAR'
  | 'JUGUETES'
  | 'DEPORTES'
  | 'LIBROS'
  | 'ALIMENTOS'
  | 'BELLEZA'
  | 'OFICINA'
  | 'AUTOMOTRIZ'
  | 'MASCOTAS'
  | 'GENERAL';

// Mapeo de categorías de productos de prueba a las categorías estándar
const CATEGORIA_MAPPING: Record<string, CategoriaProducto> = {
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
const CONDICION_MAPPING: Record<string, CondicionProducto> = {
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

export class ProductsService {
  private apiClient: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.PRODUCTS_API_URL || 'http://localhost:4040/api';
    
    this.apiClient = axios.create({
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
  private normalizeProduct(producto: ProductoFromAPI): ProductoNormalizado {
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
  private getDemoProducts(): ProductoNormalizado[] {
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
   * Obtiene productos de API externa primero, luego MongoDB, finalmente datos demo
   */
  async getProductos(filters?: FilterOptions): Promise<ProductoNormalizado[]> {
    try {
      // 1. Intentar obtener productos de API externa primero
      const params: Record<string, any> = {
        take: filters?.take || 100,
      };

      if (filters?.precio_min !== undefined) {
        params.precio_min = filters.precio_min;
      }
      if (filters?.precio_max !== undefined) {
        params.precio_max = filters.precio_max;
      }
      if (filters?.page !== undefined) {
        params.page = filters.page;
      }

      try {
        const response = await this.apiClient.get('/publicaciones', { params });

        // Si el endpoint retorna array directamente o dentro de data
        const data = Array.isArray(response.data) ? response.data : response.data.data;
        
        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`✓ Productos obtenidos de API externa: ${data.length}`);
          
          // Normalizar productos desde API
          let productos = data.map((p: ProductoFromAPI) => this.normalizeProduct(p));

          // Filtrar por categoría y condición en memoria
          if (filters?.categoria) {
            productos = productos.filter(
              (p: ProductoNormalizado) => p.categoria.toLowerCase() === filters.categoria!.toLowerCase()
            );
          }

          if (filters?.condicion) {
            productos = productos.filter(
              (p: ProductoNormalizado) => p.condicion.toLowerCase() === filters.condicion!.toLowerCase()
            );
          }

          return productos;
        }
      } catch (apiError: any) {
        console.warn('API externa no disponible, intentando MongoDB...', apiError.message);
      }

      // 2. Si API externa falla, intentar MongoDB
      const productosDB = await Product.find({}).lean();
      
      if (productosDB && productosDB.length > 0) {
        console.log(`✓ Productos obtenidos de MongoDB: ${productosDB.length}`);
        
        // Normalizar productos de MongoDB
        let productos = productosDB.map((p: any) => ({
          id_producto: p.id,
          id_tienda: 1, // Default tienda
          nombre: p.nombre,
          precio: p.precio,
          categoria: CATEGORIA_MAPPING[p.categoria] || 'GENERAL',
          condicion: CONDICION_MAPPING[p.condicion] || 'NUEVO',
          stock: p.stock,
          sku: p.sku,
          descripcion: p.descripcion,
          marca: p.marca,
          fecha_creacion: p.fecha_creacion?.toISOString() || new Date().toISOString()
        }));

        // Aplicar filtros
        if (filters?.precio_min) {
          productos = productos.filter(p => p.precio >= filters.precio_min!);
        }
        if (filters?.precio_max) {
          productos = productos.filter(p => p.precio <= filters.precio_max!);
        }
        if (filters?.categoria) {
          productos = productos.filter(
            p => p.categoria.toLowerCase() === filters.categoria!.toLowerCase()
          );
        }
        if (filters?.condicion) {
          productos = productos.filter(
            p => p.condicion.toLowerCase() === filters.condicion!.toLowerCase()
          );
        }

        return productos;
      }

      // 3. Si todo falla, usar datos de demostración
      console.warn('Usando datos de demostración');
      let demoProducts = this.getDemoProducts();

      // Aplicar filtros a los datos de demostración
      if (filters?.precio_min || filters?.precio_max) {
        demoProducts = demoProducts.filter(p => {
          if (filters.precio_min && p.precio < filters.precio_min) return false;
          if (filters.precio_max && p.precio > filters.precio_max) return false;
          return true;
        });
      }

      if (filters?.categoria) {
        demoProducts = demoProducts.filter(
          p => p.categoria.toLowerCase() === filters.categoria!.toLowerCase()
        );
      }

      if (filters?.condicion) {
        demoProducts = demoProducts.filter(
          p => p.condicion.toLowerCase() === filters.condicion!.toLowerCase()
        );
      }

      return demoProducts;
    } catch (error: any) {
      // Catch final por si MongoDB o cualquier otra cosa falla
      console.error('Error general al obtener productos:', error.message);
      return this.getDemoProducts();
    }
  }

  /**
   * Obtiene un producto específico por SKU
   */
  async getProductoBySKU(sku: string): Promise<ProductoNormalizado | null> {
    try {
      const response = await this.apiClient.get(`/productos/${sku}`);
      return this.normalizeProduct(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching product by SKU:', error);
      throw new Error('Error al obtener producto');
    }
  }

  /**
   * Busca productos por término de búsqueda (búsqueda en memoria de los productos obtenidos)
   */
  async searchProductos(
    searchTerm: string,
    filters?: FilterOptions
  ): Promise<ProductoNormalizado[]> {
    const productos = await this.getProductos(filters);

    if (!searchTerm || searchTerm.trim() === '') {
      return productos;
    }

    const searchLower = searchTerm.toLowerCase();
    return productos.filter(
      p =>
        p.nombre.toLowerCase().includes(searchLower) ||
        p.descripcion.toLowerCase().includes(searchLower) ||
        p.marca.toLowerCase().includes(searchLower)
    );
  }
}

// Exportar instancia singleton
export const productsService = new ProductsService();
