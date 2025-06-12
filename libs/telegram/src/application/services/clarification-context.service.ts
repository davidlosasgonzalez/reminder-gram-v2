/**
 * @file clarification-context.service.ts
 * @description Service for managing clarification context per user in Telegram interactions.
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';

interface ClarificationContext {
    originalMessage: string;
    initialLlmResponse: string;
    lastMessageId: number;
}

/**
 * Service that handles storing and retrieving clarification context for Telegram users.
 */
@Injectable()
export class ClarificationContextService {
    private contextMap = new Map<number, ClarificationContext>();

    constructor(private readonly logger: LoggerService) {}

    /**
     * Returns the clarification context for the given user ID.
     * @param userId Telegram user ID
     * @returns ClarificationContext or undefined if not found
     */
    getContext(userId: number): ClarificationContext | undefined {
        return this.contextMap.get(userId);
    }

    /**
     * Saves or updates the clarification context for the given user.
     * @param userId Telegram user ID
     * @param context Clarification context to store
     */
    saveContext(userId: number, context: ClarificationContext): void {
        this.contextMap.set(userId, context);

        const { lastMessageId, originalMessage, initialLlmResponse } = context;

        this.logger.info(
            '[MessageProcessorService] Clarification context saved',
            {
                userId,
                lastMessageId,
                originalMessage,
                initialLlmResponse,
            },
        );
    }

    /**
     * Clears the stored clarification context for the given user.
     * @param userId Telegram user ID
     */
    clearContext(userId: number): void {
        this.contextMap.delete(userId);

        this.logger.info(
            '[MessageProcessorService] Clarification context cleared',
            {
                userId,
            },
        );
    }
}
