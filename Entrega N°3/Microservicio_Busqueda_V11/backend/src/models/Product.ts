import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  condicion: string;
  stock: number;
  sku: string;
  descripcion: string;
  marca: string;
  fecha_creacion: Date;
  id_vendedor?: string;
  multimedia?: Array<{ url: string; tipo: string }>;
  despacho?: string;
  precio_envio?: number;
  estado?: string;
  vendedor?: {
    id: string;
    nombre: string;
    email?: string;
    tipo: string;
    telefono?: string;
  };
}

const ProductSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  categoria: { type: String, required: true },
  condicion: { type: String, required: true },
  stock: { type: Number, required: true },
  sku: { type: String, required: true },
  descripcion: { type: String, required: true },
  marca: { type: String, required: true },
  fecha_creacion: { type: Date, default: Date.now },
  id_vendedor: { type: String },
  multimedia: [{
    url: { type: String },
    tipo: { type: String }
  }],
  despacho: { type: String },
  precio_envio: { type: Number },
  estado: { type: String },
  vendedor: {
    id: { type: String },
    nombre: { type: String },
    email: { type: String },
    tipo: { type: String },
    telefono: { type: String }
  }
});

// Índices para mejorar el rendimiento
ProductSchema.index({ nombre: 'text', descripcion: 'text', marca: 'text' });
ProductSchema.index({ categoria: 1 });
ProductSchema.index({ precio: 1 });
ProductSchema.index({ condicion: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
