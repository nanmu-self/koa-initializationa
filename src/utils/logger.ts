import { Logger } from '../types';

/**
 * Basic logger implementation
 * This is a placeholder that will be expanded in later tasks
 */
export class BasicLogger implements Logger {
  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  error(message: string, meta?: any): void {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  debug(message: string, meta?: any): void {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
}

// Export a default logger instance
export const logger = new BasicLogger();