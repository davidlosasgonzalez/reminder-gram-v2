/**
 * @file list-calendar-events.handler.ts
 * @description Handler for listing calendar events using a provider port and logger.
 */

import { CalendarEventDto } from '@calendar/application/dto/calendar-event.dto';
import {
    CALENDAR_PROVIDER,
    CalendarProviderPort,
} from '@calendar/application/ports/calendar-provider.port';
import { ListCalendarEventsQuery } from '@calendar/application/queries/list-calendar-events/list-calendar-events.query';
import { CalendarEventsUnavailableException } from '@calendar/domain/exceptions/calendar-events-unavailable.exception';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';

@Injectable()
export class ListCalendarEventsHandler {
    constructor(
        @Inject(CALENDAR_PROVIDER)
        private readonly calendarProvider: CalendarProviderPort,
        private readonly logger: LoggerService,
    ) {}

    /**
     * Executes the query to list events between two dates.
     * @param query The query containing the date range.
     * @returns Promise resolving to an array of calendar events.
     * @throws CalendarEventsUnavailableException if provider fails.
     */
    async execute(query: ListCalendarEventsQuery): Promise<CalendarEventDto[]> {
        try {
            return await this.calendarProvider.listEvents(
                query.start,
                query.end,
            );
        } catch (err) {
            this.logger.error(
                '[ListCalendarEventsHandler] Failed to list events',
                (err as Error).stack,
                {
                    start: query.start,
                    end: query.end,
                    error: (err as Error).message,
                },
            );
            throw new CalendarEventsUnavailableException(
                `Could not retrieve events from provider: ${(err as Error).message}`,
            );
        }
    }
}
