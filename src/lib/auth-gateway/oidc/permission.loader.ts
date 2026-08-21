import { AXPPermission, AXPPermissionLoader, AXPSessionContext } from '@acorex-platform/framework-client/auth';
import { Injectable, inject } from '@angular/core';
import { AXPAccessPolicyService } from './access-policy.service';

@Injectable()
export class AXMOidcPermissionLoader implements AXPPermissionLoader {
  private readonly accessPolicy = inject(AXPAccessPolicyService);

  async getList(context: AXPSessionContext): Promise<AXPPermission[]> {
    return this.accessPolicy.getPermissions(context);
  }
}
