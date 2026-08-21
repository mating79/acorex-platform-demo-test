// import { AXMLogCaptureService } from '@acorex-platform/module-help-desk-client';
import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [provideZoneChangeDetection(), ...appConfig.providers],
}).catch((err) => console.error(err));

// TODO: uncomment when libs/modules/help-desk is added
// bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]})
//   .then((appRef: ApplicationRef) => {
//     const injector = appRef.injector;
//     if (!isDevMode()) {
//       const logCaptureService = injector.get(AXMLogCaptureService);
//       (function patchConsole() { ... })();
//     }
//   })
//   .catch((err) => console.error(err));
