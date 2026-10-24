# v0.11.0 VE01 — VFX architecture and contract foundation

**ARCHITECTURE_AUDIT_COMPLETE / API_DESIGN_ONLY.** No production VFX implemented.
**DOWNSTREAM_LIVE_PLAYBACK: BLOCKED_DEPENDENCY (U1 authorization/delivery).**
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED for VFX runtime, which does not yet exist.

## Baseline, scope and ownership

Date: 2026-10-24 (Asia/Bangkok). Exact fetched main/origin/main and branch base:
`aceea67f95cb309bdd06f1d6193767bfa06f42ce`, merge of Phase10 PR10. Prior checkpoint
SA13 is `a9a9a1d132649405c6b10f294b6a283cd9e7e7cd`; its architecture/build/consumer
and exact-head push/PR CI evidence is in [SA13](sprite-animation-v0.10.12.md).
Main merge CI [40058917912](https://github.com/TjnhPro/rpg-platform/actions/runs/40058917912)
completed successfully; builds are not independent product acceptance.
New single phase branch: `feat/visual-effect-playback-v0.11`.
The containing checkpoint SHA and exact push/PR CI links are entered in the phase
PR ledger after commit, avoiding self-referential committed hashes.

Canonical primary owner **runtime-render**: VFX presentation contracts. Harness
owns only the audit records. Editor/Client are read-only consumer audits; their
code/docs are unchanged. Engine/Server/L1/L2 are untouched; no foundation calls.
No changes to dependency direction, public contracts, schemas or implementations.
Task explicitly authorizes architecture-only work and forbids Phase10 source edits.

Read root AGENTS/ARCHITECTURE/FOUNDATION, relevant Render and consumer guidance,
Harness ownership/contracts/workflow/verification/failures, prior SA13 and actual
Phase4/6/7/8/9/10 source/emitted declarations. Route returned no reliable keyword
hint; source ownership, not routing keywords, establishes Render as owner.
Task's historical open PR7/unconfirmed later phases note is superseded by actual
merged source and root exports at the exact baseline.

Six scoped Harness Markdown files: this checkpoint, decision ledger, emitted API
inventory, supplied task, ownership pointer and contract pointer. No executable
Harness, project src/manual, package/lock/pin/config/CI or dependency changes.
Preexisting untracked `.mcp.json` and ignored local `.artifacts/ve01` are excluded.

## Delivered decisions and actual dependency gap

- [Source-backed decision ledger](../visual-effect-v0.11.0.md): independent authored,
  definition, effect-instance, playback and Phase8 drawable identities; six-state
  lifecycle, lease possession and remove semantics; Phase10 timing versus VFX
  lifetime; once/repeat policy table; plane/translation-only attachment and target
  loss; canonical resource/revision/release ownership; VE02–VE13 capability map.
- [Actual API inventory](../visual-effect-api-inventory-v0.11.0.md): every current
  root name, source/emitted counts and exact emitted single-track/live declarations.
  Render271, Editor138, Client/Engine/Server0; all manifest versions0.0.0.
- [Supplied task](../visual-effect-task-v0.11.0.md) preserved with Markdown trailing
  spaces normalized; specification remains separate from observations.

**Observed source fact:** Phase10 `SpriteTimedClip` and `sampleSpriteAnimationTiming`
already support one sequence and canonical timing. But `SpriteAnimationPlaybackInput`
requires `readonly EightWaySpriteClip[]` and a directionIndex; visual binding
requires that issued directional playback. No neutral single-track live transport
or binding root exists. The design collision is explicitly resolved by U1 rather
than eight cloned directions, unsafe casts or a VFX-private animation clock.

**Smallest required Developer decision (not implemented):** authorize an additive
single-sequence live playback and corresponding visual binding in Render's
Phase10 owner, consuming existing SpriteTimedClip and reusing one internal
transport/sampler/admission/lifecycle path. Preserve all old EightWay signatures,
unions and behavior; build Render/Editor/Client and compare old declarations.
VE01 is complete as an audit; live VFX cannot proceed before U1 approval/delivery.
VE02 pure definitions can use existing metadata after its own task is supplied.

## Actual verification

| Command / audit | Exit / observed result |
| --- | --- |
| `git fetch origin`; `git rev-parse HEAD origin/main` before branching | 0; both exact aceea67f95cb309bdd06f1d6193767bfa06f42ce |
| `node harness/cli.mjs route -- "visual effect playback instance attachment"` | 0; no reliable keyword hint, advisory only |
| `node harness/cli.mjs check` | 0; ARCH_CHECK_PASS, 174 JS/TS source files |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | 0; genuine BUILD_PASS runtime-render, editor, game-client; no failed/unconfigured build |
| `node .artifacts/ve01/inventory.mjs` | 0; TypeScript compiler enumerated source and emitted roots, counts/matches above; local audit utility only |
| `npx tsc -p .artifacts/ve01/tsconfig.json` | 0; strict public-root type consumer across Phase4/6/7/8/9/10, ES2022 only, types[], skipLibCheck:false, no DOM, no emit |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | 0; Harness docs only |
| `git diff --cached --check` | 0; scoped Markdown diff |
| `git diff --exit-code aceea67f95cb309bdd06f1d6193767bfa06f42ce -- runtime-render editor game-client runtime-engine game-server package.json package-lock.json harness/foundation-pins.json .github` | 0; all project code/public declarations/package/pin/workflow source unchanged |

Existing Harness Node DEP0190 shell child-process deprecation warning was emitted;
it did not fail builds. Render consumers were genuinely built despite zero public
delta. Engine/Server local builds were not rerun for this docs-only checkpoint;
fresh phase-PR CI independently covers all five. No unit/integration/browser/UI/
snapshot/E2E tests, assertions, runners, matrices or coverage were created/run.
The local inventory and type-only consumer are manual contract audit artifacts,
not production APIs or test suites, and are not committed.

## Acceptance boundaries and next handoff

Actual evidence: source/declaration inspection, compiler root inventory, static
architecture/scope and real builds/consumer compilation. Not observed: VFX runtime
transitions, numeric lifetime execution, attached motion, effect pixels, release
outcomes or native memory reclamation. They are future contract requirements,
not behavioral PASS. Prior Phase10 sprite observations are not VFX evidence.

VE01 has no unresolved owner collision: VFX coordinates effect lifetime, Phase10
owns animation; the missing live seam has an explicit upstream gate. Developer
approval is still required before changing that public surface. This audit does
not authorize a new API, auto-merge, release, tag, publish or external repo edit.
Next specified task (not yet supplied): v0.11.1 Effect Definition & Visual Asset References. No next
capability has been implemented speculatively; full Phase11 acceptance is pending.
