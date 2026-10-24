# VE10 — optional Editor VFX preview

Editor owns the browser composition in `src/manual-vfx-preview.ts`, mounted by
`manual/vfx-preview.mts`. This is the minimal real Editor browser consumer, not
a VFX Designer or an integration into a larger Editor application shell. It is
deliberately absent from the portable package root, like the animation preview.
No Render source/public declaration, dependency or authored schema changes.

## Run with authorized original assets

From the repository root:

```powershell
node harness/cli.mjs verify --projects editor
node node_modules/typescript/bin/tsc -p editor/manual/vfx-preview.tsconfig.json
node editor/manual/vfx-preview-host.mjs
```

Open `http://127.0.0.1:8780`. Default asset directory is the sibling
`jx1-manager-editor/data/asset-sources/monster/ani063`; optionally pass an explicit
authorized directory and port as the first and second server arguments. The
server reads only the two whitelisted atlas sources and local emitted modules;
it does not copy media, modify another repository or generate replacement assets.
Missing assets produce an explicit source failure. Dependencies must already be
installed and their workspace outputs built. Stop the server with Ctrl+C.

Select repeat/once, wait for ready, Create, Play, Step125. Only the Step command
supplies `deltaMs`; there is no autonomous playback loop. Pause freezes canonical
playback, Resume reactivates the existing viewport, Stop retains the effect for
restart, and once completion retires it. Edit world position/offset and Apply to
detach; Attach uses the optional authored Scene visual at110,170. Remove releases
the effect while preserving the target; Close releases the whole mount.

## Canonical composition and lifetime

| Responsibility | Existing owner/API path |
| --- | --- |
| Authored identity | Editor `AssetReference`, `resolveAssetReference`, `describeResolvedVisualAsset`; explicit catalog/provider grant |
| Optional target | Editor `describeSceneObjectVisual`; only matching resource and coordinate space admitted |
| Definition boundary | Render `createVisualEffectDefinition`, `resolveVisualEffectDefinition`; explicit frame IDs and125ms timing, no inferred tagging/FPS |
| IO, revisions and atlas | Phase7 `createVisualSourceLoad`, `parseUnityAtlasMetadata`, cache/lease; SHA256 source revisions and exact atlas revision |
| Playback/placement/attachment/frame | Render effect commands, advance, world placement, attachment and sync; U1 canonical single-sequence implementation |
| Scene/camera/frame | Phase8 scene, Phase9 camera binding, existing Phase6 `mountEditorViewport` composition seam; no renderer/clock/cache duplicate |
| Document | Canonical document session baseline; no preview command replaces content, saves or acknowledges a revision |
| Teardown | Remove effect, unbind/dispose target playback, remove target, release host lease/source loads, camera binding/camera/scene/cache, viewport/session |

The existing viewport host owns its one browser frame callback, measurement and
visibility suspension. Hidden previews pause playback; returning requires explicit
Resume and supplies no elapsed catchup. The context-loss handler schedules one
cancellable host task after native event dispatch, so Render finishes its terminal
broadcast before Editor revokes IO and unmounts. A microtask can run between native
listeners and is insufficient here. This task never advances animation.

Close invalidates async generation before cancelling listeners/IO and unmounting.
Late loads and leases are released in finally, never adopted into a closed mount.
All cleanup operations are attempted; unknown cleanup failures remain visible.
No Client session or game execution is acquired by this preview.

Diagnostics keep `loadState`/failure, current effect lifetime, historical
`lastFrameResult`, historical `lastFrameReceipt`, and `pixels:NOT_VERIFIED` separate.
A submitted blank frame is possible while loading/failing. Historical bound or
submitted results are not current resource or visible-pixel guarantees. The sample
document begins revision1/dirty=true; preview preserves those values, rather than
claiming that newly created content was saved/clean.

## Finite observations and limitations

See the [checkpoint](../../harness/checkpoints/visual-effect-v0.11.9.md) for exact
asset identities, observed commands and unobserved actions. Original monster pixels
demonstrate neutral effect playback, not an artist-authored aura or production
Player/skill integration. Explicit frame-local anchor/pivot12,50 and ratio1:1 do
not assert anatomical ground, trim support or untrimmed origin. Manual product
acceptance remains Developer-owned; no automated browser/test suite is provided.
