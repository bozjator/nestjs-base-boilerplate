import { UAParser } from 'ua-parser-js';

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
