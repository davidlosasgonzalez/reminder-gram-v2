/**
 * @file telegram-message.mock.ts
 * @description Utility function to generate mocked Telegram TextMessage payloads for unit and integration tests.
 */

import { Message } from 'telegraf/typings/core/types/typegram';

export const telegramMessageMock = (
    text: string,
    id = 123,
): Message.TextMessage => ({
    message_id: id,
    text,
    date: 12345678,
    from: {
        id,
        is_bot: false,
        first_name: 'Tester',
    },
    chat: {
        id,
        type: 'private',
        first_name: 'Tester',
    },
});
