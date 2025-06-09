/**
 * @file telegram-message.dto.ts
 * @description Minimal DTO for validating the text of an incoming Telegram message.
 */

import { IsDefined, IsString } from 'class-validator';

export class TelegramMessageDto {
    @IsDefined()
    @IsString()
    text!: string;
}
