import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const permissionListSchema: AXPPropertyDefinition = {
    name: 'permission-list',
    title: 'Permission List',
    interface: {
        name: AXPWidgetsList.Editors.SelectionList,
        title: 'Permission List',
        options: {
            view: { valueField: 'id', textField: 'name', searchEnabled: true, allowCustomValues: false, dataSource: [], readonly: true },
            edit: { valueField: 'id', textField: 'name', searchEnabled: true, allowCustomValues: false, dataSource: [] },
            column: { readonly: true },
        },
    },
    validations: [],
    features: {
        searchable: {
            enabled: false,
            fullText: false,
        },
        filterable: {
            enabled: true,
            inline: false,
        },
        sortable: {
            enabled: false,
        },
        auditable: {
            enabled: true,
        },
    },
};
