//#region ----- Imports -----

import {
  AXP_SETTING_DEFAULT_VALUES_PROVIDERS,
  type AXPSettingDefaultValuesProvider,
} from '@acorex-platform/framework-client/common';
import { AXPPlatformScope, AXPRegionalSetting } from '@acorex-platform/framework-shared/core';
import { AXPCommunicationMetaSettingKeys } from '@acorex-platform/extension-communication-meta-client/contracts';
import { AXPCommunicationTelegramSettingKeys } from '@acorex-platform/extension-communication-telegram-client/contracts';
import { AXPCommunicationManagementSettingKeys } from '@acorex-platform/module-communication-management-client/contracts';
import { AXPPlatformDevToolsSettings } from '@acorex-platform/module-platform-dev-tools-client/contracts';

//#endregion

//#region ----- Demo platform setting defaults -----

/**
 * Client-side defaults for non-secret demo platform settings (debug redirects / debug mode).
 * SMTP is server-owned (`cacheable: false`) and is not mirrored into client defaults.
 */
export const DEMO_PLATFORM_SETTINGS_DEFAULTS_PROVIDER: AXPSettingDefaultValuesProvider = {
  priority: 1000,
  scope: AXPPlatformScope.Platform,
  async provide(): Promise<Record<string, unknown>> {
    return {
      [AXPCommunicationManagementSettingKeys.DebugRedirectEmailAddress]:
        'arash.oshnoudi@gmail.com, saeedhosseny1377@gmail.com',
      [AXPCommunicationTelegramSettingKeys.DebugRedirectChatId]: '77677492',
      [AXPCommunicationMetaSettingKeys.DebugRedirectPhoneNumber]: '+989132041267',
      [AXPPlatformDevToolsSettings.DebugMode]: true,
      [AXPRegionalSetting.AvailableLanguages]: ['en-US', 'fa-IR'],
    };
  },
};

/**
 * Overrides the root empty-array factory for this token (not a multi provider).
 * App-layer demo defaults win over module definition blanks in the aggregator.
 */
export const DEMO_PLATFORM_SETTINGS_DEFAULTS_PROVIDER_TOKEN = {
  provide: AXP_SETTING_DEFAULT_VALUES_PROVIDERS,
  useValue: [DEMO_PLATFORM_SETTINGS_DEFAULTS_PROVIDER],
};

//#endregion
