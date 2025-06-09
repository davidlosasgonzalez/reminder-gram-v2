/**
 * @file google-calendar-event.mapper.ts
 * @description Maps Google Calendar event objects to CalendarEventDto.
 */

import { CalendarEventDto } from '@calendar/application/dto/calendar-event.dto';
import { calendar_v3 } from 'googleapis';

/**
 * Maps a Google Calendar event item to CalendarEventDto.
 *
 * @param item Google event item as returned by the API.
 * @param calendarId ID of the calendar containing the event.
 * @param defaultStart Fallback start date if the event is missing start date.
 * @param defaultEnd Fallback end date if the event is missing end date.
 * @returns Mapped CalendarEventDto.
 */
export function mapGoogleEventToDto(
    item: calendar_v3.Schema$Event,
    calendarId: string,
    defaultStart: Date,
    defaultEnd: Date,
): CalendarEventDto {
    return {
        id: item.id || '',
        title: item.summary || '',
        description: item.description || '',
        start: item.start?.dateTime
            ? new Date(item.start.dateTime)
            : defaultStart,
        end: item.end?.dateTime ? new Date(item.end.dateTime) : defaultEnd,
        location: item.location || '',
        calendarId,
    };
}
