/**
 * @file events.mock.ts
 * @description Static list of mocked calendar events used for testing event listing scenarios in the application.
 */

import { CalendarEventDto } from '@calendar/application/dto/calendar-event.dto';

export const eventsMock: CalendarEventDto[] = [
    {
        id: '1',
        title: 'Project Kickoff',
        start: new Date('2025-06-07T10:00:00Z'),
        end: new Date('2025-06-07T11:00:00Z'),
        description: 'Initial project meeting',
        location: 'Meeting Room A',
        calendarId: 'primary',
    },
    {
        id: '2',
        title: '1:1 with Sarah',
        start: new Date('2025-06-08T09:00:00Z'),
        end: new Date('2025-06-08T09:30:00Z'),
        description: 'Weekly sync-up',
        location: 'Zoom',
        calendarId: 'primary',
    },
    {
        id: '3',
        title: 'Tech Talk',
        start: new Date('2025-06-09T15:00:00Z'),
        end: new Date('2025-06-09T16:00:00Z'),
        description: 'Microservices best practices',
        location: '',
        calendarId: 'primary',
    },
];
