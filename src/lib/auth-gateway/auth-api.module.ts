import {
  AXP_APPLICATION_LOADER,
  AXP_FEATURE_LOADER,
  AXP_PERMISSION_LOADER,
  AXP_TENANT_LOADER,
  AXPAuthModule,
  AXP_ACCESS_POLICY_CACHE_PORT,
  AXP_USER_AVATAR_CACHE_PORT,
} from '@acorex-platform/framework-client/auth';
import { AXP_USER_AVATAR_PROVIDER, AXPUserAvatarService } from '@acorex-platform/framework-client/layout/components';
import { NgModule } from '@angular/core';
import { AXCUserPassStrategyApi } from './user-pass-auth.strategy';
import {
  AXPAccessPolicyService,
  AXMOidcApplicationLoader,
  AXMOidcFeatureLoader,
  AXMOidcPermissionLoader,
  AXCAPIOidcStrategy,
  AXMOidcTenantLoader,
  AXCApiUserAvatarProvider,
} from './oidc';

@NgModule({
  imports: [
    AXPAuthModule.forRoot({
      strategies: [AXCUserPassStrategyApi, AXCAPIOidcStrategy],
    }),
  ],
  providers: [
    {
      provide: AXP_TENANT_LOADER,
      useClass: AXMOidcTenantLoader,
    },
    {
      provide: AXP_APPLICATION_LOADER,
      useClass: AXMOidcApplicationLoader,
    },
    {
      provide: AXP_PERMISSION_LOADER,
      useClass: AXMOidcPermissionLoader,
    },
    {
      provide: AXP_FEATURE_LOADER,
      useClass: AXMOidcFeatureLoader,
    },
    {
      provide: AXP_ACCESS_POLICY_CACHE_PORT,
      useExisting: AXPAccessPolicyService,
    },
    {
      provide: AXP_USER_AVATAR_PROVIDER,
      useClass: AXCApiUserAvatarProvider,
    },
    {
      provide: AXP_USER_AVATAR_CACHE_PORT,
      useFactory: (avatarService: AXPUserAvatarService) => ({
        refreshUserInfo: (userId: string) => avatarService.refreshUserInfo(userId),
      }),
      deps: [AXPUserAvatarService],
    },
  ],
})
export class AXCAuthApiModule {}
