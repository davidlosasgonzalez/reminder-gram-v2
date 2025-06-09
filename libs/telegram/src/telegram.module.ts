/**
 * @file telegram.module.ts
 * @description Telegram module for managing all Telegram bot logic and messaging.
 */

import { CalendarModule } from '@calendar/calendar.module';
import { LlmModule } from '@llm/llm.module';
import { Module } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { GlobalValidationPipe } from '@shared/pipes/global-validation.pipe';

import { MessageProcessorService } from './presentation/services/message-processor.service';

@Module({
    imports: [CalendarModule, LlmModule],
    providers: [LoggerService, GlobalValidationPipe, MessageProcessorService],
    exports: [MessageProcessorService],
})
export class TelegramModule {}
