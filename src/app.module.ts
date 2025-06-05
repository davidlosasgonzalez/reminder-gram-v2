// src/app.module.ts

/**
 * Root module for ReminderGram application.
 * Orchestrates all vertical modules and shared providers.
 * Nivel: Intermedio/Enterprise (modular, Clean Architecture).
 * @module AppModule
 */
import { Module } from '@nestjs/common';
import { CalendarModule } from './calendar/calendar.module';
import { TelegramModule } from './telegram/telegram.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    CalendarModule,
    TelegramModule,
    SchedulerModule,
    SharedModule,
  ],
})
export class AppModule {}
