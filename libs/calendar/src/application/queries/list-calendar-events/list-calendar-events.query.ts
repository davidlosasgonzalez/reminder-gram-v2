/**
 * @file list-calendar-events.query.ts
 * @description Query object for listing calendar events.
 */

export class ListCalendarEventsQuery {
    constructor(
        public readonly start: Date,
        public readonly end: Date,
    ) {}
}
