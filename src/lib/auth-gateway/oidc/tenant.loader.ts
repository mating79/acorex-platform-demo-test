import { AXPTenant, AXPTenantLoader, AXPSessionContext } from '@acorex-platform/framework-client/auth';
import { axpExtractLogoUrl } from '@acorex-platform/framework-client/core';
import { AXPQueryService } from '@acorex-platform/framework-client/runtime';
import {
  coerceUnknownToMultiLanguageString,
  resolveMultiLanguageString,
  runtimeQueryCollectionData,
} from '@acorex-platform/framework-shared/core';
import { AUTH_LIST_TENANTS_DEFAULT } from '@acorex-platform/framework-shared/runtime';
import { Injectable, inject } from '@angular/core';

@Injectable()
export class AXMOidcTenantLoader implements AXPTenantLoader {
  private readonly queryService = inject(AXPQueryService);

  async getList(_context: AXPSessionContext): Promise<AXPTenant[]> {
    const result = await this.queryService.fetch<void, unknown>(
      AUTH_LIST_TENANTS_DEFAULT,
      undefined as void,
    );
    const items = runtimeQueryCollectionData(result)?.items ?? [];
    return items.map((item) => this.mapToAXPTenant(item));
  }

  async set(_tenant: AXPTenant): Promise<void> {
    return Promise.resolve();
  }

  private mapToAXPTenant(item: unknown): AXPTenant {
    const row = item as Record<string, unknown>;
    const title = coerceUnknownToMultiLanguageString(row['title']) || 'defaultTitle';
    const nameSource =
      typeof row['name'] === 'string' && row['name'].trim()
        ? row['name']
        : resolveMultiLanguageString(title, 'en-US') || 'default-name';

    return {
      id: String(row['id'] ?? ''),
      name: String(nameSource).toLowerCase().replace(/\s+/g, '-'),
      title,
      logo: axpExtractLogoUrl(row['logo']),
    };
  }
}
