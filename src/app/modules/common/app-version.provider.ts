import { AXPAppVersion, AXPAppVersionProvider } from '@acorex-platform/framework-client/common';
import { environment } from '../../../environments/environment';

export class DEMOAppVersionProvider implements AXPAppVersionProvider {
  provider(): Promise<AXPAppVersion> {
    return Promise.resolve({
      version: environment.appVersion,
      build: 1,
      date: new Date(),
    });
  }
}
