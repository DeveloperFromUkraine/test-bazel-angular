import { BehaviorSubject, throwError } from 'rxjs';
import { Message, MessagesComponent } from './messages.component';
import { ActivatedRoute } from '@angular/router';
import { GraphQLErrorResponse, graphQLError, graphQLSyntaxError } from './types/graphql-error';
import { Logger } from '../logging/logger.service';
import { take } from 'rxjs/operators';

describe('Messages component', () => {
  let component: MessagesComponent;
  let route: ActivatedRoute;
  let params: BehaviorSubject<any>;
  let logger: Logger;

  beforeEach(() => {
    route = {} as ActivatedRoute;
    route.queryParams = params = new BehaviorSubject({});
    route.params = new BehaviorSubject({});
    logger = {
      named(namespace) {
        return logger;
      },
      error(message, args) {},
      trace(message, args) {},
    } as Logger;
    spyOn(logger, 'error');

    component = new MessagesComponent(logger, route);
  });

  describe('report', () => {
    it('should report all messages', async () => {
      // Arrange
      const messages: Message[] = [
        { type: 'error', message: 'Foo' },
        { type: 'error', message: 'Bar' },
      ];

      // Act
      component.report(messages);

      // Assert
      const results = await component.errors$.pipe(take(1)).toPromise();
      expect(results).toEqual(messages);
    });
  });

  describe('clear', () => {
    it('should clear errors', async () => {
      // Arrange
      component.report([{ type: 'error', message: 'Foo' }]);
      component.report([{ type: 'error', message: 'Bar' }]);

      // Precondition
      const initialMessages = await component.errors$.pipe(take(1)).toPromise();
      expect(initialMessages.length).toEqual(2);

      // Act
      component.clear();

      // Assert
      const results = await component.errors$.pipe(take(1)).toPromise();
      expect(results).toEqual([]);
    });
  });

  describe('hasErrors', () => {
    it('should be false when no errors', async () => {
      // Act
      const result = await component.hasErrors$.pipe(take(1)).toPromise();

      // Assert
      expect(result).toEqual(false);
    });

    it('should be true when there are errors', async () => {
      // Arrange
      component.report([{ type: 'error', message: 'Nope' }]);

      // Act
      const result = await component.hasErrors$.pipe(take(1)).toPromise();

      // Assert
      expect(result).toEqual(true);
    });

    it('should be false after errors cleared', async () => {
      // Arrange
      component.report([{ type: 'error', message: 'Nope' }]);
      component.clear();

      // Act
      const result = await component.hasErrors$.pipe(take(1)).toPromise();

      // Assert
      expect(result).toEqual(false);
    });
  });

  describe('reportErrors', () => {
    describe('when no error', () => {
      it('should report a generic error', async () => {
        // Act
        component.reportErrors(null);

        // Assert
        const results = await component.errors$.pipe(take(1)).toPromise();
        expect(results).toEqual([{ type: 'error', message: 'Generic.Error' }]);
      });
    });

    describe('when 1 syntax error present', () => {
      it('then it should be logged', () => {
        const syntaxError = // tslint:disable-next-line:max-line-length
          'Variable "$residentialAddress" got invalid value {"country":{"code":"USA"},"line1":"Kentucky 1231","subdivision":{"code":"KY"}}. In field "city": Expected "String!", found null.';

        const error = {
          graphQLErrors: [graphQLSyntaxError(syntaxError)] as GraphQLErrorResponse[],
        };

        component.reportErrors(error);

        expect(logger.error).toHaveBeenCalledWith(`Syntax error 1: ${syntaxError}`);
      });
    });

    describe('when 2 syntax errors present', () => {
      it('then both should be logged', async () => {
        const syntaxError1 = // tslint:disable-next-line:max-line-length
          'Variable "$residentialAddress" got invalid value {"country":{"code":"USA"},"line1":"Kentucky 1231","subdivision":{"code":"KY"}}. In field "city": Expected "String!", found null.';

        const syntaxError2 = // tslint:disable-next-line:max-line-length
          'Variable "$mailingAddress" got invalid value {"country":{"code":"USA"},"line1":"Kentucky 1231","subdivision":{"code":"KY"}}. In field "city": Expected "String!", found null.';

        const errors = {
          graphQLErrors: [
            graphQLSyntaxError(syntaxError1),
            graphQLSyntaxError(syntaxError2),
          ] as GraphQLErrorResponse[],
        };

        component.reportErrors(errors);

        expect(logger.error).toHaveBeenCalledWith(`Syntax error 1: ${syntaxError1}`);
        expect(logger.error).toHaveBeenCalledWith(`Syntax error 2: ${syntaxError2}`);

        const results = await component.errors$.pipe(take(1)).toPromise();
        expect(results).toEqual([{ type: 'error', message: 'Generic.Error' }]);
      });
    });

    describe('when error not graphql error', () => {
      it('should report a generic error', async () => {
        // Arrange
        const error = new Error(`I'm sorry, Dave. I am afraid I can't do that.`);

        // Act
        component.reportErrors(error);

        // Assert
        const results = await component.errors$.pipe(take(1)).toPromise();
        expect(results).toEqual([{ type: 'error', message: 'Generic.Error' }]);
      });

      describe('when error is from GraphQL server', () => {
        it('should be able to handle errors from a single response', async () => {
          // Arrange
          const error = {
            graphQLErrors: [
              graphQLError('Mistake number 1', 'Mistake number 2'),
            ] as GraphQLErrorResponse[],
          };

          // Act
          component.reportErrors(error);

          // Assert
          const results = await component.errors$.pipe(take(1)).toPromise();
          expect(results).toEqual([
            { type: 'error', message: 'Mistake number 1' },
            { type: 'error', message: 'Mistake number 2' },
          ]);
        });

        it('should be able to combine errors from multiple responses', async () => {
          // Arrange
          const error = {
            graphQLErrors: [
              graphQLError('One'),
              graphQLError('Two', 'Three'),
              graphQLError('Four'),
            ] as GraphQLErrorResponse[],
          };

          // Act
          component.reportErrors(error);

          // Assert
          const results = await component.errors$.pipe(take(1)).toPromise();
          expect(results).toEqual([
            { type: 'error', message: 'One' },
            { type: 'error', message: 'Two' },
            { type: 'error', message: 'Three' },
            { type: 'error', message: 'Four' },
          ]);
        });
      });
    });
  });

  describe('handleErrors', () => {
    it('should report errors thrown from promises', async () => {
      // Arrange
      const error = Promise.reject({
        graphQLErrors: [graphQLError('You must construct additional pylons')],
      });

      // Act
      await component.handleErrors(error);

      // Assert
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(true);
      expect(await component.errors$.pipe(take(1)).toPromise()).toEqual([
        { type: 'error', message: 'You must construct additional pylons' },
      ]);
    });

    it('should report errors from observables', async () => {
      // Arrange
      const error = throwError({
        graphQLErrors: [graphQLError('Spawn more overlords')],
      });

      // Act
      await component.handleErrors(error);

      // Assert
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(true);
      expect(await component.errors$.pipe(take(1)).toPromise()).toEqual([
        { type: 'error', message: 'Spawn more overlords' },
      ]);
    });

    it('should clear errors prior to showing more errors', async () => {
      // Arrange
      component.report({ type: 'error', message: 'Prior error' });
      const error = Promise.reject({
        graphQLErrors: [graphQLError('Build more supply depots')],
      });

      // Act
      await component.handleErrors(error);

      // Assert
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(true);
      expect(await component.errors$.pipe(take(1)).toPromise()).toEqual([
        { type: 'error', message: 'Build more supply depots' },
      ]);
    });

    it('should continue on when promise resolves', async () => {
      // Arrange
      const promise = Promise.resolve(true);

      // Act
      await component.handleErrors(promise);

      // Assert
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(false);
      expect(await component.errors$.pipe(take(1)).toPromise()).toEqual([]);
    });

    //   it('should continue on when observable emits a value', async () => {
    //     // Arrange
    //     const promise = Observable.of(true);
    //
    //     // Act
    //     await component.handleErrors(promise);
    //
    //     // Assert
    //     expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(false);
    //     expect(await component.errors$.pipe(take(1)).toPromise()).toEqual([]);
    //   });
  });

  describe('handleFetchErrors', () => {
    it('should report errors and return an empty observable', async () => {
      // Arrange
      const observable = throwError({
        graphQLErrors: [graphQLError('I dun goofed')],
      });

      // Act
      const result = await observable
        .pipe(
          component.handleFetchErrors,
          take(1)
        )
        .toPromise();

      // Assert
      expect(result).toEqual(undefined);
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(true);
      expect(await component.errors$.pipe(take(1)).toPromise()).toEqual([
        { type: 'error', message: 'I dun goofed' },
      ]);
    });
  });

  describe('when navigating', () => {
    it('should clear errors', async () => {
      // Arrange
      component.ngOnInit();
      component.report({ type: 'error', message: 'Foo' });

      // Precondition
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(true);

      // Act
      params.next({});

      // Assert
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(false);
      expect(await component.errors$.pipe(take(1)).toPromise()).toEqual([]);
    });

    it('should stop listening to navigation when destroyed', async () => {
      // Arrange
      component.ngOnInit();
      component.report({ type: 'error', message: 'Some initial error' });

      // Precondition
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(true);

      // Act
      component.ngOnDestroy();
      params.next({});

      // Assert
      expect(await component.hasErrors$.pipe(take(1)).toPromise()).toEqual(true);
      expect(await component.errors$.pipe(take(1)).toPromise()).toEqual([
        { type: 'error', message: 'Some initial error' },
      ]);
    });
  });
});
