// Backend Configuration

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Prefer loading the repository root .env when running from subfolders (dev)
const rootEnv = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config();
}

export const config = {
  // Server
  port: parseInt(process.env.BACKEND_PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiryTime: process.env.JWT_EXPIRY || '24h',
    refreshExpiryTime: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Databases
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fintrace',
  },

  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://127.0.0.1:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },

  // ML Service
  ml: {
    serviceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    anomalyThreshold: parseFloat(process.env.ANOMALY_THRESHOLD || '0.7'),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Fraud Detection Thresholds
  fraudDetection: {
    highRiskThreshold: parseFloat(process.env.HIGH_RISK_SCORE_THRESHOLD || '0.8'),
    mediumRiskThreshold: parseFloat(process.env.MEDIUM_RISK_SCORE_THRESHOLD || '0.5'),
    velocityAnomalyThreshold: parseInt(process.env.VELOCITY_ANOMALY_THRESHOLD || '3', 10),
    layeringDetectionHops: parseInt(process.env.LAYERING_DETECTION_HOPS || '5', 10),
    circularTransferThreshold: parseInt(process.env.CIRCULAR_TRANSFER_THRESHOLD || '4', 10),
  },

  // Features
  features: {
    enableWebsocketAlerts: process.env.ENABLE_WEBSOCKET_ALERTS === 'true',
    enableRealTimeProcessing: process.env.ENABLE_REAL_TIME_PROCESSING === 'true',
    enableMLAnomaly: process.env.ENABLE_ML_ANOMALY_DETECTION === 'true',
  },
};

export default config;
