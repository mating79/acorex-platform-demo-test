import { AXPDomainService } from "@acorex-platform/framework-client/domain";
import { inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class ExampleService {
    private readonly domainService = inject(AXPDomainService);

    public async loadDomainModels() {
        // Load full module
        const userModule = await this.domainService.getModule('user-management-lazy');
        console.log('User Management Module:', userModule);

        // Load individual entities
        const userEntity = await this.domainService.getEntity('user-management.user-aggregate.user');
        console.log('User Entity:', userEntity);

        const roleEntity = await this.domainService.getEntity('user-management.user-aggregate.role');
        console.log('Role Entity:', roleEntity);

        // Test navigation helpers
        const aggregate = userModule.findAggregate('user-aggregate');
        console.log('Found User Aggregate:', aggregate);

        if (aggregate) {
            const entityRef = aggregate.getEntityReference('user');
            console.log('User Entity Reference:', entityRef);
        }
    }

    constructor() {
        this.loadDomainModels();
    }
}   