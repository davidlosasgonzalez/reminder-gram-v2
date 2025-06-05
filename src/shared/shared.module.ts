/**
 * @file shared.module.ts
 * @description Shared module for providing transversal services, utilities, and providers.
 */

import { Module } from '@nestjs/common';
import { LoggerService } from './infrastructure/logger.service';
import { GlobalValidationPipe } from './pipes/global-validation.pipe';

@Module({
    providers: [LoggerService, GlobalValidationPipe],
    exports: [LoggerService, GlobalValidationPipe],
})
export class SharedModule {}