import { Request, Response, NextFunction } from 'express';

// Interfaz para extender Request y añadir el userId
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Simulamos un usuario autenticado
    // En un caso real, esto verificaría el token JWT o la sesión
    req.userId = 1; // Usuario simulado
    next();
};