/**
 * @file evaluate-list-events.service.ts
 * @description Service to evaluate if a message is a request to list events, using LLM (OpenAI), with multi-language support.
 */

import { env } from '@config/env/env.config';
import { EvaluateMessagePort } from '@llm/application/ports/evaluate-message.port';
import { EVALUATE_MESSAGE_PROMPT } from '@llm/infrastructure/prompts/evaluate-message.prompt';
import { extractJsonFromString } from '@llm/infrastructure/utils/extract-json-from-string';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import OpenAI from 'openai';

type EvaluateMessageResult = Awaited<
    ReturnType<EvaluateMessagePort['evaluateMessage']>
>;

/**
 * Service for evaluating if a message requests listing events, via LLM (multi-language).
 */
@Injectable()
export class EvaluateListEventsService implements EvaluateMessagePort {
    private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    private readonly model = env.LLM_MODEL;
    private readonly temperature = 0.2;

    constructor(private readonly logger: LoggerService) {}

    /**
     * Evaluates the user's message to determine if it's a "list events" request, supporting Spanish and English.
     * @param message - The user message to analyze.
     * @returns EvaluateMessageResult: relevant, messages, etc.
     */
    async evaluateMessage(message: string): Promise<EvaluateMessageResult> {
        const systemPrompt = EVALUATE_MESSAGE_PROMPT.replace(
            '{user_message}',
            message,
        );

        const { choices } = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
            ],
            temperature: this.temperature,
        });

        const rawOutput = choices[0]?.message?.content ?? '';

        try {
            const clean = extractJsonFromString(rawOutput);
            const parsed = JSON.parse(clean || '{}');
            this.logger.info(
                '[EvaluateListEventsService] LLM evaluation parsed',
                {
                    evaluation: parsed,
                },
            );
            return parsed;
        } catch (e) {
            this.logger.error(
                '[EvaluateListEventsService] Failed to parse LLM response',
                (e as Error).stack,
                { rawOutput },
            );
            return {
                relevant: false,
                messages: {
                    user: null,
                    llm: '⚠️ An error occurred while processing your message / Ha ocurrido un error procesando tu mensaje',
                },
            };
        }
    }
}
