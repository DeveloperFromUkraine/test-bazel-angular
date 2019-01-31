import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, EMPTY, Observable, BehaviorSubject, Subject } from 'rxjs';
import { Logger } from '../logging/logger.service';
import { ActivatedRoute } from '@angular/router';
import { GraphQLErrorResponse } from './types/graphql-error';
import { catchError, map, take, takeUntil } from 'rxjs/operators';

export interface Message {
  type: 'error' | 'info' | 'warning';
  message: string;
}

@Component({
  selector: 'app-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./messages.component.scss'],
  template: `
      <button class="dismiss-button" type="button" mat-icon-button (click)="clear()">&times;</button>
      <ul class="message-list">
        <li class="message" *ngFor="let error of errors$ | async">
          <!--{{error.message | uppercase}}-->
        </li>
      </ul>
  `,
  providers: [Logger],
})
export class MessagesComponent implements OnInit, OnDestroy {
  private readonly log: Logger;
  private destroyed$ = new Subject();
  private routeArgs$: Observable<any>;

  readonly errors$ = new BehaviorSubject<Message[]>([]);

  readonly hasErrors$: Observable<boolean>;

  constructor(logger: Logger, route: ActivatedRoute) {
    this.log = logger.named('MESSAGES');
    this.hasErrors$ = this.errors$.pipe(map(errors => errors && errors.length > 0));
    this.routeArgs$ = combineLatest(route.params, route.queryParams);
    this.handleFetchErrors = this.handleFetchErrors.bind(this);
  }

  ngOnInit(): void {
    this.routeArgs$.pipe(takeUntil(this.destroyed$)).subscribe(() => this.clear());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }


  report(messages: Message | Message[]) {
    this.errors$.next([
      ...this.errors$.getValue(),
      ...(Array.isArray(messages) ? messages : [messages]),
    ]);
  }

  clear() {
    this.errors$.next([]);
  }

  handleFetchErrors(observable: Observable<any>) {
    return observable.pipe(
      catchError((err, caught) => {
        this.log.error(`Error on load`, caught);
        this.reportErrors(err);
        return EMPTY;
      })
    );
  }


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

  reportErrors(error: any) {
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
