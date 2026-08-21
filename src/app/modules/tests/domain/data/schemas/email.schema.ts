import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const emailSchema: AXPPropertyDefinition = {
    name: 'email',
    title: 'Email',
    interface: {
        name: AXPWidgetsList.Editors.TextBox,
        title: 'Email',
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
