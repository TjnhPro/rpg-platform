import { createResourceLocator, type ResourceLocator } from './asset-sources.js';
import { AssetValidationError } from './asset-validation.js';
import { createProjectManifest, readProjectManifest, type ProjectManifest, type ProjectResourceRoot } from './project-manifest.js';
import { projectData, projectFail, projectKey, projectRecord } from './project-validation.js';

/** Internal canonical locator capture, shared by project reference validators. */
export function captureProjectLocator(input: unknown, path: string): ResourceLocator {
  const value = projectRecord(input, ['type', 'path'], [], path);
  try { return createResourceLocator(value as unknown as ResourceLocator); }
  catch (error) {
    if (!(error instanceof AssetValidationError)) throw error;
    return projectFail('INVALID_LOCATOR', path);
  }
}
/** Internal canonical list reader; input already portable-captured by caller. */
export function captureProjectRoots(input: unknown): readonly ProjectResourceRoot[] {
  if (!Array.isArray(input)) return projectFail('INVALID_RESOURCE_ROOTS', 'project.resourceRoots');
  const seen = new Set<string>();
  return Object.freeze(input.map((item: unknown, index: number) => {
    const path = `project.resourceRoots[${index}]`;
    const value = projectRecord(item, ['rootId', 'locator'], [], path);
    const rootId = projectKey(value.rootId, path + '.rootId');
    if (seen.has(rootId)) return projectFail('DUPLICATE_ROOT_ID', path + '.rootId');
    seen.add(rootId);
    return Object.freeze({ rootId, locator: captureProjectLocator(value.locator, path + '.locator') });
  }));
}
/** Replace logical roots only. No document relocation or physical IO. */
export function setProjectResourceRoots(manifest: ProjectManifest, roots: readonly ProjectResourceRoot[]): ProjectManifest {
  const current = readProjectManifest(manifest);
  const resourceRoots = captureProjectRoots(projectData(roots));
  return createProjectManifest({ ...current, resourceRoots });
}
