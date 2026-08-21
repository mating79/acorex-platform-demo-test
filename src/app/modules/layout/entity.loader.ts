// import { AXPEntity } from '@acorex-platform/framework-client/common';
// import { AXPEntityDefinitionLoader } from '@acorex-platform/framework-client/layout/entity';
// import { Injectable, Injector, inject } from '@angular/core';

// @Injectable()
// export class AXPRootEntityLoader implements AXPEntityDefinitionLoader {
//   private injector = inject(Injector);

//   async get(moduleName: string, entityName: string): Promise<AXPEntity | null> {
//     switch (entityName.toLocaleLowerCase()) {
//       case 'sample': {
//         const entity = (await import('../demo/sample/sample.entity')).factory;
//         return entity(this.injector) as any;
//       }
//     }
//     return null;
//   }

//   async list(): Promise<{ name: string; module: string }[]> {
//     return Promise.resolve([{ name: 'Sample', module: 'Demo' }]);
//   }
// }
