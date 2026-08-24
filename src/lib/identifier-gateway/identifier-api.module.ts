import {
  AXP_DEFAULT_TOKEN_PROVIDERS,
  AXP_IDENTIFIER_SERVICE,
} from '@acorex-platform/module-identifier-management-client';
import { NgModule } from '@angular/core';
import { AXCLocalIdentifierService } from './local-identifier.service';

/**
 * Demo wiring for {@link AXP_IDENTIFIER_SERVICE}.
 * The platform module registers expression scopes but expects the host app to provide the service port.
 */
@NgModule({
  providers: [
    ...AXP_DEFAULT_TOKEN_PROVIDERS,
    {
      provide: AXP_IDENTIFIER_SERVICE,
      useExisting: AXCLocalIdentifierService,
    },
  ],
})
export class AXCIdentifierApiModule {}
