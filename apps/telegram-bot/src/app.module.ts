/**
 * @file app.module.ts
 * @description Root module for ReminderGram application.
 * Orchestrates all vertical modules and shared providers.
 */

import { Module } from '@nestjs/common';
import { TelegramModule } from '@telegram/telegram.module';

@Module({
    imports: [TelegramModule],
})
export class AppModule {}
