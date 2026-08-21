import {
  AXP_ENTITY_LOGO_FALLBACK_RESOLVER,
  type AXPEntityLogoFallbackResolver,
} from '@acorex-platform/framework-client/core';
import type { Provider } from '@angular/core';

//#region ---- Demo entity logo fallback ----

const DEMO_ENTITY_LOGO_ASSET_BASE = '/assets/images/brand/entities';

/** Mirrors tenant-management mock seed logo slugs (`{slug}-mark.svg`). */
const DEMO_TENANT_LOGO_SLUGS: Record<string, string> = {
  'f0000002-0000-4000-a000-000000000001': 'acorex',
  'f0000002-0000-4000-a000-000000000002': 'safetyminder-beta',
  'f0000002-0000-4000-a000-000000000003': 'laser-plumbing',
  'f0000002-0000-4000-a000-000000000004': 'smart-co',
};

/** Mirrors application-management mock seed logo slugs (`{slug}-mark.svg`). */
const DEMO_APPLICATION_LOGO_SLUGS: Record<string, string> = {
  '00000000-0000-0000-0000-000000000004': 'platform-console',
  '00000000-0000-0000-0000-000000000005': 'safetyminder',
  '00000000-0000-0000-0000-000000000008': 'smart-desk',
};

function entityMarkUrl(slug: string): string {
  return `${DEMO_ENTITY_LOGO_ASSET_BASE}/${slug}-mark.svg`;
}

function resolveDemoEntityLogoUrl(logoKey: string): string | undefined {
  if (logoKey.startsWith('tenant:')) {
    const slug = DEMO_TENANT_LOGO_SLUGS[logoKey.slice('tenant:'.length)];
    return slug ? entityMarkUrl(slug) : undefined;
  }

  if (logoKey.startsWith('application:')) {
    const slug = DEMO_APPLICATION_LOGO_SLUGS[logoKey.slice('application:'.length)];
    return slug ? entityMarkUrl(slug) : undefined;
  }

  return undefined;
}

const demoEntityLogoFallbackResolver: AXPEntityLogoFallbackResolver = {
  resolve: resolveDemoEntityLogoUrl,
};

export const DEMO_ENTITY_LOGO_FALLBACK_RESOLVER_PROVIDER: Provider = {
  provide: AXP_ENTITY_LOGO_FALLBACK_RESOLVER,
  useValue: demoEntityLogoFallbackResolver,
};

//#endregion
