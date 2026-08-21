import { AXPAuthModule } from '@acorex-platform/framework-client/auth';
import { AXMAuthModule, AXM_AUTH_CONFIG_TOKEN, configAuthModule } from '@acorex-platform/module-auth-client';
import { NgModule } from '@angular/core';
import { environment } from '../../../environments/environment';

//#region ----- Demo auth root -----

/**
 * Demo auth wiring. Sign-in strategies come from {@link AXCAuthApiModule} /
 * extension modules (Google, Microsoft, SSO) — no Super Admin bypass.
 *
 * Deploy-time API base URL only. OAuth client defaults live in auth strategies.
 * Sign-in page, sign-up, credential type, and default strategy are platform (P) settings.
 */
@NgModule({
  imports: [AXMAuthModule, AXPAuthModule.forChild()],
  providers: [
    {
      provide: AXM_AUTH_CONFIG_TOKEN,
      useValue: configAuthModule({
        baseUrl: environment.baseUrl,
      }),
    },
  ],
})
export class DemoAuthRootModule {}

//#endregion
