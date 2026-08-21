import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const phoneSchema: AXPPropertyDefinition = {
    name: 'phone',
    title: 'Phone',
    interface: {
        name: AXPWidgetsList.Editors.NumberBox,
        title: 'Phone',
        options: {
            view: { readonly: true },
            edit: {},
            column: { readonly: true },
        },
    },
    validations: [],
    features: {
        searchable: {
            enabled: true,
            fullText: true,
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
