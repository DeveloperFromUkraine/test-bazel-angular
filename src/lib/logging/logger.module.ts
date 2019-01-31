import { NgModule } from '@angular/core';
import { Logger, LOGGER_NAMESPACE } from './logger.service';

@NgModule({
  providers: [
    Logger,
    {
      provide: LOGGER_NAMESPACE,
      useValue: 'DEFAULT',
    },
  ],
})
export class LoggerModule {}
