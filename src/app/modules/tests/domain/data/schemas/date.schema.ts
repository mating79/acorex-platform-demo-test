import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const dateSchema: AXPPropertyDefinition = {
    name: 'date',
    title: 'Date',
    interface: {
        name: AXPWidgetsList.Editors.DateTimeBox,
        title: 'Date',
        options: {
            view: { format: 'YYYY-MM-DD', showTime: false, readonly: true },
            edit: { format: 'YYYY-MM-DD', showTime: false, showToday: true },
            column: { format: 'YYYY-MM-DD', readonly: true },
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
