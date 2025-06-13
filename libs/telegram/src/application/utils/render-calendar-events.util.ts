/**
 * @file render-calendar-events.util.ts
 * @description Utility to render a list of CalendarEventDto into a natural language string.
 */

import { CalendarEventDto } from '@calendar/application/dto/calendar-event.dto';

export function renderCalendarEvents(events: CalendarEventDto[]): string {
    if (!events.length) return 'No upcoming events.';

    return events
        .map((ev) =>
            [
                `💠 ${ev.title}`,
                `📆 ${ev.start.toLocaleString()} - ${ev.end.toLocaleString()}`,
                ev.location ? `📍 ${ev.location}` : undefined,
            ]
                .filter(Boolean)
                .join('\n'),
        )
        .join('\n\n');
}
