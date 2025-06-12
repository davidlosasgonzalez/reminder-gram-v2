/**
 * @file evaluate-message-intent.service.ts
 * @description Service to determine the intent behind a user message using LLM (OpenAI).
 */

import { EvaluateMessageResult } from '@llm/domain/contracts/evaluate-message-result.contract';
import { LLM_EVALUATED_INTENT } from '@llm/domain/enums/llm-evaluated-intent.enum';
import { EVALUATE_CLARIFICATION_PROMPT } from '@llm/infrastructure/prompts/evaluate-clarification.prompt';
import { EVALUATE_MESSAGE_PROMPT } from '@llm/infrastructure/prompts/evaluate-message.prompt';
import { OpenAiChatService } from '@llm/infrastructure/providers/openai-chat.service';
import { extractJsonFromString } from '@llm/infrastructure/utils/extract-json-from-string';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';

@Injectable()
export class EvaluateMessageIntentService {
    constructor(
        private readonly logger: LoggerService,
        private readonly openai: OpenAiChatService,
    ) {}

    /**
     * Classifies the user's message to determine its intent.
     * Only supports the intent of listing upcoming calendar events.
     *
     * @param message Full user message.
     * @returns Evaluation result with intent type and optional assistant response.
     */
    async classify(message: string): Promise<EvaluateMessageResult> {
        const prompt = EVALUATE_MESSAGE_PROMPT.replace(
            '{user_message}',
            message,
        );
        return this.runPrompt(prompt, '[EvaluateMessageIntentService] intent');
    }

    /**
     * Resolves the intent from a clarification to a previous ambiguous message.
     * @param original Original user message.
     * @param llmResponse Previous assistant message suggesting clarification.
     * @param clarification Clarification message from user.
     * @returns Evaluation result
     */
    async clarify(
        original: string,
        llmResponse: string,
        clarification: string,
    ): Promise<EvaluateMessageResult> {
        const prompt = EVALUATE_CLARIFICATION_PROMPT.replace(
            '{original_message}',
            original,
        )
            .replace('{initial_llm_response}', llmResponse)
            .replace('{clarification}', clarification);

        return this.runPrompt(prompt, '[EvaluateMessageIntentService] clarify');
    }

    /**
     * Executes a prompt against the LLM and parses the structured JSON response.
     * Handles logging and fallback in case of parsing errors.
     *
     * @param prompt The prompt string to send to the LLM.
     * @param context A tag used to identify the operation in logs.
     * @returns The parsed evaluation result or a default UNKNOWN response on failure.
     */
    private async runPrompt(
        prompt: string,
        context: string,
    ): Promise<EvaluateMessageResult> {
        try {
            const rawOutput = await this.openai.chat(prompt);
            const clean = extractJsonFromString(rawOutput);
            const parsed = JSON.parse(clean || '{}');

            this.logger.info(`${context} → parsed`, { evaluation: parsed });
            return parsed;
        } catch (e) {
            this.logger.error(
                `${context} → failed to parse`,
                (e as Error).stack,
                {
                    prompt,
                },
            );

            return {
                type: LLM_EVALUATED_INTENT.UNKNOWN,
                messages: {
                    user: '',
                    llm: '⚠️ An error occurred while processing your message / Ha ocurrido un error procesando tu mensaje',
                },
            };
        }
    }
}
