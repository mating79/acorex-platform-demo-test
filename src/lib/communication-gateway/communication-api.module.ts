import { AXPCommunicationManagementClient } from '@acorex-platform/module-communication-management-client';
import { NgModule } from '@angular/core';
import { AXCCommunicationApiClient } from './communication-api.client';

/**
 * Demo wiring for {@link AXPCommunicationManagementClient}.
 * In-app inbox port/connector depend on this token; use server runtime commands directly
 * (not client command handlers that re-inject the client).
 */
@NgModule({
  providers: [
    {
      provide: AXPCommunicationManagementClient,
      useExisting: AXCCommunicationApiClient,
    },
  ],
})
export class AXCCommunicationApiModule {}
