//#region ----   Imports   ----

import { AXPWidgetsList } from '@acorex-platform/framework-shared/core';
import { AXPWidgetDefinitionProvider, AXP_WIDGETS_EDITOR_CATEGORY } from '@acorex-platform/framework-client/layout/widget-core';
import { AXPExtendedWidget, AXPWidgetGroupEnum } from '@acorex-platform/framework-shared/widget-core';
import { Injectable } from '@angular/core';

//#endregion

//#region ----   Layout Root Widgets Provider   ----

const EXTENDED_WIDGETS: AXPExtendedWidget[] = [
  {
    parentName: AXPWidgetsList.Editors.CheckBox,
    widget: {
      name: 'disabled' as any,
      title: 'Disabled',
      categories: AXP_WIDGETS_EDITOR_CATEGORY,
      groups: [AXPWidgetGroupEnum.EntityWidget],
      type: 'editor',
      components: {},
      options: {
        negative: true,
        trulyText: 'Disabled',
        falsyText: 'Active',
      },
    },
  },
];

@Injectable()
export class AXPLayoutRootWidgetsProvider implements AXPWidgetDefinitionProvider {
  getWidgets() {
    return [];
  }

  getExtendedWidgets() {
    return EXTENDED_WIDGETS;
  }
}

//#endregion
