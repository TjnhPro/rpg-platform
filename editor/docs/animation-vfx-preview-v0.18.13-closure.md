# Phase18 integration and closure packet

Status: READY_FOR_DEVELOPER_REVIEW, not Developer acceptance or release.
Base f528300e03a5efa07b99c47c6907167ce7eb88f3; branch
feat/animation-vfx-preview-v0.18. AP13 parent of closure: 9d12ce3.
[Frozen design](animation-vfx-preview-v0.18.0.md),
[task manifest](tasks/phase18-animation-vfx-preview/MANIFEST.md),
[finite UI recipe](animation-vfx-preview-v0.18.12.md).

## Ordered implementation and evidence

Each row has its matching harness/checkpoints/animation-vfx-preview-v0.18.N.md.
Those checkpoints record actual commands and finite observations at that version;
earlier absence of UI/resource evidence is not retroactively upgraded to full PASS.

| Version / capability | Commit | Source / requirement | Positive and negative evidence | Remaining limit |
| --- | --- | --- | --- | --- |
| .0 AP01 | 391972a | design, task copies, Harness owner pointer | Phase15-17 source present; unavailable assumed private Render API rejected | design only |
| .1 AP02 | 0e13df6 | context.ts | current project/root/catalog/provider tickets; late A rejected, B retained, release1 | no IO at this stage |
| .2 AP03 | a1cd28f | atlas.ts, atlas-observe.mjs | real NormalStand1 PNG7096/TPSheet795 bytes; 8 actual keys; wrong revision/key unresolved | dimensions metadata-only |
| .3 AP04 | 75243c4 | clips.ts | eight actual pages, counts8/7/8/7/8/7/8/7; two clips; nine slots/foreign project rejected | compass unverified |
| .4 AP05 | 0f254a3 | sprite.ts | play300/pause/Step500 retains300; direction7 frame0110; resume450; invalid delta/disposal rejects | no independent playhead |
| .5 AP06 | 2351606 | config.ts | speed0.5/1/2 yields100/200/400; FPS equivalent; invalid timing/speed rejected | source FPS unknown |
| .6 AP07 | 50d6c9b | effect.ts | real Attack1 sequence resolves; fake revision/projectile/foreign frame rejected | definition admission only |
| .7 AP08 | 1cc57ed | effect-instance.ts | real Render VFX play/pause/wrap/restart; once completion removes membership; duplicate ID rejected | no pixels at this stage |
| .8 AP09 | 99a7648 | resource.ts, asset host seam, finite host | real sprite/VFX frame bindings; stale revision/frame reject; zero cache/leases after dispose; wrong role/path denied | trusted finite loopback host |
| .9 AP10 | 51756f9 | alignment.ts | actual32x56/31x55; explicit anchor produces ground23,34; missing origin/foreign plane rejected | artist ground/trim/original unknown |
| .10 AP11 | 1d1131b | scene.ts, Placement callback | real sample Map bridge target100,100; world120,100/attach3,4/detach; unknown target rejected; Document untouched | sample API Scene, not Shell Scene review |
| .11 AP12 | cd82b7c | viewport-host.ts, preview-clock.ts | actual browser316.9ms pause/unavailable stays fixed; resume417.2; dispose no pending callback/failures | actual tab/loss interaction unobserved |
| .12 AP13 | 9d12ce3 | Panel/controller/finite-sample, App, exact checker seam | real UI sprite+VFX bound playback; eight-way once1050/frame0118; paused Step unchanged; A/B reset; one visible sprite frame inspected | full UI/Scene/VFX pixels not accepted |
| .13 AP14 | this closure commit | this packet and checkpoint only | five builds, forced root build, source/public/protected-path/ordering audit | exact remote head CI recorded in PR handoff |

The .ts module names above have prefix editor/src/animation-vfx-preview-.
AP13 UI modules are under editor/ui/src/features/animation-vfx-preview/.
The final ordered history has fourteen capability commits (.0 through .13), with
one checkpoint introduced per commit. Closure's own hash is the final PR head,
avoiding a circular self-hash inside committed content. No squash/merge is used.

## Owner, public surface and protected-path audit

Editor remains the sole production owner. Runtime Render owns canonical clip
capture, direction, timing sampling, playback transitions, effect lifetime,
atlas parser/revisions, cache/leases, visual instances/attachment, camera and draw.
Editor forwards transient commands/deltas and binds read-only authored references.
There is no new Engine rule, authored animation storage, clip persistence, schema,
dependency, gameplay event, renderer, Shell, provider/theme or production project.

Against base: zero changes in runtime-engine, runtime-render, game-client,
game-server, package.json, package-lock.json, .github, and editor/src/index.ts.
L1/L2 remain pinned external read-only packages. Portable root exports/declarations
are unchanged; local adapters emit only internal module declarations. Existing
viewport-host gains optional availabilityChanged and createEditorPreviewClock;
Placement Workspace children gains a borrowed validated DocumentSession argument.
Both are same-Editor UI composition seams, not package-root Render-handle exports.

Named existing deltas: asset-browser/host.ts adds bounded metadata role/media
support; viewport-host coordinates playback availability; Placement passes the
current document; App selects the single active viewport. The Developer separately
approved check-ui-contract.mjs's ten-name allowlist. It only admits the emitted
forms of those exact Editor source adapters from the Phase18 feature. All other
UI rules remain active. Emitted modules avoid duplicate source/package registries.

No preview production module calls authored mutation/save/dirty acknowledgement.
Project/Asset/Document objects are borrowed; controller owns only preview scene,
camera, bindings, playback/effects, cache and acquisition rights. Timing, repeat,
speed, clip and alignment values remain transient. Sample Project/Asset documents
in the optional host are ephemeral read-only examples, not an authored migration.

## Host and lifetime audit

Host token/origin/root and finite lexical path/role checks precede bounded file
reads. Symlink entries reject. Revisions are SHA256 of actual original bytes;
metadata requires explicit permitted media/role, never filename-based FPS/compass
inference. The host is trusted loopback tooling, not hostile-filesystem race or
durability proof. B has no resource grant; arbitrary path, wrong role, foreign
scope and source-revision mismatch have explicit negative evidence.

Context tickets guard project revision, owner/root, immutable catalog/generation,
selection, provider and authorization generation. Selection retirement drains
registered owners; UI replaces content on changed binding/document revision.
Source and resource results revalidate after await. Pending loads/leases release;
changed frame/generation rejects before binding. Clock serializes async present,
stops on hidden/unavailable, bounds delta100ms and resets timestamp on explicit
resume. Native viewport alone acquires/submits/resizes. Cleanup drains bindings,
playback/effects, target bridge, resources/cache, camera and scene before viewport
session disposal. Cleanup failure remains CLEANUP_UNCERTAIN, including failures
stored by context retirement. No borrowed Project or authored target is disposed.

Observed teardown: AP02 late context, AP09 zero entries/leases, AP11 retained
authored object, AP12 closed/no callback, AP13 asset swap/A-to-B UI reset. Actual
pending-network A-to-B Shell race, all clip-switch timings, context-loss browser
interaction and every GPU cleanup path remain NOT_CHECKED as product review.
Canonical guards/source audit are evidence of implementation, not those observations.

## Genuine gates and acceptance limits

Executed locally with exit0 on the final production source: harness check283,
scope --projects editor --allow-infra, Editor verify --with-consumers including
ui:check24 and authentic TS/Vite build; full verify of runtime-engine,
runtime-render,editor,game-client,game-server --with-consumers (all five BUILD_PASS),
and npm run build -- --force. No unconfigured/failed final build. Existing Vite
chunk-size and Node DEP0190 warnings remain. No tests/runners/dependencies added.
Final docs-only head receives remote Foundation build CI; exact SHA/run outcomes
must be read from the PR handoff, not inferred from any earlier green run.

SOURCE_LOADED, FRAME_INVENTORY_OBSERVED, SPRITE_PLAYBACK_OBSERVED and
VFX_PLAYBACK_OBSERVED have finite authentic source-bound evidence. FRAME_BOUND
is canonical binding, not pixels. SCENE_PREVIEW_OBSERVED applies only to the
explicit sample Map/API scenario. UI_INTERACTION_VERIFIED applies only to the
recipe's finite flows. One sprite screenshot was directly inspected; full
PIXELS_VISUALLY_VERIFIED, VFX pixel/alignment and in-Scene UI acceptance are open.
Artist FPS/compass/ground, trimmed/untrimmed origin and full visual correctness
remain PROVENANCE_NOT_VERIFIED. No durability or gameplay claim.

Manual product acceptance belongs to Developer. No automatic merge, tag, publish
or Phase19 work. This packet exposes the remaining review surface rather than
equating green builds or a submitted frame with complete feature acceptance.
