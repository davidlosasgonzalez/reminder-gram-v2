/**
 * @file calendar.module.ts
 * @description Calendar module for managing calendar-related functionality.
 * Orchestrates all vertical modules and shared providers.
 */

import { CALENDAR_PROVIDER } from '@calendar/application/ports/calendar-provider.port';
import { ListCalendarEventsHandler } from '@calendar/application/queries/list-calendar-events/list-calendar-events.handler';
import { GoogleCalendarProvider } from '@calendar/infrastructure/providers/google-calendar.provider';
import { Module } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';

@Module({
    providers: [
        LoggerService,
        GoogleCalendarProvider,
        {
            provide: CALENDAR_PROVIDER,
            useClass: GoogleCalendarProvider,
        },
        ListCalendarEventsHandler,
    ],
    exports: [ListCalendarEventsHandler],
})
export class CalendarModule {}
