import React from "react";
import { FilterState, Sugerencia } from "../types";

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onSearch: (value: string) => void;
  onSearchInput: (texto: string) => void;
  sugerencias: Sugerencia[];
  onSugerenciaClick: (sugerencia: Sugerencia) => void;
}

const categorias = ['Calzado', 'Tecnologia', 'Ropa'];
const ubicaciones = ['Valparaiso', 'Viña', 'Quilpue'];
const condiciones = ['nuevo', 'usado', 'dañado'];
const rangosPrecios = ['hasta 100', 'entre 100 - 200', 'entre 200 - 300'];

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onSearchInput,
  sugerencias,
  onSugerenciaClick
}) => {

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    onSearch(valor);
    onSearchInput(valor);
  };

  const handleSugerenciaClick = (sugerencia: Sugerencia) => {
    onSearch(sugerencia.texto);
    if (sugerencia.tipo === 'historial' && sugerencia.filtros) {
      Object.entries(sugerencia.filtros).forEach(([key, value]) => {
        if (value && key !== 'search') {
          onFilterChange(key as keyof FilterState, value);
        }
      });
    }
    onSugerenciaClick(sugerencia);
  };

  return (
    <div className="filters-container">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="¿Qué estás buscando?"
          value={filters.search}
          onChange={handleSearchInputChange}
          className="filter-input"
        />
        {sugerencias.length > 0 && (
          <div className="sugerencias">
            {sugerencias
              .filter(s => s.tipo === 'historial')
              .map((sugerencia, index) => (
                <div
                  key={`historial-${index}`}
                  className="sugerencia-item historial"
                  onClick={() => handleSugerenciaClick(sugerencia)}
                >
                  <span className="sugerencia-icon">🕒</span>
                  {sugerencia.texto}
                </div>
              ))}
            
            {sugerencias
              .filter(s => s.tipo === 'coincidencia')
              .map((sugerencia, index) => (
                <div
                  key={`coincidencia-${index}`}
                  className="sugerencia-item coincidencia"
                  onClick={() => handleSugerenciaClick(sugerencia)}
                >
                  <span className="sugerencia-icon">🔍</span>
                  {sugerencia.texto}
                </div>
              ))}
          </div>
        )}
      </div>

      <select
        value={filters.precio || ''}
        onChange={(e) => onFilterChange("precio", e.target.value)}
      >
        <option value="">Todos los precios</option>
        {rangosPrecios.map(rango => (
          <option key={rango} value={rango}>{rango}</option>
        ))}
      </select>

      <select
        value={filters.categoria || ''}
        onChange={(e) => onFilterChange("categoria", e.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categorias.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filters.ubicacion || ''}
        onChange={(e) => onFilterChange("ubicacion", e.target.value)}
      >
        <option value="">Todas las ubicaciones</option>
        {ubicaciones.map(ubi => (
          <option key={ubi} value={ubi}>{ubi}</option>
        ))}
      </select>

      <select
        value={filters.condicion || ''}
        onChange={(e) => onFilterChange("condicion", e.target.value)}
      >
        <option value="">Todas las condiciones</option>
        {condiciones.map(cond => (
          <option key={cond} value={cond}>{cond}</option>
        ))}
      </select>
    </div>
  );
};

export default ProductFilters;
