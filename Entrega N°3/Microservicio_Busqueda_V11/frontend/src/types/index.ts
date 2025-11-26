export interface Product {
  id_producto: number;
  id_tienda: number;
  nombre: string;
  precio: number;
  categoria: string;
  condicion: string;
  descripcion: string;
  sku: string;
  marca?: string;
  stock?: number;
  fecha_creacion?: string;
  imagen?: string;
}

export interface FilterState {
  search: string;
  precio?: string;
  categoria?: string;
  condicion?: string;
  ordenPrecio?: string;
}

export interface Sugerencia {
  texto: string;
  tipo: 'historial' | 'coincidencia';
  filtros?: Partial<FilterState>;
}