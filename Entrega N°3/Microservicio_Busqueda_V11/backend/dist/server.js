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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const express_xss_sanitizer_1 = require("express-xss-sanitizer");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const categoriesRoutes_1 = __importDefault(require("./routes/categoriesRoutes"));
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const swagger_1 = require("./swagger/swagger");
const auth_1 = require("./middleware/auth");
const db_1 = __importDefault(require("./services/db"));
const imageService_1 = require("./services/imageService");
const sanitize_1 = require("./middleware/sanitize");
const securityLogger_1 = require("./middleware/securityLogger");
const rateLimit_1 = require("./middleware/rateLimit");
const authService_1 = require("./services/authService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5610;
// ============================================
// CONECTAR A MONGODB
// ============================================
(0, db_1.default)();
// ============================================
// INICIALIZAR SERVICIO DE IMÁGENES
// ============================================
imageService_1.ImageService.initialize();
setTimeout(() => {
    imageService_1.ImageService.pregenerateCategories()
        .then(() => console.log('✅ Imágenes de categorías optimizadas'))
        .catch(err => console.error('❌ Error al pregenerar imágenes:', err));
}, 2000);
// ============================================
// CONFIGURACIÓN DE SEGURIDAD HELMET
// ============================================
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny'
    },
    noSniff: true,
    xssFilter: true
}));
// ============================================
// PROTECCIÓN HTTP PARAMETER POLLUTION
// ============================================
app.use((0, hpp_1.default)());
// ============================================
// PROTECCIÓN XSS
// ============================================
app.use((0, express_xss_sanitizer_1.xss)());
// ============================================
// CONFIGURACIÓN DE PROXY
// ============================================
app.set('trust proxy', 1);
// ============================================
// CONFIGURACIÓN DE CORS
// ============================================
const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5620'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        }
        else {
            console.warn(`⚠️ Origen bloqueado por CORS: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type']
}));
// ============================================
// PARSING DE BODY (CON LÍMITE DE SEGURIDAD)
// ============================================
app.use(express_1.default.json({ limit: '100kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '100kb' }));
// ============================================
// RATE LIMITING GLOBAL
// ============================================
// Aplicar solo a rutas de API específicas (no a /health ni /)
app.use('/api/search', rateLimit_1.globalLimiter);
app.use('/api/categories', rateLimit_1.globalLimiter);
app.use('/api/analytics', rateLimit_1.globalLimiter);
// ============================================
// LOGGING DE ACCESOS
// ============================================
app.use(securityLogger_1.logAccess);
// ============================================
// DETECCIÓN DE ACTIVIDAD SOSPECHOSA
// ============================================
app.use(securityLogger_1.detectSuspiciousActivity);
// ============================================
// SANITIZACIÓN DE INPUTS (PROTECCIÓN COMPLETA)
// ============================================
app.use(sanitize_1.sanitizeInputs);
// ============================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../public/images')));
// ============================================
// DOCUMENTACION DE SWAGGER
// ============================================
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Búsqueda - Pulga Shop'
}));
// ============================================
// RUTAS DE LA API
// ============================================
app.use('/api/search', auth_1.optionalAuthenticate, searchRoutes_1.default);
app.use('/api/categories', auth_1.optionalAuthenticate, categoriesRoutes_1.default);
app.use('/api/images', imageRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
// ============================================
// RUTA DE HEALTH CHECK
// ============================================
app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Verificar estado del servicio de autenticación
    const authServiceStatus = yield authService_1.AuthService.healthCheck();
    res.status(200).json({
        status: 'OK',
        message: 'Microservicio de búsqueda funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            authentication: {
                status: authServiceStatus ? 'online' : 'offline',
                url: process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api'
            },
            database: {
                status: 'online',
                type: 'MongoDB'
            }
        },
        security: {
            helmet: 'enabled',
            cors: 'enabled',
            rateLimit: 'enabled',
            xssProtection: 'enabled (express-xss-sanitizer)',
            noSqlInjectionProtection: 'enabled (custom middleware)',
            hppProtection: 'enabled',
            sanitization: 'enabled',
            logging: 'enabled'
        }
    });
}));
// ============================================
// RUTA RAÍZ
// ============================================
app.get('/', (req, res) => {
    res.json({
        message: 'API de Búsqueda - Pulga Shop',
        version: '1.0.0',
        documentation: `http://localhost:${PORT}/api-docs`,
        health: `http://localhost:${PORT}/health`,
        endpoints: {
            search: '/api/search',
            categories: '/api/categories',
            images: '/api/images',
            analytics: '/api/analytics'
        }
    });
});
// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ============================================
app.use((req, res) => {
    console.warn(`⚠️ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        suggestion: 'Consulta la documentación en /api-docs'
    });
});
// ============================================
// MANEJO GLOBAL DE ERRORES
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Error no controlado:', err);
    if (err.message === 'No permitido por CORS') {
        return res.status(403).json({
            error: 'Acceso denegado',
            message: 'Tu origen no está permitido para acceder a esta API'
        });
    }
    if ((err === null || err === void 0 ? void 0 : err.name) === 'BadRequestError') {
        return res.status(400).json({
            error: 'Solicitud inválida',
            message: err.message
        });
    }
    return res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado',
        timestamp: new Date().toISOString()
    });
});
// ============================================
// MANEJO DE FALLAS NO ATRAPADAS
// ============================================
process.on('unhandledRejection', (reason) => {
    console.error('🔴 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('🔴 Uncaught Exception:', err);
    process.exit(1);
});
// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🚀 ====================================');
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔒 Seguridad activada:`);
    console.log(`   ✅ Helmet (headers seguros)`);
    console.log(`   ✅ CORS (orígenes: ${allowedOrigins.join(', ')})`);
    console.log(`   ✅ Rate Limiting (100 req/15min)`);
    console.log(`   ✅ XSS Protection (express-xss-sanitizer)`);
    console.log(`   ✅ NoSQL Injection Protection (custom middleware)`);
    console.log(`   ✅ HPP Protection`);
    console.log(`   ✅ Input Sanitization (custom)`);
    console.log(`   ✅ Security Logging`);
    console.log(`   ✅ JWT Authentication (integrado con servicio externo)`);
    console.log('🔐 ====================================');
    console.log(`🔐 Servicio de Autenticación:`);
    console.log(`   🌐 URL: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api'}`);
    // Verificar conexión con servicio de autenticación
    const authServiceStatus = yield authService_1.AuthService.healthCheck();
    if (authServiceStatus) {
        console.log(`   ✅ Estado: ONLINE`);
    }
    else {
        console.log(`   ⚠️  Estado: OFFLINE (el servicio continuará funcionando en modo anónimo)`);
    }
    console.log('🚀 ====================================');
}));
exports.default = app;
