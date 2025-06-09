/**
 * @file calendar-provider.port.ts
 * @description Contract/port for calendar providers. Allows listing calendar events, agnostic of vendor.
 */

import { CalendarEventDto } from '@calendar/application/dto/calendar-event.dto';

export const CALENDAR_PROVIDER = Symbol('CALENDAR_PROVIDER');

export interface CalendarProviderPort {
    /**
     * Finds events within a date range.
     * @param start Start date.
     * @param end End date.
     * @returns Array of events.
     */
    listEvents(start: Date, end: Date): Promise<CalendarEventDto[]>;
}
