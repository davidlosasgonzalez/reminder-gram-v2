/**
 * @file llm.module.ts
 * @description LLM module that provides and exports evaluation and OpenAI chat services for dependency injection in other modules.
 */

import { EvaluateMessageIntentService } from '@llm/application/services/evaluate-message-intent.service';
import { OpenAiChatService } from '@llm/infrastructure/providers/openai-chat.service';
import { Module } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';

@Module({
    providers: [EvaluateMessageIntentService, OpenAiChatService, LoggerService],
    exports: [EvaluateMessageIntentService],
})
export class LlmModule {}
