// Express Application Setup

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import rateLimit from 'express-rate-limit';

import config from '@config';
import { connectMongoDB } from '@config/mongodb';
import { connectNeo4j } from '@config/neo4j';
import { connectRedis } from '@config/redis';
import logger from '@utils/logger';
import { errorHandler } from '@middleware/errors';

// Routes
import healthRoutes from '@routes/health.routes';
import authRoutes from '@routes/auth.routes';
import transactionRoutes from '@routes/transaction.routes';

const app: any = express();

// ========== Middleware ==========

// Security Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests, please try again later',
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logging Middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ========== Routes ==========
// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'FinTrace Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
});

// Error Handler
app.use(errorHandler);

// ========== Server Initialization ==========
export async function initializeServer(): Promise<void> {
  try {
    // Connect to databases
    logger.info('Connecting to databases...');
    await connectMongoDB();

    try {
      await connectNeo4j();
    } catch (error) {
      logger.warn('Neo4j is unavailable; continuing without graph features');
    }

    try {
      await connectRedis();
    } catch (error) {
      logger.warn('Redis is unavailable; continuing without cache features');
    }

    logger.info('Core services connected successfully');

    // Start server
    const port = config.port;
    app.listen(port, () => {
      logger.info(`🚀 FinTrace Backend API running on port ${port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

export default app;
