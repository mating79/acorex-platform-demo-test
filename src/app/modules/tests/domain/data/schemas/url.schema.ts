import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const urlSchema: AXPPropertyDefinition = {
    name: 'url',
    title: 'URL',
    interface: {
        name: AXPWidgetsList.Editors.TextBox,
        title: 'URL',
        options: {
            view: { readonly: true },
            edit: { placeholder: 'https://example.com', type: 'url' },
            column: { readonly: true },
        },
    },
    validations: [
        {
            rule: 'pattern',
            options: {
                value: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
            }
        }
    ],
    features: {
        searchable: {
            enabled: true,
            fullText: false,
        },
        filterable: {
            enabled: true,
            inline: false,
        },
        sortable: {
            enabled: true,
        },
        auditable: {
            enabled: true,
        },
    },
};
