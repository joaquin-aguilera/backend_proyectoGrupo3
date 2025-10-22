import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Búsqueda',
            version: '1.0.0',
            description: 'API para el microservicio de búsqueda de productos',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo',
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
        path.join(__dirname, '../routes/*.ts'),
        path.join(__dirname, './schemas.ts')
    ],
};

export const specs = swaggerJsdoc(options);