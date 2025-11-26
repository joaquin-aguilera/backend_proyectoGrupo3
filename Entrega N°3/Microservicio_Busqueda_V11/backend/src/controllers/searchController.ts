import { Request, Response } from 'express';
import { SearchService, SearchFilters, Suggestion } from '../services/searchService';
import { productsService, ProductoNormalizado } from '../services/productsService';
import { BadRequestError } from '../errors/BadRequestError';
import Search from '../models/Search';
import Product from '../models/Product';
import axios from 'axios';
import AuthService from '../services/authService';

interface Filtros extends SearchFilters { 
  ordenar?: string;
}

interface Producto {
  id_producto: number;
  id_tienda: number;
  nombre: string;
  precio: number;
  categoria: string;
  condicion: string;
  descripcion: string;
  stock?: number;
  sku?: string;
  marca?: string;
  fecha_creacion?: string;
}

const filtrarProductos = (productos: Producto[], busqueda: string, filtros: Filtros) => {
  let resultados = productos.filter(producto => {
    // Si no hay búsqueda, solo aplicar filtros
    if (!busqueda) {
      // Verificar filtros
      if (filtros.precio) {
        const precio = producto.precio;
        switch (filtros.precio) {
          case 'hasta 50':
            if (precio > 50) return false;
            break;
          case 'entre 50 - 100':
            if (precio <= 50 || precio > 100) return false;
            break;
          case 'entre 100 - 300':
            if (precio <= 100 || precio > 300) return false;
            break;
          case 'entre 300 - 500':
            if (precio <= 300 || precio > 500) return false;
            break;
          case 'mas de 500':
            if (precio <= 500) return false;
            break;
        }
      }

      if (filtros.categoria && producto.categoria !== filtros.categoria) return false;
      if (filtros.condicion && producto.condicion !== filtros.condicion) return false;

      return true;
    }

    // Si hay búsqueda, verificar coincidencia en el nombre (case-insensitive)
    const matchBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    if (!matchBusqueda) return false;

    // Aplicar filtros adicionales si hay coincidencia
    if (filtros.precio) {
      const precio = producto.precio;
      switch (filtros.precio) {
        case 'hasta 50':
          if (precio > 50) return false;
          break;
        case 'entre 50 - 100':
          if (precio <= 50 || precio > 100) return false;
          break;
        case 'entre 100 - 300':
          if (precio <= 100 || precio > 300) return false;
          break;
        case 'entre 300 - 500':
          if (precio <= 300 || precio > 500) return false;
          break;
        case 'mas de 500':
          if (precio <= 500) return false;
          break;
      }
    }

    if (filtros.categoria && producto.categoria !== filtros.categoria) return false;
    if (filtros.condicion && producto.condicion !== filtros.condicion) return false;

    return true;
  });

  // Aplicar ordenamiento si se especificó
  if (filtros.ordenar) {
    if (filtros.ordenar === 'precio-asc') {
      resultados.sort((a, b) => a.precio - b.precio);
    } else if (filtros.ordenar === 'precio-desc') {
      resultados.sort((a, b) => b.precio - a.precio);
    }
  }

  return resultados;
};

// Controladores
export const getSuggestions = async (req: Request, res: Response) => {
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
      const productos = await productsService.getProductos();

      // Buscar coincidencias solo en nombres de productos
      const coincidencias = productos
        .filter(producto => producto.nombre.toLowerCase().includes(textoSafe.toLowerCase()))
        .map(p => ({
          texto: p.nombre,
          tipo: 'coincidencia' as const,
        }));

      // Obtener sugerencias del historial desde MongoDB
      const historial = await SearchService.getSuggestions(textoSafe, req.userId?.toString());

      const sugerencias = [...historial, ...coincidencias.slice(0, 5)];

      const endTime = Date.now();
      console.log(`Sugerencias obtenidas en ${endTime - startTime}ms`);

      res.json(sugerencias);
    } catch (serviceError) {
      console.error('Error en servicio de sugerencias:', serviceError);
      res.status(500).json({ error: 'Error al obtener sugerencias' });
    }
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    res.status(500).json({ error: 'Error al obtener sugerencias' });
  }
};

export const search = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // Preferir parámetros saneados por el middleware (defensa en profundidad)
    const safe = ((req as any).searchQuery ?? req.query) as {
      busqueda?: string;
      precio?: string;
      categoria?: string;
      ubicacion?: string;
      condicion?: string;
      ordenar?: string;
    };

    const { busqueda = '', precio, categoria, condicion, ordenar } = safe;

    try {
      // Obtener productos de la API externa con filtros de precio
      const filterOptions: any = {};
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
      if (categoria) filterOptions.categoria = categoria;
      if (condicion) filterOptions.condicion = condicion;

      const productos = await productsService.getProductos(filterOptions);

      // Construir objeto de filtros solo con los valores que existen
      const filtros: Filtros = {};
      if (precio) filtros.precio = precio as string;
      if (categoria) filtros.categoria = categoria as string;
      if (condicion) filtros.condicion = condicion as string;
      if (ordenar) filtros.ordenar = ordenar as string;

      const resultados = filtrarProductos(productos as Producto[], (busqueda as string) || '', filtros);

      // Guardar la búsqueda en MongoDB siempre que haya resultados
      // (incluso si es solo navegación por categoría o filtros)
      let searchId: string | undefined;
      if (resultados.length > 0) {
        const searchRecord = await SearchService.saveSearch({
          userId: req.userId?.toString(),
          queryText: (busqueda as string) || '[navegación por categoría/filtros]',
          filters: filtros,
          results: resultados.map((producto, index) => ({
            productId: producto.id_producto.toString(),
            position: index + 1,
          })),
        });
        searchId = (searchRecord._id as any).toString();
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
    } catch (serviceError) {
      console.error('Error en servicio de búsqueda:', serviceError);
      res.status(500).json({ error: 'Error al realizar la búsqueda' });
    }
  } catch (error: any) {
    console.error('Error en búsqueda:', error);
    if (error instanceof BadRequestError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al realizar la búsqueda' });
  }
};

// Nuevo controlador para obtener todos los productos
export const getAllProducts = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    try {
      const productos = await productsService.getProductos();

      const endTime = Date.now();
      console.log(`Todos los productos obtenidos en ${endTime - startTime}ms`);

      res.json(productos);
    } catch (serviceError) {
      console.error('Error en servicio al obtener todos los productos:', serviceError);
      res.status(500).json({ error: 'Error al obtener todos los productos' });
    }
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    res.status(500).json({ error: 'Error al obtener todos los productos' });
  }
};

// Nuevo controlador para obtener productos aleatorios (excluye categoría TODO)
export const getRandomProducts = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const limitSafe = Math.min(Math.max(limit, 1), 50); // Entre 1 y 50

    // Obtener todos los productos
    const todosProductos = await productsService.getProductos();
    
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

  } catch (error) {
    console.error('Error al obtener productos aleatorios:', error);
    res.status(500).json({ error: 'Error al obtener productos aleatorios' });
  }
};

export const getSearchHistory = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    try {
      const historial = await SearchService.getSearchHistory(req.userId?.toString());

      const endTime = Date.now();
      console.log(`Historial obtenido en ${endTime - startTime}ms`);

      res.json(historial);
    } catch (serviceError) {
      console.error('Error en servicio al obtener historial:', serviceError);
      res.status(500).json({ error: 'Error al obtener el historial' });
    }
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
};

export const saveSearchHistory = async (req: Request, res: Response) => {
  try {
    try {
      const { busqueda, filtros } = req.body;

      // Validación básica
      if (!busqueda || typeof busqueda !== 'string') {
        return res.status(400).json({ error: 'busqueda es requerida y debe ser string' });
      }

      // Guardar la búsqueda en MongoDB
      const resultado = await SearchService.saveSearch({
        userId: req.userId?.toString(),
        queryText: busqueda,
        filters: filtros || {},
        results: [],
      });

      res.json({ success: true, message: 'Búsqueda guardada exitosamente', resultado });
    } catch (serviceError) {
      console.error('Error en servicio al guardar búsqueda:', serviceError);
      res.status(500).json({ error: 'Error al guardar la búsqueda' });
    }
  } catch (error) {
    console.error('Error al guardar búsqueda:', error);
    res.status(500).json({ error: 'Error al guardar la búsqueda' });
  }
};

// Controlador para registrar click en producto
export const registerProductClick = async (req: Request, res: Response) => {
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
    await SearchService.saveClick({
      searchId,
      productId,
      userId: req.userId?.toString(),
    });

    res.json({ success: true, message: 'Click registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar click:', error);
    res.status(500).json({ error: 'Error al registrar el click' });
  }
};

// Controlador para obtener clicks de un producto
export const getProductClicks = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: 'productId es requerido' });
    }

    const clicks = await SearchService.getClicksByProduct(productId);

    res.json({ productId, totalClicks: clicks.length, clicks });
  } catch (error) {
    console.error('Error al obtener clicks del producto:', error);
    res.status(500).json({ error: 'Error al obtener clicks del producto' });
  }
};

// Controlador para exportar búsquedas de productos (para integración con otros grupos)
export const getProductSearches = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { desde, hasta, limite } = req.query;

    // Construir filtro de fecha
    const filtroFecha: any = {};
    if (desde) {
      const fechaDesde = new Date(desde as string);
      if (!isNaN(fechaDesde.getTime())) {
        filtroFecha.$gte = fechaDesde;
      }
    }
    if (hasta) {
      const fechaHasta = new Date(hasta as string);
      if (!isNaN(fechaHasta.getTime())) {
        filtroFecha.$lte = fechaHasta;
      }
    }

    const matchFilter: any = {};
    if (Object.keys(filtroFecha).length > 0) {
      matchFilter.requestedAt = filtroFecha;
    }

    // Agregar limite si se especifica
    const limitNum = limite ? parseInt(limite as string, 10) : 1000;
    const limiteSafe = Math.min(Math.max(limitNum, 1), 10000); // Entre 1 y 10000

    // Obtener búsquedas desde MongoDB
    const searches = await Search.find(matchFilter)
      .sort({ requestedAt: -1 })
      .limit(limiteSafe)
      .select('results requestedAt queryText')
      .lean();

    // Obtener información de productos desde la API
    const productos = await productsService.getProductos();
    const productosMap = new Map(
      productos.map(p => [p.id_producto.toString(), p])
    );

    // Procesar y formatear datos para el otro grupo
    const busquedasProductos: Array<{
      id_producto: string;
      nombre: string;
      fecha: string;
      queryText?: string;
    }> = [];

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
  } catch (error) {
    console.error('Error al obtener búsquedas de productos:', error);
    res.status(500).json({ error: 'Error al obtener búsquedas de productos' });
  }
};

/**
 * Obtiene el detalle completo de un producto incluyendo información del vendedor/tienda
 */
export const getProductDetail = async (req: Request, res: Response) => {
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
      const pubResponse = await axios.get(`${PUBLICATIONS_API_URL}/publicaciones/${id}`, {
        timeout: 5000
      });
      publicacion = pubResponse.data;

      // 2. Intentar obtener información del vendedor desde el servicio de autenticación
      if (publicacion?.id_vendedor) {
        try {
          const vendedorResponse = await axios.get(
            `${process.env.AUTH_SERVICE_URL || 'http://localhost:3000'}/api/auth/user/${publicacion.id_vendedor}`,
            {
              timeout: 3000,
              headers: {
                Authorization: req.headers.authorization || ''
              }
            }
          );
          vendedor = vendedorResponse.data;
        } catch (vendedorError) {
          console.warn('No se pudo obtener info del vendedor:', vendedorError);
          // Continuar sin información del vendedor
        }
      }
    } catch (publicacionError) {
      console.warn('API de publicaciones no disponible, usando datos locales');
      
      // Fallback: buscar en MongoDB local primero (tiene datos completos)
      const productoMongo = await Product.findOne({ id: parseInt(id) }).lean();
      
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
          vendedor: (productoMongo as any).vendedor || {
            id: (productoMongo as any).id_vendedor || 'local_vendor',
            nombre: 'Vendedor Local',
            tipo: 'vendedor'
          },
          publicacion: {
            multimedia: (productoMongo as any).multimedia || [],
            despacho: (productoMongo as any).despacho || 'retiro_en_tienda',
            precio_envio: (productoMongo as any).precio_envio || 0,
            estado: (productoMongo as any).estado || 'activo',
            fecha_creacion: productoMongo.fecha_creacion
          }
        };
        
        return res.json(detalleCompleto);
      }
      
      // Si no está en MongoDB, buscar en el servicio (datos demo)
      const productos = await productsService.getProductos();
      producto = productos.find(p => p.id_producto.toString() === id);
      
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
    }

    // 3. Construir respuesta combinada
    const detalleCompleto = {
      producto: publicacion || producto,
      vendedor: vendedor || {
        id: publicacion?.id_vendedor || 'unknown',
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
  } catch (error) {
    console.error('Error al obtener detalle del producto:', error);
    res.status(500).json({ 
      error: 'Error al obtener detalle del producto',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};