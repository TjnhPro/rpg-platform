# v0.11.9 — VE10 Editor VFX Preview Integration

2026-10-24 Asia/Bangkok; branch `feat/visual-effect-playback-v0.11`, Draft PR11.
Prior VE09 HEAD `d020b98c5ad1827284cd00ec4c4d39d1e9cfc7a5`; phase main base
`aceea67f95cb309bdd06f1d6193767bfa06f42ce`. Containing checkpoint commit and
exact-head push/PR CI are recorded in PR11 after commit.

Requested behavior: a real Editor browser consumer selecting authored effect
references, creating/controlling/placing/attaching/removing preview instances.
Canonical primary owner **editor**. Collaborator Render is consumed through its
unchanged public root; existing Asset/Scene/Document owners supply authored data.
Production scope: new optional `editor/src/manual-vfx-preview.ts` and four manual
entry/server/config files; Editor runbook and Harness task/checkpoint/contract/
ownership documentation. No Engine/Client/Server/Render production edits, L1/L2
calls/edits, dependency/schema/CI/package change. Preexisting `.mcp.json` excluded.

Preflight inspected root/Editor AGENTS, ARCHITECTURE, FOUNDATION, Harness
OWNERSHIP/CONTRACTS/WORKFLOW/VERIFICATION/FAILURES, previous checkpoint and actual
Asset/Scene/Document/viewport and Render VFX/U1/atlas/cache/scene/camera sources.
Task authorizes this narrow consumer; no upstream contract delta or missing
foundation found. [Composition, ownership and runbook](../../editor/docs/visual-effect-preview-v0.11.9.md).

Declaration comparison against VE09: all emitted public root declarations remain
unchanged: Render339, Editor138, Client/Engine/Server0. Optional DOM entry is not
exported by the portable root. Strict manual TypeScript compilation consumes the
actual Editor/Render declarations with skipLibCheck:false; existing eight-way
animation semantics and all prior consumer roots remain unchanged.

## Real browser observations

Finite manual Playwright CLI actions in headed Chrome, real Three/WebGL2 and
existing Editor viewport host on localhost8780. No test file/runner/suite or
fake/generated media. Original sibling ani063 sources read unchanged:

| File | Bytes | SHA256 |
| --- | --- | --- |
| Attack1_0.tpsheet | 888 | fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 |
| Attack1_0.png | 12270 | f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 |

Explicit original frames0000/0002 at125ms each; explicit frame-local anchor/pivot
12,50; world right/down and plane units per pixel1:1. Monster imagery is a neutral
VFX capability sample, not actual aura art or production gameplay integration.

| Input / expected | Observed |
| --- | --- |
| Select repeat, wait for load | ready, no effect automatically created/played; target present |
| Create, Play, Step125 | stopped→playing; canonical frame0002/elapsed125; real frame submitted |
| Pause, Step, Resume | elapsed/frame frozen while paused; Resume accepts later explicit delta |
| Stop then Restart | stopped/reset0 with resource retained; restart playing |
| Attach offset35 to target110,170 | original target and effect pixels visible at distinct positions; attached.png inspected |
| Apply world245 and offset-10 | detached; effective pivot235,170 and origin223,120 |
| Remove | effect retired; target remains, shared lease/resource usable |
| Select unresolved authored reference | unresolved/TARGET_NOT_FOUND; no effect/target; cache CPU/GPU/leases0; no fake image |
| Once, Create, Play, two Step125 | completed at250; terminal effect/resources retired; historical frame result separately retained |
| Preview commands above | authored sameEnvelope/sameRevision/sameDirty all true; baseline revision1 and dirty=true preserved |
| Close | unmounted/no pending browser callback; disposed scene/cache, CPU/GPU/leases0, cleanupFailed false |
| Actual network latency4000ms, close while loading, allow settle | closed, loading false, no late effect/rebind/callback; no cache entries/leases |
| Second host8781 with absent asset directory | actual HTTP404→SOURCE_NOT_FOUND; failed media distinct from submitted blank frame; close clean |
| Real WEBGL_lose_context after Create/Play, final corrected source | CONTEXT_LOST; effect session-ended/cleanupFailed false; disposed scene/cache with0 entries/leases; no callback, no application console error |

An earlier context-loss observation exposed premature Editor cleanup from a
microtask between native listeners. Final code uses one cancellable host task
after dispatch; `context-loss-fixed.txt` supersedes `context-loss.txt` and
`context-loss-final.txt`. Final rerun showed no UNRECOGNIZED failure or effect
cleanup uncertainty. Console's sole initial error was missing favicon.

Ignored local evidence `.artifacts/ve10/`: initial/created/playing/paused/stopped,
attached.txt/png, position-offset, removed, unresolved, once-complete, closed,
pending-close, late-settled, source-unavailable/source-unavailable-closed,
final-playing, context-loss-fixed and public-audit.mjs; declaration inventory at
`.artifacts/ve10-public-audit.json`. Text observations are finite manual captures,
not automated acceptance assertions. `pixels:NOT_VERIFIED` remains in the UI;
the inspected screenshot supplies separate, limited visible-pixel evidence.

Not observed: actual hidden/visible transition (tab-switch attempt did not hide
the page), real unsupported/rotated/trimmed or multipage media, injected native
cleanup errors, native GPU-memory reclamation, GC collectability, restoration,
full Editor application-shell integration or production Player/skill effects.
These remain FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. Hidden pause/no-catchup
policy is source-audited, not claimed browser-observed.

## Gates and handoff

- `node harness/cli.mjs check` — exit0, ARCH_CHECK_PASS179 JS/TS.
- `node harness/cli.mjs scope --projects editor --allow-infra` — exit0.
- `node harness/cli.mjs verify --projects editor` — exit0, genuine Editor build
  and referenced Render dependency build; no unconfigured build.
- Strict manual entry compilation and five-root declaration audit — exit0.
- `git diff --check` / staged whitespace check — exit0.

Existing nonfatal Harness Node DEP0190 warning remains. No historical/exhaustive,
unit/integration/E2E/browser suite was run or added. Remote architecture, project
build and full workspace build jobs must match the checkpoint SHA; PR11 records
their actual results. Developer alone accepts the capability/phase.

Next is v0.11.10 Game Client VFX Integration, pending its supplied task.
No next-version capability, merge, tag, release or publication performed.
