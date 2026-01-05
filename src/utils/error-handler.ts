import { ErrorHandler, ErrorContext, FormattedError } from '../types';
import { logger } from './logger';

/**
 * Basic error handler implementation
 * This is a placeholder that will be expanded in later tasks
 */
export class BasicErrorHandler implements ErrorHandler {
  handleError(error: Error, context: ErrorContext): FormattedError {
    const formattedError: FormattedError = {
      code: this.getErrorCode(error),
      message: error.message,
      details: {
        stack: error.stack,
        context
      },
      suggestions: this.getSuggestions(error),
      timestamp: new Date()
    };

    return formattedError;
  }

  logError(error: FormattedError): void {
    logger.error(`[${error.code}] ${error.message}`, {
      details: error.details,
      suggestions: error.suggestions,
      timestamp: error.timestamp
    });
  }

  private getErrorCode(error: Error): string {
    // TODO: Implement proper error code mapping in later tasks
    if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
    if (error.name === 'FileSystemError') return 'FILESYSTEM_ERROR';
    if (error.name === 'NetworkError') return 'NETWORK_ERROR';
    return 'UNKNOWN_ERROR';
  }

  private getSuggestions(error: Error): string[] {
    // TODO: Implement context-aware suggestions in later tasks
    const suggestions: string[] = [];
    
    if (error.message.includes('permission')) {
      suggestions.push('Check file permissions and try running with appropriate privileges');
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      suggestions.push('Check your internet connection and try again');
    }
    
    return suggestions;
  }
}

// Export a default error handler instance
export const errorHandler = new BasicErrorHandler();