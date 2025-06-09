/**
 * @file ensure-validatable-object.ts
 * @description Utility function to ensure a value is compatible with class-validator.
 * Returns an empty object if the value is undefined or null.
 */

export function ensureValidatableObject<T = object>(value: T): T {
    if (value === undefined || value === null) {
        return {} as T;
    }
    return value;
}
