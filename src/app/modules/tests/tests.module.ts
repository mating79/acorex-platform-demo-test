import { AXPAuthGuard } from '@acorex-platform/framework-client/auth';
import { AXPWidgetRegistryService } from '@acorex-platform/framework-client/layout/widget-core';
import { AXPRootLayoutComponent } from '@acorex-platform/framework-client/themes/default';
import { CommonModule } from '@angular/common';
import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DomainTestModule } from './domain/domain-test.module';
import { AXPEmployeeFeatureModule } from './test/employee/employee-feature.module';

const routes: Routes = [
  {
    path: '',
    component: AXPRootLayoutComponent,
    children: [
      {
        //canActivate: [AXPAuthGuard],
        path: 'test1',
        loadComponent: () => import('../tests/test/test.component').then((c) => c.TestComponent),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test2',
        loadComponent: () => import('../tests/test2/test2.component').then((c) => c.TestComponent2),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test3',
        loadComponent: () => import('../tests/test3/identifier-test.component').then((c) => c.IdentifierTestComponent),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test4',
        loadComponent: () => import('../tests/test4/test4.component').then((c) => c.Test4Component),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test5',
        loadComponent: () => import('../tests/test5/test5.component').then((c) => c.Test5Component),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test6',
        loadComponent: () => import('../tests/test6/test6').then((c) => c.Test6Component),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test7',
        loadComponent: () => import('../tests/test7/test7').then((c) => c.Test7Component),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test8',
        loadComponent: () => import('../tests/test8/test8').then((c) => c.TestComponent8),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test9',
        loadComponent: () => import('../tests/test9/test9').then((c) => c.TestComponent9),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test10',
        loadComponent: () => import('../tests/test10/test10').then((c) => c.TestComponent10),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test-ai-direct',
        loadComponent: () =>
          import('../tests/test-ai-direct/test-ai-direct.page').then((c) => c.TestAiDirectPageComponent),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test-section-items-builder',
        loadComponent: () =>
          import('../tests/test-section-items-builder/test-section-items-builder.component').then(
            (c) => c.TestSectionItemsBuilderDemoComponent,
          ),
      },
      {
        canActivate: [AXPAuthGuard],
        path: 'test-standard-section-items-builder',
        loadComponent: () =>
          import('../tests/test-standard-section-items-builder/test-standard-section-items-builder.component').then(
            (c) => c.TestStandardSectionItemsBuilderComponent,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    //
    AXPEmployeeFeatureModule,
    //
    DomainTestModule,
  ],
  exports: [],
  declarations: [],
})
export class TestsModule {
  registry = inject(AXPWidgetRegistryService);
}
