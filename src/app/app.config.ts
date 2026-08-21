import { AXCApiHttpModule, AXCRuntimeRemoteApiModule } from '@acorex-platform/client-connectivity-api';
import { AXECodeReviewExtensionModule } from '@acorex-platform/extension-ai-code-review-client';
import { AXEAIConversationExtensionModule } from '@acorex-platform/extension-ai-conversation-client';
import { AXEAiOtelExtensionModule } from '@acorex-platform/extension-ai-otel-client';
import { AXEAIDocumentExtensionModule } from '@acorex-platform/extension-ai-document-client';
import { AXEAiVoiceShellExtensionModule } from '@acorex-platform/extension-ai-voice-shell-client';
import { AXEBambooHRExtensionModule } from '@acorex-platform/extension-bamboohr-client';
import { AXEGithubExtensionModule } from '@acorex-platform/extension-github-client';
import { AXEGitLabExtensionModule } from '@acorex-platform/extension-gitlab-client';
import { AXEGoogleExtensionModule } from '@acorex-platform/extension-google-client';
import { AXEMicrosoftExtensionModule } from '@acorex-platform/extension-microsoft-client';
import { AXEPMExtensionModule } from '@acorex-platform/extension-project-management-core-client';
import { AXEFergusExtensionModule } from '@acorex-platform/extension-project-management-fergus-client';
import { AXEJiraExtensionModule } from '@acorex-platform/extension-project-management-jira-client';
import { AXEServiceM8ExtensionModule } from '@acorex-platform/extension-project-management-servicem8-client';
import { AXESimproExtensionModule } from '@acorex-platform/extension-project-management-simpro-client';
import { AXESourceControlExtensionModule } from '@acorex-platform/extension-source-control-core-client';
import { AXESSOExtensionModule } from '@acorex-platform/extension-sso-client';
import { AXEWeatherExtensionModule } from '@acorex-platform/extension-weather-core-client';
import { AXERtcExtensionModule } from '@acorex-platform/extension-rtc-core-client';
import { AXELiveKitExtensionModule } from '@acorex-platform/extension-rtc-livekit-client';
import { AXEOpenWeatherMapExtensionModule } from '@acorex-platform/extension-weather-openweathermap-client';
import { AXEWeatherApiExtensionModule } from '@acorex-platform/extension-weather-weatherapi-client';
import { AXPAuthModule } from '@acorex-platform/framework-client/auth';
import { configureRegionalFontStylesheets } from '@acorex-platform/framework-client/themes/shared';
import { AXPFileStorageService, AXPHomePageModule, AXPNotFoundCatchAllRoute, AXP_APP_VERSION_PROVIDER, AXP_PLATFORM_CONFIG_TOKEN, AXP_ROOT_CONFIG_TOKEN, configPlatform, provideDynamicHomePage } from '@acorex-platform/framework-client/common';
import { AXPAppStartUpProvider, AXPDefaultColorPalettesProvider, AXP_APP_STARTUP_PRIORITY, AXP_COLOR_PALETTE_PROVIDER, provideAppStartUpTask } from '@acorex-platform/framework-client/core';
import { provideRealtime } from '@acorex-platform/framework-client/realtime';
import { AXMAiManagementModule } from '@acorex-platform/module-ai-management-client';
import { configureOrgChartMergedBusinessUnitId } from '@acorex-platform/module-organization-management-client/contracts';
import { AXCFileStorageApiService } from './file-storage-api.service';
import { AXM_CORPORATE_BUSINESS_UNIT_ID } from './org-chart-merged-business-unit.id';
// import { AXMAppBuilderModule } from '@acorex-platform/module-app-builder-client';
import { AXECommunicationHcmExtensionModule } from '@acorex-platform/extension-communication-hcm-client';
import { AXECommunicationMetaExtensionModule } from '@acorex-platform/extension-communication-meta-client';
import { AXECommunicationTelegramExtensionModule } from '@acorex-platform/extension-communication-telegram-client';
import { AXEHealthHumanCapitalManagementExtensionModule } from '@acorex-platform/extension-health-human-capital-management-client';
import { AXMApplicationManagementModule } from '@acorex-platform/module-application-management-client';
import { AXMAssessmentManagementModule } from '@acorex-platform/module-assessment-management-client';
import { AXMAssetManagementModule } from '@acorex-platform/module-asset-management-client';
import { AXMBackgroundJobManagementModule } from '@acorex-platform/module-background-job-management-client';
import { AXMBulletinManagementModule } from '@acorex-platform/module-bulletin-management-client';
import { AXMBusinessCoreModule } from '@acorex-platform/module-business-core-client';
import { AXMCalendarManagementModule } from '@acorex-platform/module-calendar-management-client';
import { AXMCommonModule, AXPGlobalSearchModule } from '@acorex-platform/module-common-client';
import { AXMCommunicationManagementModule } from '@acorex-platform/module-communication-management-client';
import { AXMContentManagementModule } from '@acorex-platform/module-content-management-client';
import { AXMConversationModule } from '@acorex-platform/module-conversation-client';
import { AXMCustomerManagementModule } from '@acorex-platform/module-customer-management-client';
import { AXMDashboardManagementModule } from '@acorex-platform/module-dashboard-management-client';
import { AXMDataManagementModule } from '@acorex-platform/module-data-management-client';
import { AXMDocumentManagementModule } from '@acorex-platform/module-document-management-client';
import { AXMFinancialCoreModule } from '@acorex-platform/module-financial-core-client';
import { AXMFormTemplateManagementModule } from '@acorex-platform/module-form-template-management-client';
import { AXMHealthCoreModule } from '@acorex-platform/module-health-core-client';
import { AXMHumanCapitalManagementModule } from '@acorex-platform/module-human-capital-management-client';
import { AXMIdentifierManagementModule } from '@acorex-platform/module-identifier-management-client';
import { AXMIntegrationManagementModule } from '@acorex-platform/module-integration-management-client';
import { AXMLearningManagementModule } from '@acorex-platform/module-learning-management-client';
import { AXMLocaleManagementModule } from '@acorex-platform/module-locale-management-client';
import { configureLocaleProfileCatalogCodes } from '@acorex-platform/module-locale-management-client/contracts';
import { AXMLocationManagementModule } from '@acorex-platform/module-location-management-client';
import { AXMMaintenanceManagementModule } from '@acorex-platform/module-maintenance-management-client';
import { AXMMeasurementCoreModule } from '@acorex-platform/module-measurement-core-client';
import { AXMMeetingManagementModule } from '@acorex-platform/module-meeting-management-client';
import { AXMOrderManagementModule } from '@acorex-platform/module-order-management-client';
import { AXMOrganizationManagementModule } from '@acorex-platform/module-organization-management-client';
import { AXMPersonCoreModule } from '@acorex-platform/module-person-core-client';
import { AXMPlatformDevToolsModule } from '@acorex-platform/module-platform-dev-tools-client';
import { AXMPlatformManagementModule } from '@acorex-platform/module-platform-management-client';
import { AXMProcurementManagementModule } from '@acorex-platform/module-procurement-management-client';
import { AXMProductCatalogModule } from '@acorex-platform/module-product-catalog-client';
import { AXMProjectManagementModule } from '@acorex-platform/module-project-management-client';
import { AXMReportManagementModule } from '@acorex-platform/module-report-management-client';
import { AXMReservationManagementModule } from '@acorex-platform/module-reservation-management-client';
import { AXMRiskManagementModule } from '@acorex-platform/module-risk-management-client';
import { AXMRuleEngineManagementModule } from '@acorex-platform/module-rule-engine-management-client';
import { AXMSecurityManagementModule } from '@acorex-platform/module-security-management-client';
import { AXMSettingsManagementModule } from '@acorex-platform/module-settings-management-client';
import { AXMSubscriptionManagementModule } from '@acorex-platform/module-subscription-management-client';
import { AXMSupplierManagementModule } from '@acorex-platform/module-supplier-management-client';
import { AXMSystemInsightModule } from '@acorex-platform/module-system-insight-client';
import { AXMTaskManagementModule } from '@acorex-platform/module-task-management-client';
import { AXMTenantManagementModule } from '@acorex-platform/module-tenant-management-client';
import { AXMWorkflowManagementModule } from '@acorex-platform/module-workflow-management-client';
import { AXMWorkplaceSafetyManagementModule } from '@acorex-platform/module-workplacesafety-management-client';
import { AX_DATETIME_INPUT_CONFIG } from '@acorex/components/datetime-input';
import { AXDialogModule } from '@acorex/components/dialog';
import { AXLoadingDialogModule } from '@acorex/components/loading-dialog';
import { AXFormatModule } from '@acorex/core/format';
import { AXValidationModule } from '@acorex/core/validation';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation } from '@angular/router';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';
import { BasicInterceptor } from './basic-interceptor.interceptor';
import { DemoAuthRootModule } from './modules/auth/auth-root.module';
import { DEMOAppVersionProvider } from './modules/common/app-version.provider';
import { DEMO_ENTITY_LOGO_FALLBACK_RESOLVER_PROVIDER } from './modules/common/demo-entity-logo-fallback.resolver';
import { DEMO_PLATFORM_LOGO_PROVIDER } from './modules/common/demo-platform-logo.provider';
import { DEMO_PLATFORM_SETTINGS_DEFAULTS_PROVIDER_TOKEN } from './modules/common/demo-platform-settings-defaults.provider';
import { AXPTranslationRootModule } from './modules/common/translation-root.module';
import { DEMORootModule } from './modules/demo/demo-root.module';
import { AXPLayoutRootModule } from './modules/layout/layout-root.module';

configureRegionalFontStylesheets({
  inter: '/assets/fonts/en/inter/style.css',
  'open-sans': '/assets/fonts/en/open-sans/style.css',
  roboto: '/assets/fonts/en/roboto/style.css',
  rubik: '/assets/fonts/en/rubik/style.css',
  'google-sans': '/assets/fonts/en/google-sans/style.css',
  vazirmatn: '/assets/fonts/fa/vazir/style.css',
  dana: '/assets/fonts/fa/dana/style.css',
  iranyekanx: '/assets/fonts/fa/iran-yekan-x/style.css',
  peyda: '/assets/fonts/fa/peyda/style.css',
  cairo: '/assets/fonts/ar/cairo/style.css',
  kufam: '/assets/fonts/ar/kufam/style.css',
  'noto-kufi-arabic': '/assets/fonts/ar/nato-kufi-arabic/style.css',
  'playpen-sans-arabic': '/assets/fonts/ar/playpen-sans-arabic/style.css',
});
// AU nest env may restrict the Available Languages picker (omit fa-IR).
const localeProfileCatalogCodes = environment.localeProfileCatalogCodes;
if (localeProfileCatalogCodes?.length) {
  configureLocaleProfileCatalogCodes(localeProfileCatalogCodes);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation(), withComponentInputBinding()),
    //
    { provide: HTTP_INTERCEPTORS, useClass: BasicInterceptor, multi: true },
    // Sole APP_INITIALIZER — feature boot work registers via AXPAppStartUpService / provideAppStartUpTask.
    AXPAppStartUpProvider,
    provideAppStartUpTask(() => ({
      name: 'org-chart-merged-business-unit-id',
      priority: AXP_APP_STARTUP_PRIORITY.moduleManifests,
      run: async () => {
        configureOrgChartMergedBusinessUnitId(AXM_CORPORATE_BUSINESS_UNIT_ID);
      },
    })),
    {
      provide: AXP_COLOR_PALETTE_PROVIDER,
      useClass: AXPDefaultColorPalettesProvider,
      multi: true,
    },
    {
      provide: AXP_ROOT_CONFIG_TOKEN,
      useValue: {
        baseUrl: environment.baseUrl,
      },
    },
    {
      provide: AXP_PLATFORM_CONFIG_TOKEN,
      useValue: configPlatform({
        title: 'Demo',
        copyright: '© 2026',
      }),
    },
    DEMO_PLATFORM_LOGO_PROVIDER,
    DEMO_ENTITY_LOGO_FALLBACK_RESOLVER_PROVIDER,
    DEMO_PLATFORM_SETTINGS_DEFAULTS_PROVIDER_TOKEN,
    {
      provide: AXP_APP_VERSION_PROVIDER,
      useClass: DEMOAppVersionProvider,
    },
    {
      provide: AX_DATETIME_INPUT_CONFIG,
      useValue: { allowTyping: true },
    },
    {
      provide: AXPFileStorageService,
      useClass: AXCFileStorageApiService,
    },
    provideDynamicHomePage(),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      //
      AXDialogModule,
      AXLoadingDialogModule,
      AXFormatModule.forRoot(),
      AXValidationModule.forRoot(),
      //
      //
      AXPHomePageModule,
      AXMCommonModule,
      AXMIntegrationManagementModule,
      AXMSettingsManagementModule,
      AXMDashboardManagementModule,
      AXMFormTemplateManagementModule,

      AXMSecurityManagementModule,
      AXMOrganizationManagementModule,
      AXMHumanCapitalManagementModule,
      AXMSystemInsightModule,
      //AXMActivityInsightModule,
      AXMPlatformDevToolsModule,

      // Document Management Module
      AXMDocumentManagementModule,

      //
      AXMProjectManagementModule,
      AXMLearningManagementModule,
      AXMWorkflowManagementModule,
      AXMBackgroundJobManagementModule,
      AXMRuleEngineManagementModule,
      AXMContentManagementModule,
      // AXMAppBuilderModule,
      AXMCommunicationManagementModule,
      AXECommunicationTelegramExtensionModule,
      AXECommunicationMetaExtensionModule,
      AXECommunicationHcmExtensionModule,
      AXMAiManagementModule,
      AXMConversationModule,
      AXEAIConversationExtensionModule,
      AXEAiOtelExtensionModule,
      AXEAIDocumentExtensionModule,
      AXEAiVoiceShellExtensionModule,
      AXMDataManagementModule,
      AXMPlatformManagementModule,
      AXMAssetManagementModule,
      AXMMaintenanceManagementModule,
      AXMRiskManagementModule,
      AXMWorkplaceSafetyManagementModule,
      AXMReservationManagementModule,
      AXMReportManagementModule,
      AXMCalendarManagementModule,
      AXMLocaleManagementModule,
      AXMMeetingManagementModule,
      AXMTaskManagementModule,
      AXMLearningManagementModule,
      AXMApplicationManagementModule,
      AXMTenantManagementModule,
      AXMAssessmentManagementModule,
      AXMFinancialCoreModule,
      AXMBusinessCoreModule,
      AXMBulletinManagementModule,
      AXMLocationManagementModule,
      AXMPersonCoreModule,
      AXMHealthCoreModule,
      AXEHealthHumanCapitalManagementExtensionModule,
      AXMMeasurementCoreModule,
      AXMProductCatalogModule,
      //
      AXMIdentifierManagementModule,
      //
      AXPTranslationRootModule,
      AXPGlobalSearchModule,
      AXPLayoutRootModule,
      AXMCustomerManagementModule,
      AXMSupplierManagementModule,
      AXMProcurementManagementModule,
      AXMOrderManagementModule,
      AXMSubscriptionManagementModule,
      // Extension Modules
      AXEPMExtensionModule,
      AXEJiraExtensionModule,
      AXESimproExtensionModule,
      AXEServiceM8ExtensionModule,
      AXEFergusExtensionModule,
      AXEBambooHRExtensionModule,
      AXEWeatherExtensionModule,
      AXERtcExtensionModule,
      AXELiveKitExtensionModule,
      AXEWeatherApiExtensionModule,
      AXEOpenWeatherMapExtensionModule,
      AXEGoogleExtensionModule,
      AXEGithubExtensionModule,
      AXEGitLabExtensionModule,
      AXESourceControlExtensionModule,
      AXECodeReviewExtensionModule,
      AXEMicrosoftExtensionModule,
      AXESSOExtensionModule,
      //
      AXCApiHttpModule,
      AXCRuntimeRemoteApiModule,
      DemoAuthRootModule,
      AXPAuthModule.forRoot(),
      //
      DEMORootModule,
    ),
    // Realtime connect runs via appStart (after handler tasks by priority).
    provideRealtime({ apiBaseUrl: environment.baseUrl }),
    // Must stay last so platform catch-all does not shadow custom app routes.
    AXPNotFoundCatchAllRoute(),
  ],
};
