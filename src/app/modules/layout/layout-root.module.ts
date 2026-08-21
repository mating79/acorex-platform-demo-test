import {
  AXPCommonModule,
  AXP_MENU_PROVIDER,
} from '@acorex-platform/framework-client/common';
import { AXP_WIDGET_DEFINITION_PROVIDER, AXPWidgetCoreModule } from '@acorex-platform/framework-client/layout/widget-core';
import { AXPEntityModule, AXP_ENTITY_DEFINITION_LOADER } from '@acorex-platform/framework-client/layout/entity';
import { AXPDefaultThemeModule } from '@acorex-platform/framework-client/themes/default';
import { AXP_THEME_PALETTE_PROVIDER } from '@acorex-platform/framework-client/themes/shared';
import { NgModule } from '@angular/core';
//import { AXPRootEntityLoader } from './entity.loader';
import { AXMRootModuleMenuProvider } from './menu.provider';
import { AXPLayoutRootWidgetsProvider } from './widget-definition.provider';
@NgModule({
  imports: [
    AXPDefaultThemeModule,
    AXPCommonModule,
    AXPEntityModule,
    AXPWidgetCoreModule,
  ],
  exports: [AXPDefaultThemeModule],
  providers: [
    { provide: AXP_WIDGET_DEFINITION_PROVIDER, useClass: AXPLayoutRootWidgetsProvider, multi: true },
    {
      provide: AXP_MENU_PROVIDER,
      useClass: AXMRootModuleMenuProvider,
      multi: true,
    },
    // {
    //   provide: AXP_ENTITY_DEFINITION_LOADER,
    //   useClass: AXPRootEntityLoader,
    //   multi: true,
    // },
    {
      provide: AXP_THEME_PALETTE_PROVIDER,
      useFactory: async () => {
        const provider = await import('./theme-palette.provider');
        return new provider.AXPRootThemePaletteProvider();
      },
    },
  ],
})
export class AXPLayoutRootModule { }
