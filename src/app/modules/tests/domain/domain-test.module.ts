import { CommonModule } from '@angular/common';
import { inject, NgModule } from '@angular/core';
import {
    AXPDomainModule,
    provideDomainLoaders,
    provideModuleMiddleware,
    provideAggregateMiddleware,
    provideEntityMiddleware,
    providePropertySetups,
} from '@acorex-platform/framework-client/domain';
import { emailSchema } from './data/schemas/email.schema';
import { DomainJsonLoader } from './domain-loader';
import { ExampleService } from './example.service';
import { uuidSchema } from './data/schemas/uuid.schema';
import { phoneSchema } from './data/schemas/phone.schema';
import { booleanSchema } from './data/schemas/boolean.schema';
import { textLongSchema } from './data/schemas/text-long.schema';
import { textShortSchema } from './data/schemas/text-short.schema';
import { dateSchema } from './data/schemas/date.schema';
import { urlSchema } from './data/schemas/url.schema';
import { datetimeSchema } from './data/schemas/datetime.schema';
import { permissionListSchema } from './data/schemas/permission-list.schema';

@NgModule({
    imports: [
        CommonModule,
        AXPDomainModule,
    ],
    providers: [
        // Register reusable property definitions for tests
        providePropertySetups([
            { definition: emailSchema },
            { definition: uuidSchema },
            { definition: phoneSchema },
            { definition: booleanSchema },
            { definition: textLongSchema },
            { definition: textShortSchema },
            { definition: dateSchema },
            { definition: urlSchema },
            { definition: datetimeSchema },
            { definition: permissionListSchema },
        ]),

        // Add domain loaders for JSON module/entity loading
        provideDomainLoaders([
            DomainJsonLoader,
        ]),

        // Add domain middleware for transformations
        provideModuleMiddleware([
            (context) => {
                console.log('Module middleware context:', context.definition.name, 'type:', context.type);

                // Example: Add custom properties to user-management module
                if (context.definition.name === 'user-management') {
                    console.log('Processing user-management module');
                    context.setMetadata('processed', true);
                }
            }
        ]),

        provideAggregateMiddleware([
            (context) => {
                console.log('Aggregate middleware context:', context.definition.name, 'type:', context.type);

                // Example: Add custom logic for user-aggregate
                if (context.definition.name === 'user-aggregate') {
                    console.log('Processing user-aggregate');
                    context.setMetadata('enhanced', 'true');
                }
            }
        ]),

        provideEntityMiddleware([
            (context) => {
                console.log('Entity middleware context:', context.definition.name, 'type:', context.type);

                // Example: Add validation to user entities
                if (context.definition.name === 'user') {
                    console.log('Processing user entity');
                    context.setMetadata('userEntity', true);
                }

                // Example: Add custom logic for role entities
                if (context.definition.name === 'role') {
                    console.log('Processing role entity');
                    context.setMetadata('roleEntity', true);
                }
            }
        ])
    ],
})
export class DomainTestModule {
    //exampleService = inject(ExampleService);

    constructor() {
        console.log('DomainTestModule initialized with domain registry system');
    }
}