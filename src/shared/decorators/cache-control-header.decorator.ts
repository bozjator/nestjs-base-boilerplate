import { Header } from '@nestjs/common';

/**
 * Adds header to let a browser know that caching a resource should take
 * 'Authorization' header into account.
 *
 * @returns Header 'Vary: Authorization'.
 */
export function CacheControlHeader(): MethodDecorator {
  return function (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    Header('Vary', 'Authorization')(target, key, descriptor);
  };
}
