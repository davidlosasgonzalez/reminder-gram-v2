/**
 * @file google-calendar.provider.ts
 * @description Google Calendar provider implementation for CalendarProviderPort.
 */

import { CalendarEventDto } from '@calendar/application/dto/calendar-event.dto';
import { CalendarProviderPort } from '@calendar/application/ports/calendar-provider.port';
import { mapGoogleEventToDto } from '@calendar/infrastructure/mappers/google-calendar-event.mapper';
import { getUserGoogleAuth } from '@calendar/infrastructure/utils/get-user-google-auth';
import { env } from '@config/env/env.config';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import * as fs from 'fs/promises';
import { google } from 'googleapis';
import * as path from 'path';

@Injectable()
export class GoogleCalendarProvider implements CalendarProviderPort {
    constructor(private readonly logger: LoggerService) {}

    /**
     * Lists events within the given date range from Google Calendar.
     */
    async listEvents(start: Date, end: Date): Promise<CalendarEventDto[]> {
        this.logger.info(
            '[GoogleCalendarProvider] Retrieving events from all accounts',
            {
                start,
                end,
            },
        );

        const tokensDir = path.resolve(process.cwd(), 'private', 'tokens');
        let tokenFiles: string[] = [];

        try {
            tokenFiles = (await fs.readdir(tokensDir)).filter((f) =>
                f.endsWith('_token.json'),
            );
        } catch (err) {
            this.logger.error(
                '[GoogleCalendarProvider] Failed to read tokens directory',
                (err as Error).stack,
                { tokensDir, error: (err as Error).message },
            );
            return [];
        }

        const ignoredEventTitles = env.IGNORED_EVENT_TITLES.split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

        const allEvents: CalendarEventDto[] = [];

        for (const file of tokenFiles) {
            const email = file
                .replace('_token.json', '')
                .replace(/_/g, '.')
                .replace(/\.gmail\.com$/, '@gmail.com');

            try {
                const oauth2Client = await getUserGoogleAuth(email);
                const calendar = google.calendar({
                    version: 'v3',
                    auth: oauth2Client,
                });

                const calendarList = await calendar.calendarList.list();
                const primary = (calendarList.data.items || []).find(
                    (c) => c.primary && c.id,
                );

                if (!primary) {
                    this.logger.warn(
                        '[GoogleCalendarProvider] Skipping account: no primary calendar found',
                        { email },
                    );
                    continue;
                }

                const { data: { items = [] } = {} } =
                    await calendar.events.list({
                        calendarId: primary.id!,
                        timeMin: start.toISOString(),
                        timeMax: end.toISOString(),
                        singleEvents: true,
                        orderBy: 'startTime',
                    });

                const events: CalendarEventDto[] = items
                    .map((item) =>
                        mapGoogleEventToDto(item, primary.id!, start, end),
                    )
                    .filter(
                        (event) =>
                            !ignoredEventTitles.includes(
                                event.title.trim().toLowerCase(),
                            ),
                    );

                this.logger.info(
                    '[GoogleCalendarProvider] Events processing summary',
                    {
                        email,
                        fetched: items.length,
                        remaining: events.length,
                    },
                );

                allEvents.push(...events);
            } catch (err) {
                this.logger.warn(
                    '[GoogleCalendarProvider] Failed to fetch events for user',
                    { email, error: (err as Error).message },
                );
            }
        }

        return allEvents;
    }
}
