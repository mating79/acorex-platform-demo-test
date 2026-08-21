import { AXPPropertyDefinition } from "@acorex-platform/framework-shared/domain";
import { AXPWidgetsList } from "@acorex-platform/framework-shared/core";

export const imageUrlSchema: AXPPropertyDefinition = {
    name: 'image-url',
    title: 'Image URL',
    interface: {
        name: AXPWidgetsList.Advanced.Image,
        title: 'Image URL',
        options: {
            view: { type: 'url', width: 'auto', height: 'auto' },
            edit: { type: 'url', width: 'auto', height: 'auto', placeholder: 'Upload image or enter URL' },
            column: { type: 'url', width: 'auto', height: 'auto' },
        },
    },
    validations: [
        {
            rule: 'pattern',
            options: {
                value: '^https?:\\/\\/.+\\.(jpg|jpeg|png|gif|bmp|webp|svg)$',
                flags: 'i'
            }
        }
    ],
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
