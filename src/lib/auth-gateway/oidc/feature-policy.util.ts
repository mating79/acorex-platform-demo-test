//#region ----- Imports -----

import { AXPFeature, AXPSessionContext } from '@acorex-platform/framework-client/auth';
import { AXPModuleManifestRegistry } from '@acorex-platform/framework-client/core';
import { AXPSessionModulesAndFeatures } from './access-policy.types';

//#endregion

//#region ----- Feature policy resolution -----

/**
 * Expands edition module/feature data using client module manifests (dependency graph + definitions).
 */
export async function resolveFeaturesFromModulesAndFeatures(
  modulesAndFeatures: AXPSessionModulesAndFeatures | null | undefined,
  manifestRegistry: AXPModuleManifestRegistry,
): Promise<AXPFeature[]> {
  if (!modulesAndFeatures) {
    return [];
  }

  await manifestRegistry.initialize();

  const enabledModules = modulesAndFeatures.modules ?? [];
  const featureValues = modulesAndFeatures.features ?? {};
  const allModulesSet = new Set<string>(enabledModules);

  const collectDependencies = (moduleName: string): void => {
    const manifest = manifestRegistry.get(moduleName);
    if (!manifest?.dependencies?.length) {
      return;
    }

    for (const dependency of manifest.dependencies) {
      if (dependency.includes('.')) {
        continue;
      }

      const depModule = dependency;
      if (!manifestRegistry.has(depModule)) {
        console.warn(
          `[AXPAccessPolicyService] Module '${moduleName}' depends on missing module: ${depModule}`,
        );
        continue;
      }

      if (allModulesSet.has(depModule)) {
        continue;
      }

      const depManifest = manifestRegistry.get(depModule);
      if (depManifest?.required) {
        continue;
      }

      allModulesSet.add(depModule);
      collectDependencies(depModule);
    }
  };

  for (const moduleName of enabledModules) {
    collectDependencies(moduleName);
  }

  const allDefinitions = manifestRegistry.getAllFeatureDefinitions();
  const result: AXPFeature[] = [];

  for (const definition of allDefinitions) {
    const [moduleName] = definition.name.split(':');
    if (!allModulesSet.has(moduleName)) {
      continue;
    }

    const featureValue = featureValues[definition.name];
    if (featureValue !== undefined && featureValue !== null) {
      result.push({
        name: definition.name,
        title: definition.title,
        description: definition.description,
        value: featureValue as boolean,
        interface: definition.interface,
      });
    }
  }

  const featureNamesSet = new Set(result.map((feature) => feature.name));
  for (const moduleName of allModulesSet) {
    if (featureNamesSet.has(moduleName)) {
      continue;
    }

    const manifest = manifestRegistry.get(moduleName);
    if (manifest) {
      result.push({
        name: moduleName,
        title: manifest.title || moduleName,
        description: manifest.description,
        value: true,
      });
      featureNamesSet.add(moduleName);
    }
  }

  return result;
}

/** Builds a stable cache key from session context fields that affect access policy. */
export function buildAccessPolicyCacheKey(context: AXPSessionContext): string {
  return [
    context.user?.id ?? '',
    context.tenant?.id ?? '',
    context.application?.id ?? '',
    context.application?.edition?.id ?? '',
  ].join(':');
}

//#endregion
