import { AXPSessionService } from "@acorex-platform/framework-client/auth";
import { AXPDomainLoader } from "@acorex-platform/framework-client/domain";
import { AXPModuleDefinition, AXPEntityDefinition } from "@acorex-platform/framework-shared/domain";
import { inject } from "@angular/core";

export class DomainJsonLoader implements AXPDomainLoader {
    priority = 100;
    private readonly session = inject(AXPSessionService);

    canLoad(path: string): boolean {
        // Can load full modules or individual entities from our test data
        return path === 'user-management' ||
            path === 'user-management-lazy' ||
            path.startsWith('user-management.user-aggregate.');
    }

    async load(path: string): Promise<AXPModuleDefinition | AXPEntityDefinition> {
        const applicationName = this.session.application?.name;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Load full module
        if (path === 'user-management') {
            const moduleJson = await import('./data/user-management.module.json');
            return this.convertToModuleDefinition(moduleJson.default);
        }

        if (path === 'user-management-lazy') {
            const moduleJson = await import('./data/user-management-lazy.module.json');
            return this.convertToModuleDefinition(moduleJson.default);
        }

        // Load individual entities
        if (path === 'user-management.user-aggregate.user') {
            const entityJson = await import('./data/entities/user.entity.json');
            return this.convertToEntityDefinition(entityJson.default);
        }

        if (path === 'user-management.user-aggregate.role') {
            const entityJson = await import('./data/entities/role.entity.json');
            return this.convertToEntityDefinition(entityJson.default);
        }

        if (path === 'user-management.user-aggregate.user-profile') {
            const entityJson = await import('./data/entities/user-profile.entity.json');
            return this.convertToEntityDefinition(entityJson.default);
        }

        throw new Error(`Cannot load domain path: ${path}`);
    }

    private convertToModuleDefinition(moduleJson: any): AXPModuleDefinition {
        return {
            name: moduleJson.name,
            title: moduleJson.title,
            aggregates: moduleJson.aggregates?.map((agg: any) => ({
                name: agg.name,
                title: agg.title,
                entities: agg.entities || [],
                validations: agg.validations || [],
                actions: agg.actions || []
            })) || []
        };
    }

    private convertToEntityDefinition(entityJson: any): AXPEntityDefinition {
        return {
            name: entityJson.name,
            title: entityJson.title,
            type: entityJson.type || 1,
            fields: entityJson.fields || []
        };
    }
}