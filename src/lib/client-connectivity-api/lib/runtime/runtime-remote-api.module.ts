//#region ----- Imports -----

import { NgModule } from '@angular/core';
import { provideRuntimeRemoteTransport } from './provide-runtime-remote-transport';

//#endregion

//#region ----- Module -----

/**
 * Registers the Nest runtime CQRS hooks used when a query/command is not in
 * {@code provideQuerySetups} / {@code provideCommandSetups}.
 *
 * Requires {@link AXP_ROOT_CONFIG_TOKEN} (`baseUrl`, typically `/api`) and Angular
 * {@code HttpClient}.
 */
@NgModule({
  providers: provideRuntimeRemoteTransport(),
})
export class AXCRuntimeRemoteApiModule {}

//#endregion
