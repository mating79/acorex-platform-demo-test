import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const uuidSchema: AXPPropertyDefinition = {
    name: 'uuid',
    title: 'UUID',
    interface: {
        name: AXPWidgetsList.Editors.TextBox,
        title: 'UUID',
        options: {
            view: { readonly: true },
            edit: { readonly: true },
            column: { readonly: true },
        },
    },
    validations: [
        {
            rule: 'pattern',
            options: {
                value: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
                flags: 'i'
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
            enabled: false,
        },
    },
}; 