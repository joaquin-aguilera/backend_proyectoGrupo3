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
function testRandomProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('🎲 Probando endpoint de productos aleatorios...\n');
        try {
            // Test 1: Sin parámetros (por defecto 20 productos)
            console.log('Test 1: Sin parámetros (límite por defecto)');
            const response1 = yield axios_1.default.get(`${BASE_URL}/api/search/products/random`);
            console.log(`✓ Total de productos disponibles: ${response1.data.metadata.total}`);
            console.log(`✓ Productos retornados: ${response1.data.metadata.totalDisponible}`);
            console.log(`✓ ¿Hay más productos?: ${response1.data.metadata.hasMore ? 'Sí' : 'No'}`);
            // Verificar que no haya productos TODO
            const productosTodo = response1.data.productos.filter(p => p.categoria === 'TODO');
            console.log(`✓ Productos con categoría TODO: ${productosTodo.length} (debe ser 0)`);
            if (response1.data.productos.length > 0) {
                console.log(`✓ Primer producto: ${response1.data.productos[0].nombre} - ${response1.data.productos[0].categoria}`);
            }
            console.log('');
            // Test 2: Con límite específico (5 productos)
            console.log('Test 2: Con límite de 5 productos');
            const response2 = yield axios_1.default.get(`${BASE_URL}/api/search/products/random`, { params: { limite: 5 } });
            console.log(`✓ Productos retornados: ${response2.data.productos.length}`);
            console.log('✓ Productos:');
            response2.data.productos.forEach((p, i) => {
                console.log(`   ${i + 1}. ${p.nombre} (${p.categoria}) - $${p.precio}`);
            });
            console.log('');
            // Test 3: Verificar que los productos son diferentes en cada llamada
            console.log('Test 3: Verificar aleatoriedad');
            const response3 = yield axios_1.default.get(`${BASE_URL}/api/search/products/random`, { params: { limite: 3 } });
            const productos1 = response2.data.productos.slice(0, 3).map(p => p._id);
            const productos2 = response3.data.productos.map(p => p._id);
            const sonIguales = JSON.stringify(productos1) === JSON.stringify(productos2);
            console.log(`✓ Productos diferentes en llamadas sucesivas: ${!sonIguales ? 'Sí ✓' : 'No (puede ser coincidencia)'}`);
            console.log('');
            // Test 4: Límite máximo
            console.log('Test 4: Límite máximo (50 productos)');
            const response4 = yield axios_1.default.get(`${BASE_URL}/api/search/products/random`, { params: { limite: 50 } });
            console.log(`✓ Productos retornados: ${response4.data.productos.length}`);
            // Contar categorías
            const categorias = new Map();
            response4.data.productos.forEach(p => {
                categorias.set(p.categoria, (categorias.get(p.categoria) || 0) + 1);
            });
            console.log('✓ Distribución por categorías:');
            Array.from(categorias.entries())
                .sort((a, b) => b[1] - a[1])
                .forEach(([cat, count]) => {
                console.log(`   - ${cat}: ${count} productos`);
            });
            console.log('\n✅ Todos los tests completados exitosamente');
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('❌ Error en la petición:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
            else {
                console.error('❌ Error:', error);
            }
        }
    });
}
// Ejecutar tests
testRandomProducts().catch(console.error);
