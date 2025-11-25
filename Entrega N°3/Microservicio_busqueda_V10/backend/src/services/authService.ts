import axios, { AxiosError } from 'axios';

/**
 * Información del usuario autenticado desde el servicio de autenticación
 */
export interface UserInfo {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  roles: string[];
  permisos: string[];
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

/**
 * Respuesta del endpoint can-access
 */
export interface CanAccessResponse {
  page: string;
  hasAccess: boolean;
}

/**
 * Configuración del servicio de autenticación
 */
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api';
const AUTH_SERVICE_TIMEOUT = parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000', 10);

/**
 * Cache simple en memoria para reducir llamadas al servicio de autenticación
 * Estructura: token -> { userInfo, timestamp }
 */
interface CacheEntry {
  userInfo: UserInfo;
  timestamp: number;
}

const tokenCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * Servicio para interactuar con el sistema de autenticación del grupo de autenticación
 */
export class AuthService {
  /**
   * Verifica un token JWT consultando el servicio de autenticación
   * @param token Token JWT a verificar
   * @returns Información del usuario si el token es válido, null en caso contrario
   */
  static async verifyToken(token: string): Promise<UserInfo | null> {
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
        } else {
          // Cache expirado, eliminar
          tokenCache.delete(token);
        }
      }

      // Consultar servicio de autenticación
      console.log(`🔍 Verificando token con servicio de autenticación: ${AUTH_SERVICE_URL}/auth/me`);
      
      const response = await axios.get<UserInfo>(`${AUTH_SERVICE_URL}/auth/me`, {
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

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 401) {
          console.warn('⚠️ Token inválido o expirado');
        } else if (axiosError.code === 'ECONNREFUSED') {
          console.error('❌ No se pudo conectar con el servicio de autenticación');
        } else if (axiosError.code === 'ETIMEDOUT') {
          console.error('❌ Timeout al conectar con el servicio de autenticación');
        } else {
          console.error('❌ Error al verificar token:', axiosError.message);
        }
      } else {
        console.error('❌ Error desconocido al verificar token:', error);
      }
      
      return null;
    }
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * @param token Token JWT del usuario
   * @param permission Código del permiso a verificar
   * @returns true si el usuario tiene el permiso, false en caso contrario
   */
  static async checkPermission(token: string, permission: string): Promise<boolean> {
    if (!token || token.trim() === '' || !permission) {
      return false;
    }

    try {
      console.log(`🔍 Verificando permiso "${permission}" con servicio de autenticación`);
      
      const response = await axios.get<CanAccessResponse>(
        `${AUTH_SERVICE_URL}/auth/can-access`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            page: permission
          },
          timeout: AUTH_SERVICE_TIMEOUT,
          validateStatus: (status) => status === 200
        }
      );

      const hasAccess = response.data.hasAccess === true;
      console.log(`${hasAccess ? '✅' : '❌'} Usuario ${hasAccess ? 'tiene' : 'NO tiene'} permiso: ${permission}`);
      
      return hasAccess;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 401) {
          console.warn('⚠️ Token inválido al verificar permiso');
        } else if (axiosError.response?.status === 403) {
          console.warn('⚠️ Usuario no tiene el permiso solicitado');
        } else {
          console.error('❌ Error al verificar permiso:', axiosError.message);
        }
      } else {
        console.error('❌ Error desconocido al verificar permiso:', error);
      }
      
      return false;
    }
  }

  /**
   * Obtiene el perfil público de un usuario (sin necesidad de autenticación)
   * @param userId ID del usuario
   * @returns Información pública del usuario o null si no se encuentra
   */
  static async getPublicProfile(userId: string): Promise<Partial<UserInfo> | null> {
    if (!userId || userId.trim() === '') {
      return null;
    }

    try {
      console.log(`🔍 Obteniendo perfil público del usuario: ${userId}`);
      
      const response = await axios.get<Partial<UserInfo>>(
        `${AUTH_SERVICE_URL}/users/public/${userId}`,
        {
          timeout: AUTH_SERVICE_TIMEOUT,
          validateStatus: (status) => status === 200
        }
      );

      console.log(`✅ Perfil público obtenido: ${response.data.correo}`);
      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 404) {
          console.warn(`⚠️ Usuario no encontrado: ${userId}`);
        } else {
          console.error('❌ Error al obtener perfil público:', axiosError.message);
        }
      } else {
        console.error('❌ Error desconocido al obtener perfil público:', error);
      }
      
      return null;
    }
  }

  /**
   * Limpia el cache de tokens (útil para pruebas o mantenimiento)
   */
  static clearCache(): void {
    tokenCache.clear();
    console.log('🧹 Cache de tokens limpiado');
  }

  /**
   * Obtiene estadísticas del cache
   */
  static getCacheStats(): { size: number; keys: number } {
    return {
      size: tokenCache.size,
      keys: tokenCache.size
    };
  }

  /**
   * Verifica si el servicio de autenticación está disponible
   */
  static async healthCheck(): Promise<boolean> {
    try {
      // Intentar hacer una petición simple al servicio
      const response = await axios.get(`${AUTH_SERVICE_URL.replace('/api', '')}/health`, {
        timeout: 3000,
        validateStatus: (status) => status === 200
      });

      console.log('✅ Servicio de autenticación disponible');
      return true;

    } catch (error) {
      console.error('❌ Servicio de autenticación NO disponible');
      return false;
    }
  }
}

export default AuthService;
