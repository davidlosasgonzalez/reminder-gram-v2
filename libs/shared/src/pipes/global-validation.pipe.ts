/**
 * @file global-validation.pipe.ts
 * @description Global validation pipe for validating DTOs in message processors or job handlers.
 * Uses class-validator for validation and logs validation errors via LoggerService.
 */

import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { LoggerService } from '@shared/infrastructure/logger/logger.service';
import { ensureValidatableObject } from '@shared/infrastructure/utils/ensure-validatable-object';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
    constructor(private readonly logger: LoggerService) {}

    /**
     * Transforms and validates the given value against the provided metadata type.
     * @param value The value to validate.
     * @param metadata Metadata about the value's expected type.
     * @returns The validated and transformed object.
     * @throws BadRequestException if validation fails.
     */
    async transform<T = unknown>(
        value: T,
        metadata: ArgumentMetadata,
    ): Promise<T> {
        if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
            return value;
        }

        const object = plainToInstance(metadata.metatype, value);
        const validatableObject = ensureValidatableObject(object);
        const errors = await validate(validatableObject as object, {
            whitelist: true,
            forbidNonWhitelisted: false,
            forbidUnknownValues: false,
            validationError: {
                target: false,
                value: false,
            },
        });

        if (errors.length > 0) {
            const formattedErrors = errors.map((err) => ({
                property: err.property,
                constraints: err.constraints,
                value: err.value,
            }));

            this.logger.warn(
                `Validation failed: ${JSON.stringify(formattedErrors)}`,
            );

            throw new BadRequestException({
                message: 'Validation error',
                errors: formattedErrors,
            });
        }

        return object;
    }

    /**
     * Checks if the given type should be validated.
     * Skips validation for primitive types and arrays of primitives.
     * @param metatype The type to check.
     * @returns True if should validate, false otherwise.
     */
    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}
