import {
  AXP_LOGO_PROVIDER,
  AXP_PLATFORM_LOGO_KEY,
  type AXPLogoAppearance,
  type AXPLogoFormat,
  type AXPLogoProvider,
  type AXPLogoRequest,
  type AXPLogoView,
} from '@acorex-platform/framework-client/core';

//#region ---- Demo platform logo assets (Safetyminder brand SVGs) ----

const PLATFORM_BRAND_BASE = 'assets/images/brand/platform';

const DEMO_PLATFORM_LOGO_ASSETS: Record<
  Exclude<AXPLogoFormat, 'mark'>,
  { light: string; dark: string }
> = {
  icon: {
    light: `${PLATFORM_BRAND_BASE}/platform-icon-light.svg`,
    dark: `${PLATFORM_BRAND_BASE}/platform-icon-dark.svg`,
  },
  text: {
    light: `${PLATFORM_BRAND_BASE}/platform-text-light.svg`,
    dark: `${PLATFORM_BRAND_BASE}/platform-text-dark.svg`,
  },
  full: {
    light: `${PLATFORM_BRAND_BASE}/platform-full-light.svg`,
    dark: `${PLATFORM_BRAND_BASE}/platform-full-dark.svg`,
  },
};

/** Intrinsic aspect ratios (width / height) for platform SVG assets. */
const DEMO_PLATFORM_LOGO_ASPECT: Record<Exclude<AXPLogoFormat, 'mark'>, number> = {
  icon: 1,
  text: 165 / 34,
  full: 221 / 34,
};

function resolveFormat(format: AXPLogoFormat | undefined): Exclude<AXPLogoFormat, 'mark'> {
  return format === 'mark' || !format ? 'full' : format;
}

function pickPlatformAsset(format: AXPLogoFormat | undefined, appearance: AXPLogoAppearance): string {
  const resolvedFormat = resolveFormat(format);
  const assets = DEMO_PLATFORM_LOGO_ASSETS[resolvedFormat];

  // *-dark = light artwork for dark/colored surfaces; *-light = artwork for light surfaces
  const useLightArtwork =
    appearance === 'dark' || appearance === 'onDark' || appearance === 'monochrome';

  return useLightArtwork ? assets.dark : assets.light;
}

/** `size` is the target width; height follows the asset aspect ratio. */
function dimensionsFor(format: AXPLogoFormat | undefined, size: number): { width: number; height: number } {
  const aspect = DEMO_PLATFORM_LOGO_ASPECT[resolveFormat(format)];
  return {
    width: size,
    height: Math.max(1, Math.round(size / aspect)),
  };
}

export const demoPlatformLogoProvider: AXPLogoProvider = {
  key: AXP_PLATFORM_LOGO_KEY,
  resolve: async (request: AXPLogoRequest): Promise<AXPLogoView> => {
    const { width, height } = dimensionsFor(request.format, request.size);
    return {
      kind: 'image',
      src: pickPlatformAsset(request.format, request.appearance),
      width,
      height,
    };
  },
};

export const DEMO_PLATFORM_LOGO_PROVIDER = {
  provide: AXP_LOGO_PROVIDER,
  useValue: demoPlatformLogoProvider,
  multi: true,
} as const;

//#endregion
