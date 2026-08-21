import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const textShortSchema: AXPPropertyDefinition = {
    name: 'text-short',
    title: 'Text Short',
    interface: {
        name: AXPWidgetsList.Editors.TextBox,
        title: 'Text Short',
        options: {
            view: { readonly: true },
            edit: { maxLength: 100, placeholder: 'Enter text...' },
            column: { readonly: true },
        },
    },
    validations: [
        {
            rule: 'maxLength',
            options: {
                value: 100
            }
        }
    ],
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
