"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
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
exports.default = mongoose_1.default.model('Product', ProductSchema);
