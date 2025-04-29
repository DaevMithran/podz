import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';

import config from './config';
import { logger } from './utils/logger';
import { setupRoutes } from './api/routes';
import { dockerClient } from './utils/docker';
import { sorobanClient } from './contracts/client';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json())
app.use(helmet());
app.use(cors());
// app.use(bodyParser.json());
// app.use(morgan('combined'));

// Setup API routes
setupRoutes(app);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
});

// Start server
const startServer = async () => {
  try {
    // Validate Docker connection
    const dockerConnected = await dockerClient.validateConnection();
    if (!dockerConnected) {
      logger.error('Failed to connect to Docker. Exiting...');
      process.exit(1);
    }
    logger.info('Docker connection validated');

    // Validate Soroban connection
    const adminPublicKey = sorobanClient.getAdminPublicKey();
    logger.info(`Soroban admin public key: ${adminPublicKey}`);

    // Start server
    app.listen(config.server.port, () => {
      logger.info(`Server started on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server...');
  // Clean up resources and exit
  process.exit(0);
};

// Handle process signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  shutdown();
});

// Start the server
startServer();