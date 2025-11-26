"use strict";
/**
 * Script de prueba para verificar la integración con el API de publicaciones
 * Ejecutar con: npx ts-node src/scripts/test-publicaciones-api.ts
 */
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_URL = process.env.PRODUCTS_API_URL || 'http://localhost:4040/api';
function testPublicacionesAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('\n🔍 Probando conexión con API de Publicaciones...\n');
        console.log(`URL: ${API_URL}/publicaciones\n`);
        try {
            // Intentar obtener publicaciones
            const response = yield axios_1.default.get(`${API_URL}/publicaciones`, {
                timeout: 5000
            });
            console.log('✅ Conexión exitosa!\n');
            console.log(`📊 Status: ${response.status}`);
            // Verificar estructura de datos
            const data = Array.isArray(response.data) ? response.data : response.data.data;
            if (!data || !Array.isArray(data)) {
                console.log('\n⚠️  Advertencia: Respuesta no es un array');
                console.log('Estructura recibida:', JSON.stringify(response.data, null, 2).substring(0, 500));
                return;
            }
            console.log(`📦 Total de productos: ${data.length}\n`);
            if (data.length > 0) {
                console.log('🔍 Ejemplo de producto recibido:');
                console.log(JSON.stringify(data[0], null, 2));
                console.log('\n');
                // Verificar campos necesarios
                const primerProducto = data[0];
                const camposRequeridos = [
                    'id_producto',
                    'nombre',
                    'precio',
                    'categoria',
                    'condicion'
                ];
                console.log('✔️  Verificando campos obligatorios:');
                camposRequeridos.forEach(campo => {
                    if (primerProducto[campo] !== undefined) {
                        console.log(`  ✅ ${campo}: ${primerProducto[campo]}`);
                    }
                    else {
                        console.log(`  ❌ ${campo}: NO ENCONTRADO`);
                    }
                });
                // Verificar categorías
                console.log('\n📂 Categorías encontradas:');
                const categorias = [...new Set(data.map((p) => p.categoria))];
                categorias.forEach(cat => {
                    const count = data.filter((p) => p.categoria === cat).length;
                    console.log(`  - ${cat}: ${count} productos`);
                });
                // Verificar condiciones
                console.log('\n🏷️  Condiciones encontradas:');
                const condiciones = [...new Set(data.map((p) => p.condicion))];
                condiciones.forEach(cond => {
                    const count = data.filter((p) => p.condicion === cond).length;
                    console.log(`  - ${cond}: ${count} productos`);
                });
                console.log('\n✅ El API de publicaciones está funcionando correctamente!\n');
            }
            else {
                console.log('⚠️  El endpoint responde pero no hay productos disponibles\n');
            }
        }
        catch (error) {
            console.log('❌ Error al conectar con el API de publicaciones\n');
            if (error.code === 'ECONNREFUSED') {
                console.log('🔴 Conexión rechazada - El servidor no está corriendo');
                console.log(`   Verifica que el microservicio de publicaciones esté activo en el puerto 4040\n`);
            }
            else if (error.code === 'ETIMEDOUT') {
                console.log('⏱️  Timeout - El servidor no responde');
                console.log(`   Verifica que ${API_URL} sea accesible\n`);
            }
            else if (error.response) {
                console.log(`📛 El servidor respondió con status: ${error.response.status}`);
                console.log(`   Mensaje: ${error.response.statusText}`);
                if (error.response.data) {
                    console.log('   Respuesta:', JSON.stringify(error.response.data, null, 2).substring(0, 500));
                }
                console.log('');
            }
            else {
                console.log('Error desconocido:', error.message);
                console.log('');
            }
            console.log('💡 Soluciones:');
            console.log('   1. Asegúrate que el microservicio de publicaciones esté corriendo');
            console.log('   2. Verifica que esté en el puerto 4040');
            console.log('   3. Comprueba que el endpoint sea /api/publicaciones');
            console.log('   4. Si hay autenticación, configura PRODUCTS_API_TOKEN en .env\n');
            console.log('ℹ️  El microservicio de búsqueda funcionará con datos de demostración\n');
        }
    });
}
// Ejecutar prueba
testPublicacionesAPI();
