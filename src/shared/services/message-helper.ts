export class MessageHelper {
  /**
   * Combines multiple messages together, separated with comma.
   *
   * @param messages Messages to be combined.
   * @returns Messages combined and separated with a comma.
   */
  static join(...messages: string[]): string {
    return messages.join(', ');
  }

  /**
   * Replaces all '[PARAM_0]', '[PARAM_1]', ... inside the [message] with given
   * [params] parameters.
   *
   * @param message Message in which parameters should be replaced.
   * @param params List of parameters to be used in message.
   * @returns Prepared message.
   */
  static replaceParameters(
    message: string,
    ...params: (string | number)[]
  ): string {
    params.forEach((param, index) => {
      const placeholder = `[PARAM_${index}]`;
      message = message.replace(placeholder, param + '');
    });
    return message;
  }
}
