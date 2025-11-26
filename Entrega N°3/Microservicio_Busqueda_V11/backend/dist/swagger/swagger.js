"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Búsqueda de Productos - Pulga Shop',
            version: '1.0.0',
            description: `
## Microservicio de Búsqueda Inteligente

**Funcionalidades principales:**
- 🔍 Búsqueda avanzada con múltiples filtros (texto, precio, categoría, condición, ordenamiento)
- 📊 Analítica basada en cantidad de búsquedas por producto
- 🎯 Sugerencias inteligentes desde historial de búsquedas
- 🖼️ Optimización automática de imágenes con Sharp
- 🔌 Integración con API de publicaciones (fallback a MongoDB y datos demo)
- 📈 Exportación de datos para análisis externos

**Base de datos:**
- MongoDB con colección principal \`searches\` para analítica
- 25 productos seed (5 con información completa de vendedor)

**Integraciones:**
- Consume productos del microservicio de publicaciones (Team-Planning/Back-end)
- Exporta búsquedas al grupo de análisis vía \`/api/search/product-searches\`
- Validación JWT opcional con servicio de autenticación (Bladjot/proyecto-back-tite)

**Nota:** La popularidad de productos se calcula por cantidad de búsquedas, no por clicks.
            `,
            contact: {
                name: 'Max Latuz',
                email: 'max.latuz@uv.cl'
            }
        },
        servers: [
            {
                url: 'http://localhost:5610',
                description: 'Servidor de Desarrollo - Backend Búsqueda',
            },
            {
                url: 'http://localhost:5620',
                description: 'Servidor de Desarrollo - Frontend',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [
        path_1.default.join(__dirname, '../routes/*.ts'),
        path_1.default.join(__dirname, './schemas.ts')
    ],
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
