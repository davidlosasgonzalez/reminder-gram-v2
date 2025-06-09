/**
 * @file calendar-events-unavailable.exception.ts
 * @description Exception thrown when calendar events cannot be retrieved from the provider.
 */

export class CalendarEventsUnavailableException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CalendarEventsUnavailableException';
    }
}
