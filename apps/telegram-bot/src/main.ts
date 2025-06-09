/**
 * @file main.ts
 * @description Bootstrap file for ReminderGram bot application.
 * Initializes the NestJS application, injects the MessageProcessorService,
 * launches the Telegram bot using Telegraf, and implements robust multi-strategy language detection.
 */

import { env } from '@config/env/env.config';
import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { MessageProcessorService } from '@telegram/presentation/services/message-processor.service';
import { AppModule } from '@telegram-bot/app.module';
import { Telegraf } from 'telegraf';

/**
 * Bootstraps the ReminderGram bot application, sets up the Telegraf bot,
 * injects required dependencies, configures language detection, and starts listening for messages.
 * Registers global handlers for uncaught exceptions and unhandled promise rejections.
 *
 * @returns {Promise<void>} Resolves when the bot is successfully launched.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const messageProcessor = app.get(MessageProcessorService);

    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

    bot.hears(/.*/, async (ctx) => {
        const message = await messageProcessor.process(ctx.message);
        await ctx.reply(message);
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
