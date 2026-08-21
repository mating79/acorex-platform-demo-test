import { AXMEntityCrudServiceImpl } from '@acorex-platform/framework-client/layout/entity';
import { Injectable } from '@angular/core';
import { RootConfig } from './const';

export abstract class AXMSampleEntityService extends AXMEntityCrudServiceImpl<string, any> {}

@Injectable()
export class AXMSampleEntityServiceImpl extends AXMSampleEntityService {
  constructor() {
    super(`${RootConfig.module.name}.${RootConfig.entities.sample.name}`);
  }
}
