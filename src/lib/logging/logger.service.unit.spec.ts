/* tslint:disable:no-console */
import { Logger } from './logger.service';
import { ConsolePolyfill } from './console-polyfill';

describe('Logger', () => {
  let console: ConsolePolyfill;
  let logger: Logger;

  beforeEach(() => {
    console = new ConsolePolyfill();
    logger = new Logger('DEFAULT');
    (<any>logger).console = console;

    spyOn(console, 'trace');
    spyOn(console, 'debug');
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
    spyOn(console, 'group');
    spyOn(console, 'groupEnd');

    Logger.config({
      colorize: false,
    });
  });

  describe('named', () => {
    it('should start with default namespace if not called', () => {
      // Act / Assert
      expect(logger.getNamespace()).toBe('DEFAULT');
    });

    it('should set namespace', () => {
      // Arrange
      logger = logger.named('MY-LOGGER');

      // Act / Assert
      expect(logger.getNamespace()).toBe('MY-LOGGER');
    });
  });

  describe('trace', () => {
    it('should log to console', () => {
      // Act
      logger.trace('Something');

      // Assert
      expect(console.trace).toHaveBeenCalledWith('DEFAULT [TRACE] | Something');
    });
  });

  describe('debug', () => {
    it('should log to console', () => {
      // Act
      logger.debug('Something');

      // Assert
      expect(console.debug).toHaveBeenCalledWith('DEFAULT [DEBUG] | Something');
    });
  });

  describe('info', () => {
    it('should log to console', () => {
      // Act
      logger.info('Something');

      // Assert
      expect(console.info).toHaveBeenCalledWith('DEFAULT [INFO] | Something');
    });
  });

  describe('success', () => {
    it('should log to console', () => {
      // Act
      logger.success('Something');

      // Assert
      expect(console.info).toHaveBeenCalledWith('DEFAULT [SUCCESS] | Something');
    });
  });

  describe('warn', () => {
    it('should log to console', () => {
      // Act
      logger.warn('Something');

      // Assert
      expect(console.warn).toHaveBeenCalledWith('DEFAULT [WARN] | Something');
    });
  });

  describe('error', () => {
    it('should log to console', () => {
      // Act
      logger.error('Something');

      // Assert
      expect(console.error).toHaveBeenCalledWith('DEFAULT [ERROR] | Something');
    });
  });

  describe('group', () => {
    it('should perform action within a group', () => {
      // Arrange
      const spy = jasmine.createSpy('foo', () => {});

      // Act
      logger.group('My group', spy);

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(console.group).toHaveBeenCalledWith('My group');
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should still call end if an error is thrown', () => {
      // Arrange
      const func = () =>
        logger.group('Foo', () => {
          throw new Error('Nope');
        });

      // Act
      expect(func).toThrowError('Nope');

      // Assert
      expect(console.group).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });

  describe('groupAsync', () => {
    it('should perform async action within a group', async () => {
      // Arrange
      const spy = jasmine.createSpy('foo', () => {});

      // Act
      await logger.groupAsync('My group', spy);

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(console.group).toHaveBeenCalledWith('My group');
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should still call end if an error is thrown', () => {
      // Arrange
      const func = () =>
        logger.group('Foo', () => {
          throw new Error('Nope');
        });

      // Act
      expect(func).toThrowError('Nope');

      // Assert
      expect(console.group).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });
});
