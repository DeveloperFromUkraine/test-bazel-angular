import { NgModule } from '@angular/core';
import {
  MatMenuModule,
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatRippleModule,
  MatProgressSpinnerModule,
  MatNativeDateModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatTooltipModule,
  MatSidenavModule
} from '@angular/material';

const matModules = [
  MatMenuModule,
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatRippleModule,
  MatProgressSpinnerModule,
  MatNativeDateModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatTooltipModule,
  MatSidenavModule
];

@NgModule({
  imports: matModules,
  exports: matModules,
  declarations: [],
  providers: []
})
export class MaterialModule { }
