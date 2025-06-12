/**
 * @file telegram-message.dto.ts
 * @description Minimal DTO for validating and extracting key fields from a Telegram message,
 * matching Telegram's native payload structure for easier transformation.
 */

import { Type } from 'class-transformer';
import {
    IsDefined,
    IsInt,
    IsObject,
    IsString,
    ValidateNested,
} from 'class-validator';

class FromDto {
    @IsDefined()
    @IsInt()
    id!: number;
}

export class TelegramMessageDto {
    @IsDefined()
    @IsString()
    text!: string;

    @IsDefined()
    @IsInt()
    message_id!: number;

    @IsDefined()
    @IsObject()
    @ValidateNested()
    @Type(() => FromDto)
    from!: FromDto;
}
