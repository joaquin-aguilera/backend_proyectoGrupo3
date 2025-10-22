export interface Product {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  ubicacion: string;
  condicion: string;
  descripcion: string;
  image?: string;
}

export interface FilterState {
  search: string;
  precio?: string;
  categoria?: string;
  ubicacion?: string;
  condicion?: string;
}

export interface Sugerencia {
  texto: string;
  tipo: 'historial' | 'coincidencia';
  filtros?: FilterState;
}