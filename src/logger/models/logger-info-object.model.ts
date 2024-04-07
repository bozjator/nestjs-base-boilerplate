import { ExceptionResponseBody } from './exception-response-body.model';

class LoggerInfoObjectRequest {
  constructor(
    public ip: string,
    public url: string,
    public method: string,
    public headers: object,
    public body?: object | object[] | unknown,
  ) {}
}

export class LoggerInfoObject {
  context: string;
  info: string;
  errorStack?: string;
  queueJobData?: string | object;
  request?: LoggerInfoObjectRequest;
  response?: ExceptionResponseBody;

  constructor({
    context,
    info,
    errorStack,
    queueJobData,
    request,
    response,
  }: {
    context: string;
    info: string;
    errorStack?: string;
    queueJobData?: string | object;
    request?: LoggerInfoObjectRequest;
    response?: ExceptionResponseBody;
  }) {
    this.context = context;
    this.info = info;
    this.errorStack = errorStack;
    this.queueJobData = queueJobData;
    this.request = request;
    this.response = response;
  }
}
