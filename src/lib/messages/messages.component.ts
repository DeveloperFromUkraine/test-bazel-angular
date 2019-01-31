import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, EMPTY, Observable, BehaviorSubject, Subject } from 'rxjs';
import { Logger } from '../logging/logger.service';
import { ActivatedRoute } from '@angular/router';
import { GraphQLErrorResponse } from './types/graphql-error';
import { catchError, map, take, takeUntil } from 'rxjs/operators';

/**
 * Represents a message in the {MessagesComponent}.
 */
export interface Message {
  /**
   * The type of the message.
   */
  type: 'error' | 'info' | 'warning';

  /**
   * The message text.
   */
  message: string;
}

/**
 * This component wraps the error banner to display a list of one or more messages.
 */
@Component({
  selector: 'app-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./messages.component.scss'],
  template: `
    <!--<ign-error-banner *ngIf="(errors$ | async)?.length">-->
      <button class="dismiss-button" type="button" mat-icon-button (click)="clear()">&times;</button>
      <ul class="message-list">
        <li class="message" *ngFor="let error of errors$ | async">
          <!--{{error.message | uppercase}}-->
        </li>
      </ul>
    <!--</ign-error-banner>-->
  `,
  providers: [Logger],
})
export class MessagesComponent implements OnInit, OnDestroy {
  private readonly log: Logger;
  private destroyed$ = new Subject();
  private routeArgs$: Observable<any>;

  /**
   * An observable of the collection of messages.
   */
  readonly errors$ = new BehaviorSubject<Message[]>([]);

  /**
   * An observable that will emit true if there are any errors.
   */
  readonly hasErrors$: Observable<boolean>;

  constructor(logger: Logger, route: ActivatedRoute) {
    this.log = logger.named('MESSAGES');
    this.hasErrors$ = this.errors$.pipe(map(errors => errors && errors.length > 0));
    this.routeArgs$ = combineLatest(route.params, route.queryParams);
    this.handleFetchErrors = this.handleFetchErrors.bind(this);
  }

  ngOnInit(): void {
    // Clear error log on route changes
    this.routeArgs$.pipe(takeUntil(this.destroyed$)).subscribe(() => this.clear());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Report one or more error messages to the {MessagesComponent}. This will clear out previous messages.
   * param {Message | Message[]} messages
   */
  report(messages: Message | Message[]) {
    this.errors$.next([
      ...this.errors$.getValue(),
      ...(Array.isArray(messages) ? messages : [messages]),
    ]);
  }

  /**
   * Clear messages from the component.
   */
  clear() {
    this.errors$.next([]);
  }

  /**
   * Adds error handling logic to a given observable. This should be used in conjunction with
   * the observable.let(...) method to ensure that errors thrown by the observable get propagated
   * up to the user. Example:
   * this.data$ = this.apollo
   *   .watchQuery(...)
   *   .map(...)
   *   .share()
   *   .let(this.messages.handleFetchErrors);
   *
   * param {Observable<any>} observable An observable.
   * return {Observable<any | any>} An observable with the error handling logic.
   */
  handleFetchErrors(observable: Observable<any>) {
    return observable.pipe(
      catchError((err, caught) => {
        this.log.error(`Error on load`, caught);
        this.reportErrors(err);
        return EMPTY;
      })
    );
  }

  /**
   * Wraps the passed promise or observable such that any errors that are thrown
   * will get reported to the {MessagesComponent} instance.
   * param {Promise<any> | Observable<any>} promise The promise or observable to wrap.
   * return {Promise<void>} A promise for when the inner promise/observable is completed.
   */
  async handleErrors(promise: Promise<any> | Observable<any>): Promise<void> {
    try {
      this.clear();
      this.log.trace(`Handling errors in promise or observable`, promise);
      await Promise.resolve(
        promise instanceof Observable ? promise.pipe(take(1)).toPromise() : promise
      );
    } catch (err) {
      this.reportErrors(err);
    }
  }

  /**
   * Report errors from the passed error object. This can be a standard {Error} or
   * something with more information like an error response from GraphQL. If this
   * is a GraphQL error response, then errors will be bubbled up to the end-user.
   * Otherwise, a generic error message will be shown.
   * param error The error(s) to report.
   */
  reportErrors(error: any) {
    // Errors returned from graphql in graphql-specific format
    // should be bubbled up to the banner
    if (error && error.graphQLErrors) {
      const messages = this.extractGraphqlMessages(error.graphQLErrors);

      if (messages.length > 0) {
        this.report(messages);
        this.log.error(`Errors returned from GraphQL`, messages);
        return;
      }

      this.logSyntaxErrors(error.graphQLErrors);
      this.report([{ type: 'error', message: 'Generic.Error' }]);
      return;
    }

    // Otherwise, error comes from another source, just return a generic error
    this.report([{ type: 'error', message: typeof error === 'string' ? error : 'Generic.Error' }]);
    this.log.error(`Server reported an unhandled error`, error);
  }

  private extractGraphqlMessages(graphqlResponse: GraphQLErrorResponse[]): Message[] {
    return graphqlResponse
      .reduce((agg, response) => [...agg, ...response.messages], [])
      .map(msg => <Message>{ type: 'error', message: msg.message || '' });
  }

  private logSyntaxErrors(graphqlResponse: GraphQLErrorResponse[]) {
    graphqlResponse
      .filter(resp => !!resp.syntaxError)
      .map(resp => resp.syntaxError)
      .forEach((syntaxError, index) => this.log.error(`Syntax error ${index + 1}: ${syntaxError}`));
  }
}
