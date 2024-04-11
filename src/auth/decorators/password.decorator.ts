import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { MinLength, MaxLength } from 'class-validator';

/**
 * Validator for a new password.
 *
 * @returns Applies all decorators needed for validating password.
 */
export function Password() {
  const minLength = 8;
  const maxLength = 50;
  return applyDecorators(
    MinLength(minLength),
    MaxLength(maxLength),
    ApiProperty({
      minimum: minLength,
      maximum: maxLength,
    }),
  );
}
