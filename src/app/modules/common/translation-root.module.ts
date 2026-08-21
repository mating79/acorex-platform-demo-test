import { AX_LOCALE_CONFIG, AXLocaleModule } from '@acorex/core/locale';
import {
  AX_TRANSLATION_CONFIG,
  AX_TRANSLATION_LOADER,
  AXTranslation,
  AXTranslationLoader,
  AXTranslationLoaderOptions,
  AXTranslationModule,
  translationConfig,
} from '@acorex/core/translation';
import { HttpClient } from '@angular/common/http';

import { Injectable, NgModule } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class MyTranslationLoader implements AXTranslationLoader {
  constructor(private http: HttpClient) { }

  load(options: AXTranslationLoaderOptions): Observable<AXTranslation> {
    try {
      const scope = options.scope?.startsWith('general-') ?
        options.scope?.replace('-', '/') :
        options.scope;
      // Regional English variants reuse en-US UI strings until dedicated packs exist.
      const lang =
        options.lang === 'en-AU' || options.lang === 'en-NZ' ? 'en-AU' : options.lang;
      return this.http.get<AXTranslation>(`/assets/i18n/${lang}/${scope}.json`);
    } catch (error) {
      console.error(error);
      return of({});
    }
  }
}

@NgModule({
  exports: [AXTranslationModule],
  imports: [AXTranslationModule, AXLocaleModule],
  providers: [
    {
      provide: AX_TRANSLATION_LOADER,
      useClass: MyTranslationLoader,
    },

    {
      provide: AX_TRANSLATION_CONFIG,
      useValue: translationConfig({
        preload: {
          langs: ['en-US'],
          scopes: ['acorex', 'general'],
        },
        defaults: {
          lang: 'en-US',
          scope: 'general',
        },
      }),
    },
    {
      provide: AX_LOCALE_CONFIG,
      useValue: {
        default: 'en-US',
      },
    },
  ],
})
export class AXPTranslationRootModule { }
