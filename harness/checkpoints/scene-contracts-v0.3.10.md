# v0.3.10 — Minimal Working Scene MVP (SC17)

READY_FOR_DEVELOPER_REVIEW; Developer owns acceptance. Stop before v0.3.11.

## Preflight and scope

Started at accepted v0.3.9 ed0fb3f002cde10faec63fde89b0c02ac4e3ddc9 on
feat/editor-render-scene-contracts-v0.3; continue existing Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3. Developer supplied this next task
after implementation/verification of v0.3.9, with review deferred to the final step.
Live verified Phase 1 PR #1 MERGED at 4cec85b5a00e2477f00eee29e2da6025a532e973;
Phase 2 PR #2 MERGED at fea9b734b849fa1c6bc953530e1fa425d43cfca8 (Phase 3 base).

Read root/project guidance, architecture/foundation, Harness ownership/contracts/
verification/workflow and actual Scene/Asset/Render source, roots, manifests and
emitted declarations. Editor is the primary owner of the manual authored-data flow;
Render collaborates through unchanged prepareVisualResource. Canonical Scene capture,
operations and diagnostics plus Phase 2 catalog/resolver/projection already support
the requested sequence. No new API, duplicate validation or framework research is
needed. Installed roots link to workspace packages 0.0.0; Core 2.0.0 and Gameplay
0.15.2 remain unchanged, read-only and unused by this proof's data operations.

Five documentation paths: root README.md, editor/AGENTS.md, editor/manual/README.md,
harness/CONTRACTS.md and this checkpoint. Infra allowance covers documentation.
No production source, public signature/export, manifest/lockfile, dependency graph,
ownership, package version or workflow change. Exactly five projects. No Engine,
Client or Server implementation; no permanent script/test file or runtime CI gate.

## Reproduce the finite manual proof

After the README setup and workspace build, run from workspace root in PowerShell.
The command extracts the single TypeScript block below into a temporary consumer
at the workspace root so normal package resolution applies, strict-compiles it,
runs it once with Node 24 native TypeScript stripping, then removes it. It refuses
to overwrite an existing file. This is an optional manual invocation, not CI or a
test suite; no assertions, runner or simulated API implementation.

```powershell
$reportPath = 'harness/checkpoints/scene-contracts-v0.3.10.md'
$manualPath = Join-Path (Get-Location) '.manual-scene-v0310.mts'
if (Test-Path -LiteralPath $manualPath) { throw 'Temporary consumer path already exists' }
$reportText = Get-Content -LiteralPath $reportPath -Raw
$manualCode = [regex]::Match($reportText, '(?s)```typescript\r?\n(.*?)\r?\n```').Groups[1].Value
if (-not $manualCode) { throw 'Manual sequence block not found' }
try {
  [System.IO.File]::WriteAllText($manualPath, $manualCode, [System.Text.UTF8Encoding]::new($false))
  node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM $manualPath
  if ($LASTEXITCODE -ne 0) { throw 'Public consumer compilation failed' }
  node $manualPath
  if ($LASTEXITCODE -ne 0) { throw 'Manual invocation failed' }
} finally {
  Remove-Item -LiteralPath $manualPath
}
```

```typescript
import {
  createAssetCatalog, getAssetDefinition, resolveAssetReference,
  createSceneMembership, addSceneObject, listSceneObjects, getSceneObject,
  updateSceneObjectPlacement, replaceSceneObject, diagnoseSceneMembership,
  describeSceneObjectVisual, type SceneObjectVisualDescription,
} from '@rpg-platform/editor';
import { prepareVisualResource, type VisualResourceDescriptor } from '@rpg-platform/runtime-render';

const catalog = createAssetCatalog({ projectId: 'scene-demo', definitions: [
  { identity: { projectId: 'scene-demo', assetId: 'monster-image' }, kind: 'image',
    metadata: {}, sources: [{ role: 'image',
      locator: { type: 'project-relative', path: 'art/monster.png' } }] },
] });
const hostPlacement = { coordinateSpaceId: 'author-space', point: { x: 0, y: 0 } };
const base = createSceneMembership({
  scene: { identity: { projectId: 'scene-demo', sceneId: 'scene-zone-01' } },
  objects: [{ definition: { objectId: 'player-01', displayName: 'Player', classification: 'visual-placeholder' },
    placement: hostPlacement }],
});
const withMonsters = ['monster-01', 'monster-02', 'monster-03'].reduce((snapshot, objectId, index) =>
  addSceneObject(snapshot, { definition: { objectId, displayName: 'Monster', classification: 'visual-placeholder' },
    assetReference: { projectId: 'scene-demo', assetId: 'monster-image', expectedKind: 'image' },
    placement: { coordinateSpaceId: 'author-space', point: { x: 10 + index * 10, y: index * -5 } },
  }), base);
const original = addSceneObject(withMonsters, {
  definition: { objectId: 'vfx-01', displayName: 'VFX', classification: 'visual-placeholder' },
  attachment: { kind: 'attachment', target: { sceneId: 'scene-zone-01', objectId: 'player-01' } },
});
const independent = createSceneMembership({
  scene: { identity: { projectId: 'scene-demo', sceneId: 'scene-zone-02' } },
  objects: [{ definition: { objectId: 'player-01', displayName: 'Independent Player' }, placement: hostPlacement }],
});
const originalText = JSON.stringify(original);
const independentText = JSON.stringify(independent);
const catalogText = JSON.stringify(catalog);
const updated = updateSceneObjectPlacement(original, 'monster-02', {
  coordinateSpaceId: 'author-space', point: { x: 25, y: -8 },
});
hostPlacement.point.x = 999;
console.log('original / updated / independent', JSON.stringify({ original, updated, independent }));
console.log('canonical shared Asset', ['monster-01', 'monster-02', 'monster-03'].map(objectId => {
  const resolution = resolveAssetReference(catalog, getSceneObject(updated, objectId)!.assetReference!);
  return { objectId, status: resolution.status, sameCatalogDefinition: resolution.status === 'resolved'
    && resolution.definition === getAssetDefinition(catalog, 'monster-image') };
}));
console.log('identity and refs before / after placement edit', JSON.stringify(
  [original, updated].map(snapshot => ({ identity: snapshot.scene.identity,
    objects: listSceneObjects(snapshot).map(entry => ({ objectId: entry.definition.objectId,
      reference: entry.assetReference, attachment: entry.attachment ?? null })) }))));
console.log('valid reference validation', JSON.stringify(diagnoseSceneMembership(updated, catalog)));

// Missing, syntactically valid target IDs in two distinct identity domains.
const monster = getSceneObject(updated, 'monster-03')!;
const missingAsset = replaceSceneObject(updated, 'monster-03', { ...monster,
  assetReference: { projectId: 'scene-demo', assetId: 'missing-asset', expectedKind: 'image' } });
const vfx = getSceneObject(missingAsset, 'vfx-01')!;
const missingTargets = replaceSceneObject(missingAsset, 'vfx-01', { ...vfx,
  attachment: { kind: 'attachment', target: { sceneId: 'scene-zone-01', objectId: 'missing-object' } } });
const missingText = JSON.stringify(missingTargets);
console.log('distinct missing target diagnostics', JSON.stringify(diagnoseSceneMembership(missingTargets, catalog)));
console.log('missing Asset projection', JSON.stringify(describeSceneObjectVisual(missingTargets, 'monster-03', catalog)));

const descriptions: readonly SceneObjectVisualDescription[] = listSceneObjects(updated).map(entry =>
  describeSceneObjectVisual(updated, entry.definition.objectId, catalog, 'image/png'));
console.log('all presentation descriptions', JSON.stringify(descriptions));
for (const description of descriptions) {
  if (description.status === 'described') {
    const descriptor: VisualResourceDescriptor = description.descriptor;
    const prepared = prepareVisualResource(descriptor);
    console.log('real Render handoff', JSON.stringify({ callerCorrelation: description.correlation,
      receivedKeys: Object.keys(prepared.descriptor), prepared,
      detached: prepared.descriptor !== descriptor, frozen: Object.isFrozen(prepared.descriptor.sources[0]?.locator) }));
  }
}
console.log('isolation after diagnostics and handoff', {
  originalUnchanged: originalText === JSON.stringify(original),
  independentUnchanged: independentText === JSON.stringify(independent),
  catalogUnchanged: catalogText === JSON.stringify(catalog),
  missingRefsRetained: missingText === JSON.stringify(missingTargets),
  originalPoint: getSceneObject(original, 'monster-02')?.placement?.point,
  updatedPoint: getSceneObject(updated, 'monster-02')?.placement?.point,
  independentPoint: getSceneObject(independent, 'player-01')?.placement?.point,
  detachedFromHost: getSceneObject(original, 'player-01')?.placement !== hostPlacement,
  frozen: Object.isFrozen(updated) && Object.isFrozen(updated.objects)
    && Object.isFrozen(getSceneObject(updated, 'monster-02')?.placement?.point),
});
console.log('AUTHORED_DATA_FLOW_ONLY / RESOURCE_LOADING_NOT_PERFORMED / FILE_EXISTENCE_NOT_CHECKED / VISUAL_NOT_VERIFIED');
```

The PNG locator is illustrative metadata. No PNG bytes are supplied, probed, read,
decoded or generated. Player/Monster/VFX are visual labels only; no gameplay or VFX
runtime exists in this flow. JSON.stringify above prints observations and compares
retained in-memory snapshots; it is not a serializer API, round-trip or save/load.

## Observations and verification

Strict public-root compile and ad hoc invocation both exited 0. Temporary consumer
was removed. MANUALLY_OBSERVED, limited to this finite sequence:

| Observation | Actual output |
| --- | --- |
| Scene / ordered IDs | scene-demo/scene-zone-01; player-01, monster-01, monster-02, monster-03, vfx-01 |
| Shared Asset | All three monsters resolved scene-demo/monster-image; sameCatalogDefinition true for each against the exact caller catalog record |
| Optional placements | Player (0,0); monsters (10,0), (20,-5), (30,-10) in author-space; VFX omitted placement projects to null |
| Placement edit | monster-02 candidate (25,-8); original remained (20,-5); before/after identity, Asset refs and VFX-to-player attachment values unchanged |
| Valid diagnostics | status valid, diagnostics [], assetReferences CHECKED, fileExistence NOT_CHECKED |
| Missing Asset target | TARGET_NOT_FOUND, membership.objects[3].assetReference.assetId, object monster-03, target missing-asset, SUPPLIED_PROJECT_CATALOG |
| Missing Object target | OBJECT_TARGET_NOT_FOUND, membership.objects[4].attachment.target.objectId, object vfx-01, target missing-object, SUPPLIED_SCENE_MEMBERSHIP |
| Missing candidate | status unresolved; both authored references retained. Missing Asset projection unsupported / UNRESOLVED_REFERENCE with original object correlation/placement |
| Presentation | Three monsters described with separate project/scene/object correlations, same monster-image resource identity, image/png hint and image role at art/monster.png. Player/VFX unsupported / NO_ASSET_REFERENCE |
| Real Render seam | Three prepareVisualResource calls returned metadata-prepared, resourceLoading NOT_PERFORMED; received descriptor keys identity/mediaType/sources only; detached/frozen true for each |
| Isolation | originalUnchanged, independentUnchanged, catalogUnchanged, missingRefsRetained, detachedFromHost and frozen all true; independent scene-zone-02/player-01 stayed (0,0) despite host x=999 |

The invalid target cases use syntactically valid but nonexistent keys. They prove
distinct missing-reference domains, not malformed-ID rejection or file absence.
No mutation/repair occurs on diagnostic/projection calls. The independent scene
deliberately reuses the local player-01 key; scene scope remains explicit.
Final marker: AUTHORED_DATA_FLOW_ONLY / RESOURCE_LOADING_NOT_PERFORMED /
FILE_EXISTENCE_NOT_CHECKED / VISUAL_NOT_VERIFIED.

| Gate | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 45 JS/TS files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; five declared documentation paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| npm run build -- --force | Exit 0; all five projects |
| Ad hoc strict NodeNext consumer compile | Exit 0, including public Scene/Render declaration assignments |
| Actual source/emitted root inventories | Editor 74 / Render 17, matching names; root sources unchanged, both package roots resolve to manifest artifacts |
| git diff --check | Passed |

No failed/unconfigured builds. Existing Windows Harness DEP0190 warning unchanged.
No API/compatibility drift or private cross-project import found. Exact commit and
push/PR CI links are recorded in PR #3 after push, avoiding a self-referential SHA.
Build/static success is compilation evidence, separate from the observations above.

## Limits and remaining decisions

Scene Definition != Render Scene Instance != Gameplay World. Object IDs != Asset
IDs != Entity IDs != Render IDs. Distinct authored references do not allocate Render
instances; repeated metadata preparation does not establish a resource cache.
Caller retains correlation/placement; Render receives resource identity/media hint/
sources only. Attachment is authored nonhierarchical intent, not runtime following.

This is a minimal working authored-data/reference/projection flow, not a viewport,
rendered Scene or Phase 3 closure. GPU frames, sprite placement/display, actual VFX,
animation and visual correctness are NOT_VERIFIED. Spatial/camera semantics belong
to Features 04/09, loading to 07, Scene instances to 08; Map/UI and Document/export
remain future work. Missing authored targets do not establish physical file absence.
No gameplay, persistence, browser app or v0.3.11 implementation. No tests, assertions,
runners, coverage, matrix, automatic runtime gate, merge, tag, release or publish.
