// axp-employee-feature.module.ts

import { NgModule, inject } from '@angular/core';
import { AXPCommandMiddleware, provideCommandMiddleware, provideCommandSetups } from '@acorex-platform/framework-client/runtime';

import { AXPDomainModule } from '@acorex-platform/framework-client/domain';
import { provideEntity } from '@acorex-platform/framework-client/layout/entity';
import { AXPSessionService } from '@acorex-platform/framework-client/auth';

export const auditCreateMiddleware: AXPCommandMiddleware = async (context, next) => {
    const session = inject(AXPSessionService);
    console.log('[PLUGIN] Audit middleware called ', context.input);
    const input = context.input as Record<string, unknown>;
    input['_audit'] = {
        createdBy: session.user?.name,
        createdAt: new Date(),
        updatedBy: session.user?.name,
        updatedAt: new Date()
    };
    return next({ ...context, input });
};


@NgModule({
    imports: [
        AXPDomainModule
    ],
    providers: [
        provideCommandMiddleware([
            {
                target: /(Accept|Create)/,
                middleware: auditCreateMiddleware
            }
        ]),
        provideEntity([
            'OrganizationManagement.Employee',
            'OrganizationManagement.Department'
        ])
    ]
})
export class AXPEmployeeFeatureModule {
}
