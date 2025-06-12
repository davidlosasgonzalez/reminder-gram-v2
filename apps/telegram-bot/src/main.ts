/**
 * @file main.ts
 * @description Bootstrap file for ReminderGram bot application.
 * Initializes the NestJS application, injects the MessageProcessorService,
 * launches the Telegram bot using Telegraf, and implements robust multi-strategy language detection.
 */

import { env } from '@config/env/env.config';
import { NestFactory } from '@nestjs/core';
import { MessageProcessorService } from '@telegram/presentation/services/message-processor.service';
import { AppModule } from '@telegram-bot/app.module';
import { Context, Telegraf } from 'telegraf';
import { Message, Update } from 'telegraf/typings/core/types/typegram';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const messageProcessor = app.get(MessageProcessorService);

    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

    bot.hears(/.*/, async (ctx: Context<Update>) => {
        const message = ctx.message as Message.TextMessage | undefined;
        if (!message) return;

        const reply = await messageProcessor.execute(message);
        await ctx.reply(reply);
    });

    console.log('ReminderGram Bot started and listening on Telegram!');
    await bot.launch();

    process.on('uncaughtException', (err) => {
        console.error(
            `Uncaught Exception: ${(err as Error).message}`,
            (err as Error).stack,
        );
    });

    process.on('unhandledRejection', (reason: unknown) => {
        console.error(`Unhandled Rejection: ${JSON.stringify(reason)}`);
    });
}

void bootstrap();
