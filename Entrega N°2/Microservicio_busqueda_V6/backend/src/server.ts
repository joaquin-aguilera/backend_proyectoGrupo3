import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';

import searchRoutes from './routes/searchRoutes';
import { specs } from './swagger/swagger';
import { authMiddleware } from './middleware/authMiddleware';
import connectDB from './services/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middlewares de seguridad
app.use(helmet());
app.use(hpp());

// Si estás detrás de proxy y limitas por IP, confía en X-Forwarded-For
app.set('trust proxy', 1);

// CORS estricto y límite de body
const corsOrigin = process.env.FRONTEND_ORIGIN || true;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  }),
);
app.use(express.json({ limit: '100kb' }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rutas
app.use('/api/search', authMiddleware, searchRoutes);

// Manejador de errores consistente
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  if (err?.name === 'BadRequestError') {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Error interno' });
});

// Manejo de fallas no atrapadas
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});