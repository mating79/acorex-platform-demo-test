import { AXPWidgetsList } from '@acorex-platform/framework-shared/core';
import type { AXPPropertyViewerTab } from '@acorex-platform/framework-client/layout/components';
import { type AXPWidgetProperty, type AXPWidgetPropertyGroup } from '@acorex-platform/framework-shared/widget-core';
const GROUP_DETAILS: AXPWidgetPropertyGroup = {
  name: 'group-details',
  title: '@general:terms.common.information',
  order: 0,
};

const SECTION_PROPS: AXPWidgetProperty[] = [
  {
    name: 'title',
    title: '@general:terms.common.title',
    group: GROUP_DETAILS,
    order: 0,
    schema: {
      dataType: 'string',
      defaultValue: '',
      interface: { name: 'title', path: 'title', type: AXPWidgetsList.Editors.TextBox },
    },
    validations: [{ rule: 'required' }],
    visible: true,
  },
  {
    name: 'name',
    title: '@general:terms.common.name',
    group: GROUP_DETAILS,
    order: 1,
    schema: {
      dataType: 'string',
      defaultValue: '',
      interface: {
        name: 'name',
        path: 'name',
        type: AXPWidgetsList.Editors.TextBox,
        options: {
          placeholder:
            '@data-management:metadata-definitions.components.meta-data-selector.dialogs.group-name-placeholder',
        },
      },
    },
    validations: [{ rule: 'required' }, { rule: 'variable-name' }],
    visible: true,
  },
  {
    name: 'description',
    title: '@general:terms.common.description',
    group: GROUP_DETAILS,
    order: 2,
    schema: {
      dataType: 'string',
      defaultValue: '',
      interface: { name: 'description', path: 'description', type: AXPWidgetsList.Editors.LargeTextBox },
    },
    visible: true,
  },
];

/** Same fields as meta-data “add/edit group” dialogs, for {@link AXPPropertyViewerService}. */
export const DEMO_META_SECTION_EDIT_TABS: AXPPropertyViewerTab[] = [
  {
    name: 'general',
    title: '@general:terms.common.information',
    groups: [
      {
        name: GROUP_DETAILS.name,
        title: GROUP_DETAILS.title,
        isCollapsed: false,
        props: SECTION_PROPS,
      },
    ],
  },
];
