import { AXPFeature, AXPFeatureLoader, AXPSessionContext } from '@acorex-platform/framework-client/auth';
import { AXPModuleManifestRegistry } from '@acorex-platform/framework-client/core';
import { inject, Injectable } from '@angular/core';
import { AXPAccessPolicyService } from './access-policy.service';
import { resolveFeaturesFromModulesAndFeatures } from './feature-policy.util';

/**
 * Loads enabled module/feature flags from the session access-policy API,
 * expanded with client module manifests (dependencies + feature definitions).
 */
@Injectable()
export class AXMOidcFeatureLoader implements AXPFeatureLoader {
  private readonly accessPolicy = inject(AXPAccessPolicyService);
  private readonly manifestRegistry = inject(AXPModuleManifestRegistry);

  async getList(context: AXPSessionContext): Promise<AXPFeature[]> {
    const modulesAndFeatures = await this.accessPolicy.getModulesAndFeatures(context);
    return resolveFeaturesFromModulesAndFeatures(modulesAndFeatures, this.manifestRegistry);
  }
}
