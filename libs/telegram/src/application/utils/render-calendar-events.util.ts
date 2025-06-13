/**
 * @file /libs/telegram/src/application/utils/render-calendar-events.util.ts
 * @description Utility to render a list of CalendarEventDto into a natural language string.
 */

import { CalendarEventDto } from '@calendar/application/dto/calendar-event.dto';

export function renderCalendarEvents(events: CalendarEventDto[]): string {
    if (!events.length) return 'No upcoming events.';

    return events
        .map((ev) => {
            const dateStart = ev.start.toLocaleDateString('es-ES');
            const timeStart = ev.start.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            const dateEnd = ev.end.toLocaleDateString('es-ES');
            const timeEnd = ev.end.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });

            return [
                `💠 ${ev.title}`,
                `📆 ${dateStart}, ${timeStart} - ${dateEnd}, ${timeEnd}`,
                ev.location ? `📍 ${ev.location}` : undefined,
            ]
                .filter(Boolean)
                .join('\n');
        })
        .join('\n\n');
}
