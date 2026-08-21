import { Route } from '@angular/router';
export const appRoutes: Route[] = [
  // TODO: uncomment when libs are added
  // {
  //   path: 'assessment/fill/:sessionId',
  //   loadComponent: () =>
  //     import('@acorex-platform/module-assessment-management-client').then((m) => m.AXMQuestionnaireViewerStandalonePageComponent),
  //   data: { reuse: false },
  // },
  // {
  //   path: 'demo',
  //   loadChildren: () => import('./modules/demo/demo-root.module').then((c) => c.DEMORootModule),
  // },
  {
    path: 'tests',
    loadChildren: () =>
      import('./modules/tests/tests.module').then((c) => c.TestsModule),
  },
];
