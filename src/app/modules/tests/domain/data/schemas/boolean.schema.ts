import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const booleanSchema: AXPPropertyDefinition = {
    name: 'boolean',
    title: 'Boolean',
    interface: {
        name: AXPWidgetsList.Editors.ToggleSwitch,
        title: 'Boolean',
        options: {
            view: { readonly: true, trueText: 'Yes', falseText: 'No' },
            edit: { trueText: 'Yes', falseText: 'No' },
            column: { trueText: 'Yes', falseText: 'No' },
        },
    },
    validations: [],
    features: {
        searchable: {
            enabled: true,
            fullText: false,
        },
        filterable: {
            enabled: true,
            inline: true,
        },
        sortable: {
            enabled: true,
        },
        auditable: {
            enabled: true,
        },
    },
}; 
