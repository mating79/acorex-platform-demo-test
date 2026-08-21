import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AXMSampleEntityService, AXMSampleEntityServiceImpl } from './sample/sample.service';

@NgModule({
  imports: [CommonModule],
  exports: [],
  providers: [
    {
      provide: AXMSampleEntityService,
      useClass: AXMSampleEntityServiceImpl,
    },
  ],
  declarations: [],
})
export class DEMORootModule {
  //registry = inject(AXPWidgetRegistryService);
}
