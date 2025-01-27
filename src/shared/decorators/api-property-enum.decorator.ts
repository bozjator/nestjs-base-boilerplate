import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsOptional, ValidationOptions } from 'class-validator';

/**
 * Will apply decorator to check if property value is one of the given enum and
 * it will add Swagger ApiProperty decorator with type of the given enum.
 *
 * @param type Enum to be used for validation.
 * @param propertyName Name of the property which is being checked.
 *                     Used for invalid validation message.
 * @returns Applied decorators.
 */
export function ApiPropertyEnum(
  type: any,
  propertyName: string,
  { isArray = false, isOptional = false, enumName = '' } = {},
) {
  const apiPropertyOptions: ApiPropertyOptions = {
    enum: type,
    isArray,
    enumName: '',
  };
  if (enumName && enumName.length > 0) {
    apiPropertyOptions.description = enumName;
    apiPropertyOptions.enumName = enumName;
  }

  const isEnumOptions: ValidationOptions = {
    message: `Invalid value for ${propertyName}.`,
  };
  if (isArray) isEnumOptions.each = true;

  return applyDecorators(
    ...(isOptional ? [IsOptional()] : []),
    IsEnum(type, isEnumOptions),
    isOptional
      ? ApiPropertyOptional(apiPropertyOptions)
      : ApiProperty(apiPropertyOptions),
  );
}
