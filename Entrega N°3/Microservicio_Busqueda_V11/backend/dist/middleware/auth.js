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
exports.requirePermission = exports.requireOwnership = exports.requireRole = exports.optionalAuthenticate = exports.authenticate = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authService_1 = require("../services/authService");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
/**
 * Genera un token JWT para un usuario
 */
const generateToken = (userId, email, role = 'user') => {
    const payload = {
        userId,
        email,
        role
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};
exports.generateToken = generateToken;
/**
 * Verifica y decodifica un token JWT
 */
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        console.warn('⚠️ Token inválido o expirado:', error);
        return null;
    }
};
exports.verifyToken = verifyToken;
/**
 * Middleware de autenticación JWT (Integrado con servicio de autenticación)
 * Verifica que el usuario esté autenticado - BLOQUEA si no hay token válido
 */
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                error: 'No autorizado',
                message: 'Token de autenticación no proporcionado'
            });
            return;
        }
        // Verificar formato "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({
                error: 'No autorizado',
                message: 'Formato de token inválido. Use: Bearer <token>'
            });
            return;
        }
        const token = parts[1];
        // Verificar que el token no esté vacío
        if (!token || token.trim() === '') {
            res.status(401).json({
                error: 'No autorizado',
                message: 'Token vacío'
            });
            return;
        }
        // Verificar token con el servicio de autenticación
        const userInfo = yield authService_1.AuthService.verifyToken(token);
        if (!userInfo) {
            res.status(401).json({
                error: 'No autorizado',
                message: 'Token inválido o expirado'
            });
            return;
        }
        // Agregar información del usuario al request
        req.userId = userInfo.id;
        req.userEmail = userInfo.correo;
        req.userName = `${userInfo.nombre} ${userInfo.apellido}`;
        req.userRoles = userInfo.roles;
        req.userPermissions = userInfo.permisos;
        req.userInfo = userInfo;
        // Mantener compatibilidad con código anterior
        req.userRole = userInfo.roles && userInfo.roles.length > 0 ? userInfo.roles[0] : undefined;
        console.log(`✅ Usuario autenticado (strict): ${userInfo.correo} (${userInfo.id})`);
        next();
    }
    catch (error) {
        console.error('❌ Error en autenticación:', error);
        res.status(500).json({
            error: 'Error de autenticación',
            message: 'Ha ocurrido un error al verificar la autenticación'
        });
    }
});
exports.authenticate = authenticate;
/**
 * Middleware de autenticación opcional (Integrado con servicio de autenticación)
 * Si hay token, lo verifica con el servicio de autenticación, pero no bloquea si no hay token
 */
const optionalAuthenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            // No hay token, continuar sin autenticar
            next();
            return;
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            // Token con formato incorrecto, continuar sin autenticar
            console.warn('⚠️ Formato de token incorrecto, continuando sin autenticación');
            next();
            return;
        }
        const token = parts[1];
        // Verificar token con el servicio de autenticación
        const userInfo = yield authService_1.AuthService.verifyToken(token);
        if (userInfo) {
            // Token válido, agregar información del usuario al request
            req.userId = userInfo.id;
            req.userEmail = userInfo.correo;
            req.userName = `${userInfo.nombre} ${userInfo.apellido}`;
            req.userRoles = userInfo.roles;
            req.userPermissions = userInfo.permisos;
            req.userInfo = userInfo;
            // Mantener compatibilidad con código anterior
            req.userRole = userInfo.roles && userInfo.roles.length > 0 ? userInfo.roles[0] : undefined;
            console.log(`✅ Usuario autenticado: ${userInfo.correo} (${userInfo.id})`);
        }
        else {
            console.warn('⚠️ Token inválido o servicio no disponible, continuando sin autenticación');
        }
        next();
    }
    catch (error) {
        console.error('❌ Error en autenticación opcional:', error);
        next(); // Continuar incluso si hay error
    }
});
exports.optionalAuthenticate = optionalAuthenticate;
/**
 * Middleware para verificar que el usuario tiene un rol específico
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRoles || req.userRoles.length === 0) {
            res.status(401).json({
                error: 'No autorizado',
                message: 'Debe estar autenticado para acceder a este recurso'
            });
            return;
        }
        // Verificar si el usuario tiene al menos uno de los roles permitidos
        const hasRole = req.userRoles.some(role => allowedRoles.includes(role));
        if (!hasRole) {
            console.warn(`⚠️ Acceso denegado: Usuario con roles [${req.userRoles.join(', ')}] intentó acceder a recurso que requiere [${allowedRoles.join(', ')}]`);
            res.status(403).json({
                error: 'Acceso denegado',
                message: 'No tiene permisos para acceder a este recurso',
                requiredRoles: allowedRoles,
                userRoles: req.userRoles
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware para verificar que el usuario solo accede a sus propios recursos
 */
const requireOwnership = (userIdParam = 'userId') => {
    return (req, res, next) => {
        const requestedUserId = req.params[userIdParam] || req.query[userIdParam];
        if (!req.userId) {
            res.status(401).json({
                error: 'No autorizado',
                message: 'Debe estar autenticado'
            });
            return;
        }
        if (req.userId !== requestedUserId && req.userRole !== 'admin') {
            console.warn(`⚠️ Intento de acceso no autorizado: Usuario ${req.userId} intentó acceder a recursos de ${requestedUserId}`);
            res.status(403).json({
                error: 'Acceso denegado',
                message: 'No tiene permisos para acceder a este recurso'
            });
            return;
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
/**
 * Middleware para verificar que el usuario tiene un permiso específico
 */
const requirePermission = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.userPermissions || req.userPermissions.length === 0) {
            res.status(401).json({
                error: 'No autorizado',
                message: 'Debe estar autenticado para acceder a este recurso'
            });
            return;
        }
        // Verificar si el usuario tiene al menos uno de los permisos requeridos
        const hasPermission = req.userPermissions.some(permission => requiredPermissions.includes(permission));
        if (!hasPermission) {
            console.warn(`⚠️ Acceso denegado: Usuario con permisos [${req.userPermissions.join(', ')}] intentó acceder a recurso que requiere [${requiredPermissions.join(', ')}]`);
            res.status(403).json({
                error: 'Acceso denegado',
                message: 'No tiene los permisos necesarios para acceder a este recurso',
                requiredPermissions: requiredPermissions,
                userPermissions: req.userPermissions
            });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
exports.default = {
    generateToken: exports.generateToken,
    verifyToken: exports.verifyToken,
    authenticate: exports.authenticate,
    optionalAuthenticate: exports.optionalAuthenticate,
    requireRole: exports.requireRole,
    requireOwnership: exports.requireOwnership,
    requirePermission: exports.requirePermission
};
