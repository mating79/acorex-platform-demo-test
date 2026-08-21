//#region ----- Session access policy DTOs (client) -----

export interface AXPSessionModulesAndFeatures {
  modules: string[];
  features: Record<string, unknown>;
}

export interface AXPSessionAccessPolicy {
  permissions: string[];
  modulesAndFeatures: AXPSessionModulesAndFeatures | null;
}

//#endregion
