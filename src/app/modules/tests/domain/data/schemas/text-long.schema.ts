import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const textLongSchema: AXPPropertyDefinition = {
    name: 'text-long',
    title: 'Text Long',
    interface: {
        name: AXPWidgetsList.Editors.LargeTextBox,
        title: 'Text Long',
        options: {
            view: { readonly: true },
            edit: { rows: 5, maxLength: 2000, placeholder: 'Enter detailed text...' },
            column: { readonly: true },
        },
    },
    validations: [
        {
            rule: 'maxLength',
            options: {
                value: 2000
            }
        }
    ],
    features: {
        searchable: {
            enabled: true,
            fullText: true,
        },
        filterable: {
            enabled: false,
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
