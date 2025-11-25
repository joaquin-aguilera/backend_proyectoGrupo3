import { Request, Response } from 'express';
import { SearchService, SearchFilters, Suggestion } from '../services/searchService';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestError } from '../errors/BadRequestError';

interface Filtros extends SearchFilters { }

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  ubicacion: string;
  condicion: string;
  descripcion: string;
}

const getProductos = (): Producto[] => {
  const filePath = path.join(__dirname, '../data/productos.json');
  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);
  return data.productos;
};

const filtrarProductos = (productos: Producto[], busqueda: string, filtros: Filtros) => {
  return productos.filter(producto => {
    // Si no hay búsqueda, solo aplicar filtros
    if (!busqueda) {
      // Verificar filtros
      if (filtros.precio) {
        const precio = producto.precio;
        switch (filtros.precio) {
          case 'hasta 100':
            if (precio > 100) return false;
            break;
          case 'entre 100 - 200':
            if (precio <= 100 || precio > 200) return false;
            break;
          case 'entre 200 - 300':
            if (precio <= 200 || precio > 300) return false;
            break;
        }
      }

      if (filtros.categoria && producto.categoria !== filtros.categoria) return false;
      if (filtros.ubicacion && producto.ubicacion !== filtros.ubicacion) return false;
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
        case 'hasta 100':
          if (precio > 100) return false;
          break;
        case 'entre 100 - 200':
          if (precio <= 100 || precio > 200) return false;
          break;
        case 'entre 200 - 300':
          if (precio <= 200 || precio > 300) return false;
          break;
      }
    }

    if (filtros.categoria && producto.categoria !== filtros.categoria) return false;
    if (filtros.ubicacion && producto.ubicacion !== filtros.ubicacion) return false;
    if (filtros.condicion && producto.condicion !== filtros.condicion) return false;

    return true;
  });
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

    const productos = getProductos();

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
    };

    const { busqueda = '', precio, categoria, ubicacion, condicion } = safe;
    const productos = getProductos();

    // Construir objeto de filtros solo con los valores que existen
    const filtros: Filtros = {};
    if (precio) filtros.precio = precio as string;
    if (categoria) filtros.categoria = categoria as string;
    if (ubicacion) filtros.ubicacion = ubicacion as string;
    if (condicion) filtros.condicion = condicion as string;

    const resultados = filtrarProductos(productos, (busqueda as string) || '', filtros);

    // Guardar la búsqueda en MongoDB solo si hay término de búsqueda
    if (busqueda) {
      await SearchService.saveSearch({
        userId: req.userId?.toString(),
        queryText: busqueda as string,
        filters: filtros,
        results: resultados.map((producto, index) => ({
          productId: producto.id.toString(),
          position: index + 1,
        })),
      });
    }

    const endTime = Date.now();
    console.log(`Búsqueda realizada en ${endTime - startTime}ms`);
    console.log(`Resultados encontrados: ${resultados.length}`);

    res.json(resultados);
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
    const productos = getProductos();

    const endTime = Date.now();
    console.log(`Todos los productos obtenidos en ${endTime - startTime}ms`);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    res.status(500).json({ error: 'Error al obtener todos los productos' });
  }
};

export const getSearchHistory = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const historial = await SearchService.getSearchHistory(req.userId?.toString());

    const endTime = Date.now();
    console.log(`Historial obtenido en ${endTime - startTime}ms`);

    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
};