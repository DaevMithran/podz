import winston from 'winston';
import config from '../config';

/**
 * Create a logger instance for a specific module
 * @param module Module name
 * @returns Winston logger instance
 */
export const createLogger = (module: string): winston.Logger => {
  return winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({ label: module }),
      winston.format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      // Add file transport in production
      ...(config.server.env === 'production'
        ? [
            new winston.transports.File({
              filename: 'error.log',
              level: 'error',
            }),
            new winston.transports.File({ filename: 'combined.log' }),
          ]
        : []),
    ],
  });
};

// Create a default logger
export const logger = createLogger('app');