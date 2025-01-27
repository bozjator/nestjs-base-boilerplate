export class SharedFunctions {
  static getRequestIP(request: any): string | null {
    // When using nginx, request ip will be stored in 'x-forwarded-for' header.
    return request && request.headers && request.headers['x-forwarded-for']
      ? request.headers['x-forwarded-for']
      : request?.ip || null;
  }
}
