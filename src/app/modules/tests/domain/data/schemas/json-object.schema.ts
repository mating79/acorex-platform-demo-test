import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const jsonObjectSchema: AXPPropertyDefinition = {
    name: 'json-object',
    title: 'JSON Object',
    interface: {
        name: AXPWidgetsList.Advanced.JsonViewer,
        title: 'JSON Object',
        options: {
            view: {},
            edit: {},
            column: {},
        },
    },
    validations: [],
    features: {
        searchable: {
            enabled: false,
            fullText: false,
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
