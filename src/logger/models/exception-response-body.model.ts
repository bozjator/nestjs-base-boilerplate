/**
 * Property 'statusCode' is a number representing http status code.
 *
 * Property 'message' will contain list of strings when there is a validation
 * problem with request data, otherwise 'message' property will be a string.
 *
 * Property 'error' is optional, but it will be set with exception name, in case
 * when exception was thrown intentionaly and message was set. If exception was
 * thrown unintentionally 'message' property will contain exception name and
 * 'error' property will not be set.
 */
export class ExceptionResponseBody {
  constructor(
    public statusCode: number,
    public message: string | string[],
    public error?: string,
  ) {}
}
