# v0.8.14 — SR21 Scene Rendering Integration & MVP Closure

**READY_FOR_DEVELOPER_REVIEW** for the whole-phase audit packet.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. This is not MVP acceptance.

## Preflight and authorized scope

Input HEAD `ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd` (v0.8.13), branch
`feat/scene-rendering-v0.8`, draft PR [#8](https://github.com/TjnhPro/rpg-platform/pull/8)
OPEN with matching head/base main. Fetched baseline/merge-base remains
`ffb347140fbe6bf432bb8fe33c7057bed9a93941` (Phase7 merged). Tracked input clean;
unrelated untracked `.mcp.json` untouched/excluded. Previous exact-head
[push](https://github.com/TjnhPro/rpg-platform/actions/runs/39951861975) and
[PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39951867462) CI success.

Read root/project AGENTS, architecture/foundation, Harness ownership/contracts/
workflow/verification/failures, compiler/manifests, actual source/public APIs and
prior phase records. Route supplied multiple hints; canonical primary owner is
**runtime-render** for Scene Rendering integration. Harness records evidence;
Editor and Client are existing compatibility consumers. Supplied task authorizes
documentation/static closure only, with no new production feature/public API.
No unknown ownership or dependency-direction decision is required.

The 14 prior commits v0.8.0–v0.8.13 were inventoried individually by exact SHA and
file list; this closure is version15. Existing implementation has genuine Phase6
graphics/frame/session support and Phase7 acquired-source/PNG/upload/cache/retained
ready lease/atlas APIs. No prerequisite is represented by metadata-only readiness,
mock engine or roadmap promise. Source existence/build is not runtime verification.

Installed/locked three0.186.1/types0.186.0, ExternalTexture implementation and official
ExternalTexture/Object3D/WebGLRenderer docs were checked. Native allocations remain
with Phase7; only the existing Render backend borrows them. L1 Core2.0.0
`04b7239f998c3c688a0dfa3202f11811a9acd775` and L2 Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` are unchanged/read-only.

## Reviewable closure delta

- [Integration audit](../../runtime-render/docs/scene-rendering-v0.8.14.md): all
  SR01–SR21, source/checkpoint links, prior-phase ownership/identity/lifetime
  compatibility, diagnostics/partial-failure boundaries, provenance and residual
  browser/GPU/transparent/TPSheet evidence gaps, Developer release recommendation.
- [15-version inventory](../../runtime-render/docs/phase-inventory-v0.8.14.md):
  each prior exact commit with full changed-file list, plus this closure scope.
- [Public declaration comparison](../../runtime-render/docs/public-api-delta-v0.8.14.md):
  all60 Render/four Editor additions with emitted declaration excerpts, source
  links and comparison method/limits. Existing root declarations unchanged.
- Supplied task archive (trailing whitespace normalized), this independent report,
  architecture/Harness ownership/contract pointers and Render AGENTS/manual index.

Exactly ten documentation paths, zero production/runtime/types/exports/schema/
manifest/lockfile/compiler/workflow change at closure. Historical checkpoints are
not rewritten. Exactly five projects. Across the whole Phase8 baseline diff, Engine,
Server, L1/L2 pin, manifests, lockfile, compiler configs and workflows are unchanged.
Public counts: Render126 -> 186 (+60), Editor134 -> 138 (+4), Client0 -> 0;
no existing root declaration removed or changed. Current closure API delta zero.

Declaration comparison emitted strict baseline/current package-root declarations
using TypeScript6.0.3, resolving aliases through its checker and stripping comments.
Baseline Editor resolves installed current Render declarations; this does not
reconstruct a historical runtime or prove transitive/behavioral compatibility.
renderFrame now draws the attached Visual Scene without changing its signature;
the review packet calls out that semantic extension explicitly.

Source review covered: issued/foreign/stale handles; scene occupancy/session end;
candidate retain before swap/reject release; releaseEntry/finally cleanup, clear/
dispose/quarantine; submission-time right revalidation; Phase4 transform/anchor/
projection reuse; ordering context/stable ties/revision cache; private mesh/texture
borrow cleanup; missing sources and Editor partial outcomes/late close; Client
independence; no DocumentSession/save calls in preview; manual asset provenance.
No critical dependency/ownership blocker established by this inspection. This is
not proof no runtime defect/use-after-free exists.

No renderer/cache/sorting duplication was found across project boundaries. Existing
legacy single-quad resource demo stays separate inside the canonical backend;
Phase8 meshes reuse that backend and Phase7 allocations. No late feature/fix is
inserted to improve status. Rollback is removal of these closure documents/pointers.

## Observed local verification

All listed checks ran successfully on the unchanged v0.8.13 production endpoint
while preparing this documentation commit. Required gates are repeated after
commit at the exact closure HEAD; exact SHA/results and both CI URLs are recorded
in PR #8 after push (a commit cannot contain its own SHA).

| Command / inspection | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | exit0; ARCH_CHECK_PASS, 133 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0; SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0; genuine Render/Editor/Client builds PASS |
| `npm run build -- --force` | exit0; forced five-project workspace build PASS |
| Strict portable package-root compile of eleven Phase8 manual consumers | exit0; no ambient DOM, no execution |
| Strict four-module MVP compile, exact runbook command | exit0; real declarations/typed wiring, no browser |
| TypeScript root declaration emission/comparison | exit0; 126->186 / 134->138 / 0->0; zero removals/changed old declarations |
| Original PNG/atlas manifest SHA-256 and length inspection | exit0; six source files match |
| Git phase scope, fifteen-version/report/task inventory and closure whitespace | matching documented scope; unrelated .mcp.json excluded |

Portable consumer compilation used the real compiler with `--ignoreConfig --noEmit
--strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes
--verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022
--lib ES2022 --typeRoots .artifacts/empty-types`, selecting these explicit files:

```text
runtime-render/manual/visual-scene-lifecycle.mts
runtime-render/manual/visual-instance-membership.mts
runtime-render/manual/visual-instance-operations.mts
runtime-render/manual/visual-instance-resource.mts
runtime-render/manual/visual-instance-transform.mts
runtime-render/manual/visual-instance-visibility.mts
runtime-render/manual/visual-instance-ordering.mts
runtime-render/manual/visual-instance-depth.mts
runtime-render/manual/visual-scene-frame.mts
runtime-render/manual/visual-lifetime.mts
editor/manual/scene-preview.mts
```

MVP consumer command is in the unchanged [runbook](../../runtime-render/manual/scene-mvp.md).
Existing Windows Harness DEP0190 warning remains; no unresolved failed/unconfigured
build. Architecture checking is a static import scan, not exhaustive runtime proof.
No tests, assertions, suite, runner, coverage, dependency or browser automation
created/run. Temporary declaration audit inputs/outputs remain ignored `.artifacts`.

## Not verified, deferred and Developer decisions

Browser NOT_EXECUTED: no independent visible seven-instance composition, frame
submission, stable handle mutations, correct atlas pixels/depth overlap, B/C survival
after A removal, cross-host disposal isolation, pending-close race or same-canvas
recreation observed here. No new runtime evidence replaces prior checkpoint gaps.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED; manual runbook remains reproducible.

Hand-authored 40300 atlas text is real parser-profile input, not exported TPSheet
compatibility proof: TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED for this MVP.
Full-height horizontal cells and binary alpha do not prove general packing/trim/
rotation/multipage/filtering/color/transparent-intersection correctness. Diagnostic
counts do not establish decode counts, speed, GPU health or memory reclamation.

Deferred outside Phase8: camera control, animation/VFX playback, hierarchical scene/
ECS/prefab, picking/culling/streaming, gameplay/network/authority and general 3D
transparency. These are not missing implementations to add during closure.

Recommendation: review this packet and perform actual manual MVP observations at
the selected SHA before accepting visual/runtime behavior or release. Developer
alone accepts/rejects/follows up and authorizes merge/release. No automatic main
edit, merge, tag, release, publication or next-phase implementation.
