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
            title: 'API de Búsqueda de Productos',
            version: '1.0.0',
            description: `Microservicio de búsqueda con funcionalidades de filtrado avanzado, 
            sugerencias, historial, analítica de clicks, gestión de categorías y optimización de imágenes. 
            Consume productos del microservicio de publicaciones (puerto 4040).`,
            contact: {
                name: 'Max Latuz',
                email: 'max.latuz@example.com'
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
