/**
 * @file message-processor.service.spec.ts
 * @description Unit tests for the MessageProcessorService, covering message validation, intent evaluation, and response generation logic.
 */

import { ListCalendarEventsHandler } from '@calendar/application/queries/list-calendar-events/list-calendar-events.handler';
import { EvaluateListEventsService } from '@llm/application/services/evaluate-list-events.service';
import { Test } from '@nestjs/testing';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { GlobalValidationPipe } from '@shared/pipes/global-validation.pipe';
import { MessageProcessorService } from '@telegram/presentation/services/message-processor.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { EvaluateMessageResult } from 'libs/llm/src/application/ports/evaluate-message.port';

import { eventsMock } from '../mocks/events.mock';

describe('MessageProcessorService', () => {
    let messageProcessor: MessageProcessorService;
    let logger: MockProxy<LoggerService>;
    let validator: MockProxy<GlobalValidationPipe>;
    let evaluateListEvents: MockProxy<EvaluateListEventsService>;
    let listCalendarEventsHandler: MockProxy<ListCalendarEventsHandler>;

    beforeEach(async () => {
        logger = mock<LoggerService>();
        validator = mock<GlobalValidationPipe>();
        evaluateListEvents = mock<EvaluateListEventsService>();
        listCalendarEventsHandler = mock<ListCalendarEventsHandler>();

        const module = await Test.createTestingModule({
            providers: [
                MessageProcessorService,
                { provide: LoggerService, useValue: logger },
                { provide: GlobalValidationPipe, useValue: validator },
                {
                    provide: EvaluateListEventsService,
                    useValue: evaluateListEvents,
                },
                {
                    provide: ListCalendarEventsHandler,
                    useValue: listCalendarEventsHandler,
                },
            ],
        }).compile();

        messageProcessor = module.get<MessageProcessorService>(
            MessageProcessorService,
        );
    });

    afterEach(() => {
        // Clean all mocks/spies.
        jest.restoreAllMocks();
    });

    it('should return a message indicating there are no upcoming events when type is "LIST_EVENTS"', async () => {
        const payload = { text: 'Give me my upcoming events' };
        const validatedDto = { text: 'Give me my upcoming events' };
        const llmResult: EvaluateMessageResult = {
            relevant: true,
            type: 'LIST_EVENTS',
        };

        validator.transform.mockResolvedValue(validatedDto);
        evaluateListEvents.evaluateMessage.mockResolvedValue(llmResult);
        listCalendarEventsHandler.execute.mockResolvedValue([]);

        const result = await messageProcessor.process(payload);

        expect(result).toMatchSnapshot();
    });

    it('should return the rendered list of events when type is "LIST_EVENTS" and events exist', async () => {
        const payload = { text: 'Give me my upcoming events' };
        const validatedDto = { text: 'Give me my upcoming events' };
        const llmResult: EvaluateMessageResult = {
            relevant: true,
            type: 'LIST_EVENTS',
        };

        validator.transform.mockResolvedValue(validatedDto);
        evaluateListEvents.evaluateMessage.mockResolvedValue(llmResult);
        listCalendarEventsHandler.execute.mockResolvedValue(eventsMock);

        const result = await messageProcessor.process(payload);

        expect(result).toMatchSnapshot();
    });

    it('should return the LLM response and log when message is not relevant', async () => {
        const payload = { text: 'random unrelated text' };
        const validatedDto = { text: 'random unrelated text' };
        const llmResult: EvaluateMessageResult = {
            relevant: false,
            messages: {
                user: 'Random unrelated text.',
                llm: 'Sorry, I can only help with calendar-related questions.',
            },
        };

        validator.transform.mockResolvedValue(validatedDto);
        evaluateListEvents.evaluateMessage.mockResolvedValue(llmResult);

        const result = await messageProcessor.process(payload);

        expect(validator.transform).toHaveBeenCalledWith(payload, {
            metatype: expect.any(Function),
            type: 'body',
        });
        expect(logger.info).toHaveBeenCalledWith(
            '[MessageProcessorService] Message validated',
            { text: validatedDto.text },
        );
        expect(evaluateListEvents.evaluateMessage).toHaveBeenCalledWith(
            'random unrelated text',
        );
        expect(result).toBe(
            'Sorry, I can only help with calendar-related questions.',
        );
    });

    it('should warn and return invalid message when validation fails', async () => {
        const payload = { text: 12345 };
        const error = new Error('Validation failed');
        validator.transform.mockRejectedValue(error);

        const result = await messageProcessor.process(payload);

        expect(logger.warn).toHaveBeenCalledWith(
            '[MessageProcessorService] Invalid Telegram message',
            { error: error.message },
        );
        expect(result).toBe('⚠️ Invalid message / Mensaje inválido');
    });

    it('should warn and return invalid message when LLM evaluation fails', async () => {
        const payload = { text: 'trigger error' };
        const validatedDto = { text: 'trigger error' };
        validator.transform.mockResolvedValue(validatedDto);
        evaluateListEvents.evaluateMessage.mockRejectedValue(
            new Error('LLM down'),
        );

        const result = await messageProcessor.process(payload);

        expect(logger.warn).toHaveBeenCalledWith(
            '[MessageProcessorService] Invalid Telegram message',
            { error: 'LLM down' },
        );
        expect(result).toBe('⚠️ Invalid message / Mensaje inválido');
    });
});
