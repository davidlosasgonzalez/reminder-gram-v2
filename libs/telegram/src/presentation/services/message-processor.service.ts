/**
 * @file /libs/telegram/src/presentation/services/message-processor.service.ts
 * @description Service for processing incoming Telegram messages.
 * Acts as the entrypoint for all Telegram message and event handling.
 */

import { ListCalendarEventsHandler } from '@calendar/application/queries/list-calendar-events/list-calendar-events.handler';
import { ListCalendarEventsQuery } from '@calendar/application/queries/list-calendar-events/list-calendar-events.query';
import { EvaluateMessageIntentService } from '@llm/application/services/evaluate-message-intent.service';
import { LLM_EVALUATED_INTENT } from '@llm/domain/enums/llm-evaluated-intent.enum';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { TelegramMessageDto } from '@telegram/application/dto/telegram-message.dto';
import { ClarificationContextService } from '@telegram/application/services/clarification-context.service';
import { renderCalendarEvents } from '@telegram/application/utils/render-calendar-events.util';
import { Message } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class MessageProcessorService {
    constructor(
        private readonly logger: LoggerService,
        private readonly evaluateMessageIntent: EvaluateMessageIntentService,
        private readonly listCalendarEventsHandler: ListCalendarEventsHandler,
        private readonly clarificationContext: ClarificationContextService,
    ) {}

    /**
     * Processes an incoming Telegram message, determines intent,
     * and returns the appropriate assistant reply.
     * @param payload Raw Telegram message of type TextMessage.
     * @returns Assistant reply string, ready to be sent to the user.
     */
    async execute(payload: Message.TextMessage): Promise<string> {
        const { text, message_id, from } = payload;

        if (!text || !message_id || !from?.id) {
            this.logger.warn('Missing fields in Telegram payload', { payload });
            return '⚠️ Invalid Telegram payload. / Mensaje de Telegram inválido.';
        }

        const dto: TelegramMessageDto = {
            text,
            message_id,
            from,
        };

        const trimmedText = dto.text.trim();
        const userId = dto.from.id;
        const messageId = dto.message_id;

        const context = this.clarificationContext.getContext(userId);

        try {
            let evaluation;

            // Clarification pending.
            if (context) {
                this.logger.info(
                    '[MessageProcessorService] Clarify flow triggered',
                    {
                        userId,
                        originalMessage: context.originalMessage,
                        clarificationMessage: trimmedText,
                    },
                );

                evaluation = await this.evaluateMessageIntent.clarify(
                    context.originalMessage,
                    context.initialLlmResponse,
                    trimmedText,
                );

                this.clarificationContext.clearContext(userId);
            } else {
                // Clarification not pending.
                evaluation =
                    await this.evaluateMessageIntent.classify(trimmedText);
            }

            // LIST_EVENTS
            if (evaluation.type === LLM_EVALUATED_INTENT.LIST_EVENTS) {
                const [from, to] = this.getDefaultDateRange();
                const events = await this.listCalendarEventsHandler.execute(
                    new ListCalendarEventsQuery(from, to),
                );

                return renderCalendarEvents(events);
            }

            // NEEDS_CLARIFICATION
            if (evaluation.type === LLM_EVALUATED_INTENT.NEEDS_CLARIFICATION) {
                this.logger.info(
                    '[MessageProcessorService] Clarification requested by model',
                    {
                        userId,
                        originalMessage: trimmedText,
                        suggested: evaluation.messages?.llm ?? 'N/A',
                    },
                );

                this.clarificationContext.saveContext(userId, {
                    lastMessageId: messageId,
                    originalMessage: trimmedText,
                    initialLlmResponse: evaluation.messages?.llm ?? '',
                });

                return (
                    evaluation.messages?.llm ??
                    '🤖 I need clarification to proceed. / Necesito que aclares tu mensaje para poder ayudarte.'
                );
            }

            if (context && evaluation.type === LLM_EVALUATED_INTENT.UNKNOWN) {
                this.logger.info(
                    '[MessageProcessorService] Clarification failed',
                    {
                        userId,
                        messageId,
                    },
                );

                return (
                    evaluation.messages?.llm ??
                    '🤖 I didn’t understand your request. / No entendí tu mensaje. Solo puedo ayudarte a listar eventos.'
                );
            }

            if (evaluation.messages?.llm) {
                return evaluation.messages.llm;
            }

            this.logger.warn(
                '[MessageProcessorService] No message returned from evaluation',
                {
                    type: evaluation.type,
                    userId,
                    evaluation,
                },
            );

            return '⚠️ Unexpected error occurred. / Ocurrió un error inesperado.';
        } catch (err) {
            this.logger.error(
                '[MessageProcessorService] Message processing failed',
                (err as Error).stack,
                { error: (err as Error).message },
            );
            return '⚠️ Invalid Telegram message. / Mensaje de Telegram no válido.';
        }
    }

    /**
     * Returns the default date range to fetch upcoming events.
     * The range starts from the current date and includes the next 14 days.
     */
    private getDefaultDateRange(): [Date, Date] {
        const now = new Date();
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(now.getDate() + 14);
        return [now, twoWeeksLater];
    }
}
