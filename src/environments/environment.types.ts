export interface AppEnvironment {
  production: boolean;
  baseUrl: string;
  appVersion: string;
  localeProfileCatalogCodes?: readonly string[];
}
