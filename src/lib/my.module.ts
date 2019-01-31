import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LoggerModule } from './logging/logger.module';
// export * from './logging/logger.module';

import { MessagesModule } from './messages/messages.module';
// export * from './messages/messages.module';



@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LoggerModule,
    MessagesModule,
    MaterialModule
  ],
  declarations: [],
  exports: [MessagesModule, LoggerModule],
  providers: [CurrencyPipe],
})
export class IgniteDesignSystemModule { }
