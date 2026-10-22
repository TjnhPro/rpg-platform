# v0.3.5 — Placement Data Foundation (SC08)

READY_FOR_DEVELOPER_REVIEW; Developer owns acceptance. Stop before v0.3.6.

## Preflight and scope

Started at v0.3.4 eb8f4bd145eec403702e8a1e51ea2465ab8a57ae on
feat/editor-render-scene-contracts-v0.3, continuing Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3.
Developer supplied this next scoped task. Phase 1 PR #1 verified MERGED at
4cec85b5a00e2477f00eee29e2da6025a532e973; Phase 2 PR #2 verified MERGED at
fea9b734b849fa1c6bc953530e1fa425d43cfca8 (exact Phase 3 branch base).

Read root/project guidance, architecture, foundation, ownership, contracts,
verification/workflow, actual Scene/Object/membership and Asset/Render public
surfaces/manifests, and v0.3.0 Feature 04 boundary decisions. Phase 1 Render binds
hosts/submits a frame; it has no coordinate-space authority. Authored placement
must be distinct from gameplay movement, matrices, camera or screen conversion.
Editor started with 63 root symbols, Render 17. Editor alone needs source edits;
no cross-project API change or L1/L2 API is required. Foundations remain read-only.

Eight paths: editor/src/scene-membership.ts, src/index.ts,
manual/scene-placement.mts, manual/README.md, AGENTS.md; root README;
harness/CONTRACTS.md and this checkpoint. Infrastructure allowance covers docs.
Exactly five projects; no Engine/Render/Client/Server source, dependency graph,
manifest/lockfile, package version/export map, checker or workflow changes.

## Minimal contract decision

One new public type: SceneObjectPlacement. Membership input/result gain optional
placement, leaving all prior required fields/signatures unchanged. Scene/Object
identity/definition, Asset references, layer and attachment semantics are preserved.
Editor 63 -> 64 root symbols, Render remains 17.

Placement is coordinateSpaceId plus point { x, y }. The exact caller-selected space
key is nonempty/whitespace-free and case-sensitive, without trimming or generation.
Both point slots must be finite numbers, with no coercion, bounds, rounding or
normalization. Negative/fractional values and zero are structurally valid. Input
records must be nonnull nonarray objects. The factory captures known construction
fields into fresh frozen placement/point records, never retaining caller references.
Invalid structure throws TypeError; unrelated host exceptions propagate.

Omitted placement stays absent, preserving old entry shape; explicit null stays
null. Objects need no placement, Asset or backend. Existing create/add/reorder
recapture the optional field. A replacement candidate can already be constructed
with createSceneMembership, so no new mutation API is justified in this checkpoint.
General Scene mutation orchestration remains v0.3.6.

This is a numeric pair descriptor, not a definition of universal 2D/2.5D space.
Names x/y select data slots only; units, axis directions, origin, dimensions of
future space definitions, space existence/compatibility, projection and conversion
are DEFERRED to Spatial Feature 04 and Camera Feature 09. Unknown space IDs are
retained without claiming resolution. No screen-pixel/GPU types, camera, grid,
map tile coordinates, local/world transform, depth sorting, snapping or collision.
No framework research is needed to invent those deferred semantics.

## Manual evidence and stress cases

Optional public-root consumer strict-compiled and ran with exit 0. Finite output
MANUALLY_OBSERVED:

- lantern captured author-space-a / (12.5, -3); glow independently captured
  author-space-b / (-8, 25). No definition or space lookup was required.
- Input unchanged, caller mutable, placement/point detached and placement/point
  frozen observations all printed true. Editing caller key/x left capture intact.
- Replacement candidate held author-space-c / (4, 6) after caller y was edited to
  100; original retained author-space-a / (12.5, -3). Object identity, Asset target
  and decorations layer stayed the same.
- Add/reorder retained both placements and the glow-to-lantern attachment, while
  text-only object had just definition/assetReference keys. Empty membership and
  explicit null placement were valid without injected coordinates.
- Empty/whitespace space keys, NaN, Infinity, string x and missing point printed
  TypeError; source count stayed 2.
- Final marker AUTHORED_PLACEMENT_DATA_ONLY / SPACE_NOT_RESOLVED / NO_CONVERSION /
  VISUAL_NOT_VERIFIED.

No tests,
assertions, runners/helpers, coverage, test matrix or automatic runtime CI job.

DESIGN_ONLY: text remains coordinate-free; the same Scene can hold caller references
to different future 2D/2.5D authoring spaces without this task interpreting them.
Such references do not prove interoperability. Future transforms must extend a
scoped contract without changing Scene identity; no transform component is added.

## Verification and limits

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 38 JS/TS files; static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; eight declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0; all five projects |
| Strict NodeNext public-root compile | Exit 0; placement and four prior Scene consumers |
| Optional placement consumer Node execution | Exit 0; finite observations above |
| Actual emitted declarations/root inventories | Editor 64 / Render 17; source/declaration exports match; one additive type, no removals; actual built Editor root resolves |
| git diff --check | Passed |

No failed/unconfigured build. Existing Windows Harness DEP0190 warning unchanged.
Manual commands are in editor/manual/README.md. The actual .d.ts contains optional
placement and readonly scalar point data only, with no GPU/browser type dependency.
Resulting commit
and exact-head push/PR CI evidence go in PR #3, avoiding a self-referential SHA.
Builds/static checks do not establish functional/visual PASS. Coordinate semantics,
space resolution/conversion, rendered placement, animation, gameplay movement,
file IO/persistence and product UI remain NOT_VERIFIED/DEFERRED.
