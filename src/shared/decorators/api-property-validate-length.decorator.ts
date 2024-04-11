import { applyDecorators } from '@nestjs/common';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Will apply string min and max length validation and add Swagger ApiProperty
 * decorator. Both min and max are optional, but in case that min is not
 * specified it will be set to 1.
 *
 * @param param0 Object with optional properties.
 * @returns Decorators for length validation and Swagger api property.
 */
export function ApiPropertyValidateLength({
  min,
  max,
  example,
  description,
  isOptional,
}: {
  min?: number;
  max?: number;
  example?: string;
  description?: string;
  isOptional?: boolean;
}) {
  const decorators = [];
  const propertyOptions: any = {};

  if (isOptional) decorators.push(IsOptional());
  if (example) propertyOptions.example = example;
  if (description) propertyOptions.description = description;

  if (min === undefined) min = 1;
  decorators.push(MinLength(min));
  propertyOptions.minimum = min;

  if (max !== undefined) {
    decorators.push(MaxLength(max));
    propertyOptions.maximum = max;
  }

  decorators.push(
    isOptional
      ? ApiPropertyOptional(propertyOptions)
      : ApiProperty(propertyOptions),
  );

  return applyDecorators(...decorators);
}
