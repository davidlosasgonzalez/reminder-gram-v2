/**
 * @file libs/telegram/src/presentation/services/message-processor.service.ts
 * @description Service for processing incoming Telegram messages.
 * Acts as the entrypoint for all Telegram message and event handling.
 */

import { ListCalendarEventsHandler } from '@calendar/application/queries/list-calendar-events/list-calendar-events.handler';
import { ListCalendarEventsQuery } from '@calendar/application/queries/list-calendar-events/list-calendar-events.query';
import { EvaluateListEventsService } from '@llm/application/services/evaluate-list-events.service';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { GlobalValidationPipe } from '@shared/pipes/global-validation.pipe';
import { TelegramMessageDto } from '@telegram/application/dto/telegram-message.dto';
import { renderCalendarEvents } from '@telegram/application/utils/render-calendar-events.util';

@Injectable()
export class MessageProcessorService {
    constructor(
        private readonly logger: LoggerService,
        private readonly validator: GlobalValidationPipe,
        private readonly evaluateListEvents: EvaluateListEventsService,
        private readonly listCalendarEventsHandler: ListCalendarEventsHandler,
    ) {}

    /**
     * Processes an incoming Telegram message, validates it, determines intent,
     * and returns the appropriate assistant reply.
     * If the message is relevant and requests event listing, fetches events and composes the response.
     * @param payload Raw payload or message received from Telegram.
     * @returns Assistant reply string, ready to be sent to the user.
     */
    async process(payload: unknown): Promise<string> {
        try {
            const dto = (await this.validator.transform(payload, {
                metatype: TelegramMessageDto,
                type: 'body',
            })) as TelegramMessageDto;

            this.logger.info('[MessageProcessorService] Message validated', {
                text: dto.text,
            });

            const evaluation = await this.evaluateListEvents.evaluateMessage(
                dto.text,
            );

            if (evaluation.relevant && evaluation.type === 'LIST_EVENTS') {
                const now = new Date();
                const oneWeekLater = new Date();
                oneWeekLater.setDate(now.getDate() + 7);

                const events = await this.listCalendarEventsHandler.execute(
                    new ListCalendarEventsQuery(now, oneWeekLater),
                );

                const eventListText = renderCalendarEvents(events);

                return eventListText;
            }

            if ('messages' in evaluation && evaluation.messages.llm) {
                return evaluation.messages.llm;
            }

            return '⚠️ Unknown error / Error desconocido';
        } catch (err) {
            this.logger.warn(
                '[MessageProcessorService] Invalid Telegram message',
                {
                    error: (err as Error).message,
                },
            );
            return '⚠️ Invalid message / Mensaje inválido';
        }
    }
}
