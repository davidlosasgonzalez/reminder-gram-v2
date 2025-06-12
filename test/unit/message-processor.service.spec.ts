/**
 * @file message-processor.service.spec.ts
 * @description Unit tests for the MessageProcessorService, covering intent evaluation, clarification flow, error handling and response generation.
 */

import { ListCalendarEventsHandler } from '@calendar/application/queries/list-calendar-events/list-calendar-events.handler';
import { EvaluateMessageIntentService } from '@llm/application/services/evaluate-message-intent.service';
import { EvaluateMessageResult } from '@llm/domain/contracts/evaluate-message-result.contract';
import { LLM_EVALUATED_INTENT } from '@llm/domain/enums/llm-evaluated-intent.enum';
import { Test } from '@nestjs/testing';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { ClarificationContextService } from '@telegram/application/services/clarification-context.service';
import { MessageProcessorService } from '@telegram/presentation/services/message-processor.service';
import { mock, MockProxy } from 'jest-mock-extended';

import { eventsMock } from '../mocks/events.mock';
import { telegramMessageMock } from '../mocks/telegram-message.mock';

describe('MessageProcessorService', () => {
    let service: MessageProcessorService;
    let logger: MockProxy<LoggerService>;
    let intentService: MockProxy<EvaluateMessageIntentService>;
    let calendarHandler: MockProxy<ListCalendarEventsHandler>;
    let contextService: MockProxy<ClarificationContextService>;

    beforeEach(async () => {
        logger = mock<LoggerService>();
        intentService = mock<EvaluateMessageIntentService>();
        calendarHandler = mock<ListCalendarEventsHandler>();
        contextService = mock<ClarificationContextService>();

        const module = await Test.createTestingModule({
            providers: [
                MessageProcessorService,
                { provide: LoggerService, useValue: logger },
                {
                    provide: EvaluateMessageIntentService,
                    useValue: intentService,
                },
                {
                    provide: ListCalendarEventsHandler,
                    useValue: calendarHandler,
                },
                {
                    provide: ClarificationContextService,
                    useValue: contextService,
                },
            ],
        }).compile();

        service = module.get(MessageProcessorService);
    });

    it('should return no-events message if LLM detects LIST_EVENTS but no events exist', async () => {
        const msg = telegramMessageMock('listar');
        const llmResult: EvaluateMessageResult = {
            type: LLM_EVALUATED_INTENT.LIST_EVENTS,
        };

        contextService.getContext.mockReturnValue(undefined);
        intentService.classify.mockResolvedValue(llmResult);
        calendarHandler.execute.mockResolvedValue([]);

        const result = await service.execute(msg);
        expect(result).toMatchSnapshot();
    });

    it('should return rendered events if LLM detects LIST_EVENTS and events exist', async () => {
        const msg = telegramMessageMock('listar');
        const llmResult: EvaluateMessageResult = {
            type: LLM_EVALUATED_INTENT.LIST_EVENTS,
        };

        contextService.getContext.mockReturnValue(undefined);
        intentService.classify.mockResolvedValue(llmResult);
        calendarHandler.execute.mockResolvedValue(eventsMock);

        const result = await service.execute(msg);
        expect(result).toMatchSnapshot();
    });

    it('should handle clarification flow and clear context after clarify()', async () => {
        const msg = telegramMessageMock('sí');
        const context = {
            lastMessageId: msg.message_id - 1,
            originalMessage: 'listar',
            initialLlmResponse: '¿Te refieres a listar tus eventos?',
        };

        const clarified: EvaluateMessageResult = {
            type: LLM_EVALUATED_INTENT.LIST_EVENTS,
        };

        contextService.getContext.mockReturnValue(context);
        intentService.clarify.mockResolvedValue(clarified);
        calendarHandler.execute.mockResolvedValue(eventsMock);

        const result = await service.execute(msg);
        expect(result).toMatchSnapshot();
        expect(contextService.clearContext).toHaveBeenCalledWith(msg.from!.id);
    });

    it('should store clarification context if message needs clarification', async () => {
        const msg = telegramMessageMock('listar evento');
        const response = '¿Te refieres a listar tus eventos?';
        const llmResult: EvaluateMessageResult = {
            type: LLM_EVALUATED_INTENT.NEEDS_CLARIFICATION,
            messages: {
                user: msg.text,
                llm: response,
            },
        };

        contextService.getContext.mockReturnValue(undefined);
        intentService.classify.mockResolvedValue(llmResult);

        const result = await service.execute(msg);
        expect(result).toBe(response);
        expect(contextService.saveContext).toHaveBeenCalledWith(msg.from!.id, {
            lastMessageId: msg.message_id,
            originalMessage: msg.text,
            initialLlmResponse: response,
        });
    });

    it('should handle failed clarification by returning fallback and clearing context', async () => {
        const msg = telegramMessageMock('no');
        const context = {
            lastMessageId: msg.message_id - 1,
            originalMessage: 'listar',
            initialLlmResponse: '¿Te refieres a listar tus eventos?',
        };

        const llmResult: EvaluateMessageResult = {
            type: LLM_EVALUATED_INTENT.UNKNOWN,
        };

        contextService.getContext.mockReturnValue(context);
        intentService.clarify.mockResolvedValue(llmResult);

        const result = await service.execute(msg);
        expect(result).toMatchSnapshot();
        expect(contextService.clearContext).toHaveBeenCalledWith(msg.from!.id);
    });

    it('should return LLM fallback message if provided', async () => {
        const msg = telegramMessageMock('hola');
        const llmResult: EvaluateMessageResult = {
            type: LLM_EVALUATED_INTENT.UNKNOWN,
            messages: {
                user: 'hola',
                llm: 'Hola, ¿cómo puedo ayudarte?',
            },
        };

        contextService.getContext.mockReturnValue(undefined);
        intentService.classify.mockResolvedValue(llmResult);

        const result = await service.execute(msg);
        expect(result).toBe('Hola, ¿cómo puedo ayudarte?');
    });

    it('should log and return fallback message on error', async () => {
        const msg = telegramMessageMock('error');

        contextService.getContext.mockReturnValue(undefined);
        intentService.classify.mockRejectedValue(new Error('fail'));

        const result = await service.execute(msg);
        expect(result).toBe(
            '⚠️ Invalid Telegram message. / Mensaje de Telegram no válido.',
        );
    });
});
