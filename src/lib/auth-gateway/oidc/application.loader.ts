import { AXPApplication, AXPApplicationLoader, AXPSessionContext } from '@acorex-platform/framework-client/auth';
import { axpExtractLogoUrl } from '@acorex-platform/framework-client/core';
import { AXPQueryService } from '@acorex-platform/framework-client/runtime';
import {
  coerceUnknownToMultiLanguageString,
  resolveMultiLanguageString,
  runtimeQueryCollectionData,
} from '@acorex-platform/framework-shared/core';
import { AUTH_LIST_APPLICATIONS_DEFAULT } from '@acorex-platform/framework-shared/runtime';
import { Injectable, inject } from '@angular/core';

@Injectable()
export class AXMOidcApplicationLoader implements AXPApplicationLoader {
  private readonly queryService = inject(AXPQueryService);

  async getList(_context: AXPSessionContext): Promise<AXPApplication[]> {
    const result = await this.queryService.fetch<void, unknown>(
      AUTH_LIST_APPLICATIONS_DEFAULT,
      undefined as void,
    );
    const items = runtimeQueryCollectionData(result)?.items ?? [];
    return items.map((item) => this.mapToAXPApplication(item));
  }

  set(_application: AXPApplication): Promise<void> {
    return Promise.resolve();
  }

  private mapToAXPApplication(item: unknown): AXPApplication {
    const row = item as Record<string, unknown>;
    const title = coerceUnknownToMultiLanguageString(row['title']) || 'defaultTitle';
    const routeName =
      (typeof row['name'] === 'string' && row['name'].trim()
        ? row['name']
        : resolveMultiLanguageString(title, 'en-US') || 'default-name'
      )
        .toLowerCase()
        .replace(/\s+/g, '-');

    const edition = row['edition'] as Record<string, unknown> | undefined;

    return {
      id: String(row['id'] ?? ''),
      name: routeName,
      title,
      version: row['version'] != null ? String(row['version']) : '1.0.0',
      description: row['description'] != null ? coerceUnknownToMultiLanguageString(row['description']) : undefined,
      logoUrl: axpExtractLogoUrl(row['logoUrl'] ?? row['logo']),
      edition: edition
        ? {
            id: String(edition['id'] ?? ''),
            title: coerceUnknownToMultiLanguageString(edition['title']),
            description:
              edition['description'] != null
                ? coerceUnknownToMultiLanguageString(edition['description'])
                : undefined,
          }
        : undefined,
    };
  }
}
