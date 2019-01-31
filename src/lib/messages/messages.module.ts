import { NgModule } from '@angular/core';
import { MessagesComponent } from './messages.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    MessagesComponent
  ],
  declarations: [
    MessagesComponent
  ]
})
export class MessagesModule {

}
