import { Injectable, InjectionToken, Inject, Optional } from '@angular/core';
import { ConsolePolyfill } from './console-polyfill';

const ColorMap = {
  trace: 'gray',
  debug: 'black',
  info: '#0653ee',
  success: '#399636',
  warn: '#5d3b00',
  error: '#ff0000',
};

export interface LoggerOptions {
  colorize: boolean;
}

const options: LoggerOptions = {
  colorize: true,
};

export const LOGGER_NAMESPACE = 'LOGGER_NAMESPACE';

@Injectable()
export class Logger {
  private console: ConsolePolyfill = new ConsolePolyfill();

  static config(opts: Partial<LoggerOptions>): void {
    opts = opts || {};
    Object.assign(options, opts);
  }

  static forNamespace(namespace: string) {
    return new Logger(namespace);
  }

  constructor(
    @Inject(LOGGER_NAMESPACE)
    @Optional()
    private namespace = 'DEFAULT'
  ) {}

  getNamespace(): string {
    return this.namespace;
  }

  named(namespace: string) {
    return Logger.forNamespace(namespace);
  }

  trace(message: string, ...args: any[]): this {
    const formattedMessage = this.formatMessage('TRACE', message);
    this.logMessage(this.console.trace, formattedMessage, ...args);
    return this;
  }

  debug(message: string, ...args: any[]): this {
    const formattedMessage = this.formatMessage('DEBUG', message);
    this.logMessage(this.console.debug, formattedMessage, ...args);
    return this;
  }

  info(message: string, ...args: any[]): this {
    const formattedMessage = this.formatMessage('INFO', message);
    this.logMessage(this.console.info, formattedMessage, ...args);
    return this;
  }

  success(message: string, ...args: any[]): this {
    const formattedMessage = this.formatMessage('SUCCESS', message);
    this.logMessage(this.console.info, formattedMessage, ...args);
    return this;
  }

  warn(message: string, ...args: any[]): this {
    const formattedMessage = this.formatMessage('WARN', message);
    this.logMessage(this.console.warn, formattedMessage, ...args);
    return this;
  }

  error(message: string, ...args: any[]): this {
    const formattedMessage = this.formatMessage('ERROR', message);
    this.logMessage(this.console.error, formattedMessage, ...args);
    return this;
  }

  group(title: string, action: () => void): void {
    this.groupStart(title);
    try {
      action();
      this.groupEnd();
    } catch (err) {
      this.groupEnd();
      throw err;
    }
  }

  async groupAsync<T>(title: string, action: () => Promise<T>): Promise<T> {
    this.groupStart(title);
    try {
      const result = await action();
      this.groupEnd();
      return result;
    } catch (err) {
      this.groupEnd();
      throw err;
    }
  }

  groupStart(title: string): this {
    this.console.group(title);
    return this;
  }

  groupEnd(): this {
    this.console.groupEnd();
    return this;
  }

  private logMessage(
    target: Function,
    formattedMessage: { msg: string; colors: string[] },
    ...args: any[]
  ) {
    if (options.colorize) {
      target(formattedMessage.msg, ...formattedMessage.colors, ...args);
    } else {
      target(formattedMessage.msg.replace(/%c/gi, ''), ...args);
    }
  }

  private formatMessage(level: string, message: string) {
    const color = ColorMap[level.toLowerCase()];

    return {
      msg: `%c${this.namespace} [${level}] | %c${message}`,
      colors: [colorize(color, true), colorize(color, false)],
    };
  }
}

function colorize(fg: string, bold = false) {
  return `
    display: block;
    line-height: 1.5em;
    padding: 0.25em 0.1em 0.25em 0.1em;
    margin: 0;
    ${bold ? 'font-weight: bold;' : ''}
    color: ${fg};
  `;
}
