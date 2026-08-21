//#region ----- Imports -----

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AXCApiHttpRetryInterceptor } from './api-http-retry.interceptor';

//#endregion

//#region ----- Module -----

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AXCApiHttpRetryInterceptor,
      multi: true,
    },
  ],
})
export class AXCApiHttpModule {}

//#endregion
