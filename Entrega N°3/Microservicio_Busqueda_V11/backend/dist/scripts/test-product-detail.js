"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:5610';
function testProductDetail() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log('🧪 Probando endpoint de detalle de producto...\n');
        // Probar los primeros 5 productos (tienen datos completos)
        for (let i = 1; i <= 5; i++) {
            try {
                console.log(`\n━━━ Producto ${i} ━━━`);
                const response = yield axios_1.default.get(`${BASE_URL}/api/search/products/${i}/detail`);
                const { producto, vendedor, publicacion } = response.data;
                console.log(`✓ Nombre: ${producto.nombre}`);
                console.log(`✓ Precio: $${producto.precio}`);
                console.log(`✓ Vendedor: ${vendedor.nombre} (${vendedor.tipo})`);
                if (vendedor.email) {
                    console.log(`✓ Email: ${vendedor.email}`);
                }
                if (publicacion) {
                    console.log(`✓ Imágenes: ${publicacion.multimedia.length}`);
                    console.log(`✓ Despacho: ${publicacion.despacho}`);
                    console.log(`✓ Precio envío: $${publicacion.precio_envio}`);
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    console.error(`❌ Error: ${((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error.message}`);
                }
                else {
                    console.error(`❌ Error: ${error}`);
                }
            }
        }
        console.log('\n✅ Pruebas completadas');
    });
}
testProductDetail().catch(console.error);
