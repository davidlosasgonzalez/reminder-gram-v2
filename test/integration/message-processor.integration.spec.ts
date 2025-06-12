/**
 * @file message-processor.integration.spec.ts
 * @description Integration test for MessageProcessorService using a real DTO, real validation and logger, mocking only LLM and calendar dependencies.
 */

import { ListCalendarEventsHandler } from '@calendar/application/queries/list-calendar-events/list-calendar-events.handler';
import { EvaluateMessageIntentService } from '@llm/application/services/evaluate-message-intent.service';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { ClarificationContextService } from '@telegram/application/services/clarification-context.service';
import { MessageProcessorService } from '@telegram/presentation/services/message-processor.service';
import { Message } from 'telegraf/typings/core/types/typegram';

describe('MessageProcessorService (integration)', () => {
    let service: MessageProcessorService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageProcessorService,
                LoggerService,
                {
                    provide: EvaluateMessageIntentService,
                    useValue: {
                        classify: jest.fn().mockResolvedValue({
                            type: 'UNKNOWN',
                            messages: {
                                user: 'Test',
                                llm: 'Integration response!',
                            },
                        }),
                        clarify: jest.fn().mockResolvedValue({
                            type: 'UNKNOWN',
                            messages: {
                                user: 'Test',
                                llm: 'Integration clarify!',
                            },
                        }),
                    },
                },
                {
                    provide: ListCalendarEventsHandler,
                    useValue: {
                        execute: jest.fn().mockResolvedValue([]),
                    },
                },
                {
                    provide: ClarificationContextService,
                    useValue: {
                        getContext: jest.fn().mockReturnValue(undefined),
                        saveContext: jest.fn(),
                        clearContext: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<MessageProcessorService>(MessageProcessorService);
    });

    it('should process a valid Telegram TextMessage and return LLM response', async () => {
        const payload: Message.TextMessage = {
            message_id: 999,
            text: 'Hello',
            from: { id: 123456 },
            chat: { id: 123456, type: 'private' },
            date: Date.now() / 1000,
        } as Message.TextMessage;

        const result = await service.execute(payload);
        expect(result).toBe('Integration response!');
    });
});
