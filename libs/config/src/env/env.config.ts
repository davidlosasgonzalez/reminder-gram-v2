/**
 * @file env.config.ts
 * @description Loads and validates environment variables using dotenv and a Zod schema.
 * Exits the process if validation fails.
 */

import { config } from 'dotenv';

import { envSchema } from './env.validation';

config();

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('Error validando variables de entorno:');
    console.error(parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
