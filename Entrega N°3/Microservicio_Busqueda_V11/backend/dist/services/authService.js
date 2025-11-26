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
exports.AuthService = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Configuración del servicio de autenticación
 */
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api';
const AUTH_SERVICE_TIMEOUT = parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000', 10);
const tokenCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
/**
 * Servicio para interactuar con el sistema de autenticación del grupo de autenticación
 */
class AuthService {
    /**
     * Verifica un token JWT consultando el servicio de autenticación
     * @param token Token JWT a verificar
     * @returns Información del usuario si el token es válido, null en caso contrario
     */
    static verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!token || token.trim() === '') {
                return null;
            }
            try {
                // Verificar cache
                const cached = tokenCache.get(token);
                if (cached) {
                    const age = Date.now() - cached.timestamp;
                    if (age < CACHE_DURATION) {
                        console.log('✅ Token verificado desde cache');
                        return cached.userInfo;
                    }
                    else {
                        // Cache expirado, eliminar
                        tokenCache.delete(token);
                    }
                }
                // Consultar servicio de autenticación
                console.log(`🔍 Verificando token con servicio de autenticación: ${AUTH_SERVICE_URL}/auth/me`);
                const response = yield axios_1.default.get(`${AUTH_SERVICE_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: AUTH_SERVICE_TIMEOUT,
                    validateStatus: (status) => status === 200
                });
                const userInfo = response.data;
                // Guardar en cache
                tokenCache.set(token, {
                    userInfo,
                    timestamp: Date.now()
                });
                console.log(`✅ Token válido para usuario: ${userInfo.correo} (${userInfo.id})`);
                return userInfo;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const axiosError = error;
                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                        console.warn('⚠️ Token inválido o expirado');
                    }
                    else if (axiosError.code === 'ECONNREFUSED') {
                        console.error('❌ No se pudo conectar con el servicio de autenticación');
                    }
                    else if (axiosError.code === 'ETIMEDOUT') {
                        console.error('❌ Timeout al conectar con el servicio de autenticación');
                    }
                    else {
                        console.error('❌ Error al verificar token:', axiosError.message);
                    }
                }
                else {
                    console.error('❌ Error desconocido al verificar token:', error);
                }
                return null;
            }
        });
    }
    /**
     * Verifica si un usuario tiene un permiso específico
     * @param token Token JWT del usuario
     * @param permission Código del permiso a verificar
     * @returns true si el usuario tiene el permiso, false en caso contrario
     */
    static checkPermission(token, permission) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!token || token.trim() === '' || !permission) {
                return false;
            }
            try {
                console.log(`🔍 Verificando permiso "${permission}" con servicio de autenticación`);
                const response = yield axios_1.default.get(`${AUTH_SERVICE_URL}/auth/can-access`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        page: permission
                    },
                    timeout: AUTH_SERVICE_TIMEOUT,
                    validateStatus: (status) => status === 200
                });
                const hasAccess = response.data.hasAccess === true;
                console.log(`${hasAccess ? '✅' : '❌'} Usuario ${hasAccess ? 'tiene' : 'NO tiene'} permiso: ${permission}`);
                return hasAccess;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const axiosError = error;
                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                        console.warn('⚠️ Token inválido al verificar permiso');
                    }
                    else if (((_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
                        console.warn('⚠️ Usuario no tiene el permiso solicitado');
                    }
                    else {
                        console.error('❌ Error al verificar permiso:', axiosError.message);
                    }
                }
                else {
                    console.error('❌ Error desconocido al verificar permiso:', error);
                }
                return false;
            }
        });
    }
    /**
     * Obtiene el perfil público de un usuario (sin necesidad de autenticación)
     * @param userId ID del usuario
     * @returns Información pública del usuario o null si no se encuentra
     */
    static getPublicProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!userId || userId.trim() === '') {
                return null;
            }
            try {
                console.log(`🔍 Obteniendo perfil público del usuario: ${userId}`);
                const response = yield axios_1.default.get(`${AUTH_SERVICE_URL}/users/public/${userId}`, {
                    timeout: AUTH_SERVICE_TIMEOUT,
                    validateStatus: (status) => status === 200
                });
                console.log(`✅ Perfil público obtenido: ${response.data.correo}`);
                return response.data;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const axiosError = error;
                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                        console.warn(`⚠️ Usuario no encontrado: ${userId}`);
                    }
                    else {
                        console.error('❌ Error al obtener perfil público:', axiosError.message);
                    }
                }
                else {
                    console.error('❌ Error desconocido al obtener perfil público:', error);
                }
                return null;
            }
        });
    }
    /**
     * Limpia el cache de tokens (útil para pruebas o mantenimiento)
     */
    static clearCache() {
        tokenCache.clear();
        console.log('🧹 Cache de tokens limpiado');
    }
    /**
     * Obtiene estadísticas del cache
     */
    static getCacheStats() {
        return {
            size: tokenCache.size,
            keys: tokenCache.size
        };
    }
    /**
     * Verifica si el servicio de autenticación está disponible
     */
    static healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Intentar hacer una petición simple al servicio
                const response = yield axios_1.default.get(`${AUTH_SERVICE_URL.replace('/api', '')}/health`, {
                    timeout: 3000,
                    validateStatus: (status) => status === 200
                });
                console.log('✅ Servicio de autenticación disponible');
                return true;
            }
            catch (error) {
                console.error('❌ Servicio de autenticación NO disponible');
                return false;
            }
        });
    }
}
exports.AuthService = AuthService;
exports.default = AuthService;
