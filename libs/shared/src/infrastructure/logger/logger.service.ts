/**
 * @file /src/shared/infrastructure/logger.service.ts
 * @description Centralized logger service for the application.
 */

import { env } from '@config/env/env.config';
import { Injectable, Logger } from '@nestjs/common';

const isProd = env.NODE_ENV === 'production';

@Injectable()
export class LoggerService {
    /**
     * Logs informational messages.
     * In production, outputs structured JSON. In development, outputs human-readable string.
     * @param {string} message - The log message.
     * @param {Record<string, unknown>} [meta] - Optional metadata to include in the log.
     */
    info(message: string, meta?: Record<string, unknown>): void {
        if (meta) {
            if (isProd) {
                Logger.log(
                    JSON.stringify({ level: 'info', message, ...meta }),
                    'Info',
                );
            } else {
                Logger.log(
                    `${message} ${JSON.stringify(meta, null, 2)}`,
                    'Info',
                );
            }
        } else {
            Logger.log(message, 'Info');
        }
    }

    /**
     * Logs warning messages.
     * In production, outputs structured JSON. In development, outputs human-readable string.
     * @param {string} message - The log message.
     * @param {Record<string, unknown>} [meta] - Optional metadata to include in the log.
     */
    warn(message: string, meta?: Record<string, unknown>): void {
        if (meta) {
            if (isProd) {
                Logger.warn(
                    JSON.stringify({ level: 'warn', message, ...meta }),
                    'Warning',
                );
            } else {
                Logger.warn(
                    `${message} ${JSON.stringify(meta, null, 2)}`,
                    'Warning',
                );
            }
        } else {
            Logger.warn(message, 'Warning');
        }
    }

    /**
     * Logs error messages.
     * In production, outputs structured JSON. In development, outputs human-readable string.
     * @param {string} message - The error message.
     * @param {string} [trace] - Optional stack trace.
     * @param {Record<string, unknown>} [meta] - Optional metadata to include in the log.
     */
    error(
        message: string,
        trace?: string,
        meta?: Record<string, unknown>,
    ): void {
        if (meta) {
            if (isProd) {
                Logger.error(
                    JSON.stringify({ level: 'error', message, trace, ...meta }),
                    trace,
                    'Error',
                );
            } else {
                Logger.error(
                    `${message} ${JSON.stringify(meta, null, 2)}`,
                    trace,
                    'Error',
                );
            }
        } else {
            Logger.error(message, trace, 'Error');
        }
    }
}
