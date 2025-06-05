// src/telegram/telegram.module.ts

/**
 * Telegram module for managing all Telegram bot logic and messaging.
 * Nivel: Intermedio/Enterprise (vertical, Clean Architecture).
 * @module TelegramModule
 */
import { SharedModule } from '@/shared/shared.module';
import { Module } from '@nestjs/common';
import { MessageProcessorService } from './presentation/services/message-processor.service';

@Module({
    imports: [SharedModule],
    providers: [MessageProcessorService],
    exports: [MessageProcessorService],
})
export class TelegramModule {}
