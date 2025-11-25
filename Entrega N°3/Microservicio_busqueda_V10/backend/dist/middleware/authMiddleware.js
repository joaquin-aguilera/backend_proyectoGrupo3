"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    // Simulamos un usuario autenticado
    // En un caso real, esto verificaría el token JWT o la sesión
    req.userId = 1; // Usuario simulado
    next();
};
exports.authMiddleware = authMiddleware;
