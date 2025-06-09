/**
 * @file calendar-event.dto.ts
 * @description DTO for calendar event.
 */

import { IsDate, IsOptional, IsString } from 'class-validator';

export class CalendarEventDto {
    @IsString()
    id: string;

    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDate()
    start: Date;

    @IsDate()
    end: Date;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    calendarId: string;
}
