/**
 * @file main.ts
 * @description Bootstrap file for ReminderGram bot application.
 * Initializes the NestJS application and registers global process error handlers.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstraps the ReminderGram bot application.
 */
async function bootstrap() {
   await NestFactory.create(AppModule);

    console.log('ReminderGram Bot started successfully.');

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
