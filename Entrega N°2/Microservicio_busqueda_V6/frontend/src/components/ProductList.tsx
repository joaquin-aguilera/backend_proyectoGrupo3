import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import ProductFilters from "./ProductFilters";
import { Product, FilterState, Sugerencia } from "../types";

const ProductList: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    precio: "",
    categoria: "",
    ubicacion: "",
    condicion: "",
  });

  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);

  // Cargar todos los productos al montar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Product[]>('http://localhost:3000/api/search/products/all');
        setProductos(response.data);
      } catch (err) {
        setError("Error al cargar los productos");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const buscarProductos = async (e?: FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setSugerencias([]); // Limpiar sugerencias al buscar
    
    // Forzar el cierre de las sugerencias inmediatamente
    const searchContainer = document.querySelector('.search-input-container');
    if (searchContainer) {
      searchContainer.blur();
    }
    
    try {
      if (!filters.search.trim() && !filters.precio && !filters.categoria && !filters.ubicacion && !filters.condicion) {
        // Si no hay filtros, cargar todos los productos
        const response = await axios.get<Product[]>('http://localhost:3000/api/search/products/all');
        setProductos(response.data);
        return;
      }

      const searchParams: Record<string, string> = {};
      
      // Solo incluir búsqueda si no está vacía
      if (filters.search.trim()) {
        searchParams.busqueda = filters.search.trim();
      }

      // Solo incluir filtros que tengan valor y no estén vacíos
      if (filters.precio && filters.precio !== "") searchParams.precio = filters.precio;
      if (filters.categoria && filters.categoria !== "") searchParams.categoria = filters.categoria;
      if (filters.ubicacion && filters.ubicacion !== "") searchParams.ubicacion = filters.ubicacion;
      if (filters.condicion && filters.condicion !== "") searchParams.condicion = filters.condicion;

      console.log('Enviando parámetros:', searchParams); // Para debug

      // Realizar la petición de búsqueda
      const response = await axios.get<Product[]>(`http://localhost:3000/api/search/products`, {
        params: searchParams
      });
      
      setProductos(response.data);
      
      try {
        // Guardar búsqueda en el historial para sugerencias futuras
        if (filters.search.trim()) {
          await axios.post("http://localhost:3000/api/search/history", {
            busqueda: filters.search,
            filtros: {
              precio: filters.precio || undefined,
              categoria: filters.categoria || undefined,
              ubicacion: filters.ubicacion || undefined,
              condicion: filters.condicion || undefined
            }
          });
        }
      } catch (historyErr) {
        // Si falla el guardado en el historial, no afectará la búsqueda
        console.error('Error al guardar en historial:', historyErr);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Error al realizar la búsqueda");
        console.error("Error detallado:", err.response?.data);
      } else {
        setError("Error al realizar la búsqueda");
        console.error("Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    if (!value.trim()) {
      setSugerencias([]);
    }
  };

  // Agregar manejador para cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector('.search-input-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setSugerencias([]);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const obtenerSugerencias = async (texto: string) => {
    if (!texto.trim()) {
      setSugerencias([]);
      return;
    }
    try {
      const response = await axios.get<Sugerencia[]>(`http://localhost:3000/api/search/suggestions?texto=${texto}`);
      setSugerencias(response.data);
    } catch (err) {
      console.error('Error al obtener sugerencias:', err);
      setSugerencias([]);
    }
  };

  const handleSugerenciaClick = async (sugerencia: Sugerencia) => {
    if (sugerencia.tipo === "historial" && sugerencia.filtros) {
      setFilters(prev => ({
        ...prev,
        ...sugerencia.filtros,
        search: sugerencia.texto
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        search: sugerencia.texto
      }));
    }
    setSugerencias([]); // Limpiar sugerencias inmediatamente
    
    // Forzar el cierre del contenedor de sugerencias
    const searchContainer = document.querySelector('.search-input-container input') as HTMLInputElement;
    if (searchContainer) {
      searchContainer.blur();
    }
    
    await buscarProductos();
  };

  return (
    <div className="product-page">
      <form onSubmit={buscarProductos} className="search-form">
        <ProductFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onSearchInput={obtenerSugerencias}
          sugerencias={sugerencias}
          onSugerenciaClick={handleSugerenciaClick}
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="productos-grid">
        {loading ? (
          <p>Cargando productos...</p>
        ) : productos.length > 0 ? (
          productos.map((p) => (
            <div key={p.id} className="producto-card">
              {p.image && <img src={p.image} alt={p.nombre} />}
              <h3>{p.nombre}</h3>
              <p className="precio">${p.precio}</p>
              <p className="descripcion">{p.descripcion}</p>
              <div className="detalles">
                <span className="categoria">
                  <strong>Categoría:</strong> {p.categoria}
                </span>
                <span className="ubicacion">
                  <strong>Ubicación:</strong> {p.ubicacion}
                </span>
                <span className={`condicion ${p.condicion}`}>
                  <strong>Condición:</strong> {p.condicion}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No se encontraron productos 😢</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
