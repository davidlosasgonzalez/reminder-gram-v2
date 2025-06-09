/**
 * @file message-processor.integration.spec.ts
 * @description Integration test for MessageProcessorService using a real DTO, real validation and logger, mocking only LLM dependency.
 */

import { ListCalendarEventsHandler } from '@calendar/application/queries/list-calendar-events/list-calendar-events.handler';
import { EvaluateListEventsService } from '@llm/application/services/evaluate-list-events.service';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { GlobalValidationPipe } from '@shared/pipes/global-validation.pipe';
import { MessageProcessorService } from '@telegram/presentation/services/message-processor.service';

describe('MessageProcessorService (integration)', () => {
    let service: MessageProcessorService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageProcessorService,
                LoggerService,
                GlobalValidationPipe,
                {
                    provide: EvaluateListEventsService,
                    useValue: {
                        evaluateMessage: jest.fn().mockResolvedValue({
                            relevant: true,
                            messages: { llm: 'Integration response!' },
                        }),
                    },
                },
                {
                    provide: ListCalendarEventsHandler,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<MessageProcessorService>(MessageProcessorService);
    });

    it('should process a valid TelegramMessageDto and return LLM response', async () => {
        const dto = { text: 'Integration test' };
        const result = await service.process(dto);
        expect(result).toBe('Integration response!');
    });
});
