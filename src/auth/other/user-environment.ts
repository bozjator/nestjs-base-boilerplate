import { UAParser } from 'ua-parser-js';

/**
 * Max length of a user environment parameter when storing it.
 */
export const USER_ENV_PARAM_LENGTH = 20;

export class UserEnvironment {
  platform: string;
  browser: string;
}

export function getUserEnvironment(userAgent: string): UserEnvironment {
  const ua: UAParser.IResult = new UAParser(userAgent).getResult();
  const platform = ua.os.name || '';
  const browser = ua.browser.name || '';
  return { platform, browser };
}
