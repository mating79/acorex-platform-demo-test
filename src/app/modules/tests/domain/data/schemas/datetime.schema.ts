import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const datetimeSchema: AXPPropertyDefinition = {
    name: 'datetime',
    title: 'Date Time',
    interface: {
        name: AXPWidgetsList.Editors.DateTimeBox,
        title: 'Date Time',
        options: {
            view: { format: 'YYYY-MM-DD HH:mm:ss', showTime: true, readonly: true },
            edit: { format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
            column: { format: 'YYYY-MM-DD HH:mm:ss', readonly: true },
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
            enabled: false,
        },
    },
};
