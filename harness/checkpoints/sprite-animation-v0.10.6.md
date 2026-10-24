# v0.10.6 SA07 — frame origin and alignment

**IMPLEMENTED_PURE_FRAME_ALIGNMENT / FINITE_CPU_OBSERVATIONS / VISUAL_NOT_VERIFIED.**
No GPU/Visual Instance binding or Phase10/Developer acceptance claim.

## Delta preflight and scope

Previous checkpoint/HEAD/upstream: `6961c24b405353d3bd56018eebf58379ea49a476`.
Main baseline: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same branch
`feat/sprite-directional-animation-v0.10`, open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). The containing commit's
full SHA and completed exact-head CI are recorded in that PR ledger after push.
Tracked tree/index initially clean; preexisting untracked .mcp.json excluded.

Delta-focused preflight read root/Render/consumer guidance, architecture,
foundation, Harness ownership/contracts/workflow/verification/failures and SA06
report/source/emitted APIs. Inspected actual Phase4 visual-alignment/affine/plane
APIs, Phase7 atlas-metadata/frame/geometry and Phase8 instance-transform source.
Actual Phase8/9 source remains present, without any new dependency needed here.
Route hint agrees with source ownership: **runtime-render** is the sole primary
owner. Editor supplies authored metadata; Editor/Client are public compilation
consumers, with no source edits. No L1/L2/L3 imports, edits or API requirements.

Supplied task authorizes the additive pure alignment seam. Scope: one Render
module/root export, API/task docs, this checkpoint and Render/Harness guidance.
No owner/dependency/package/lock/build/CI/schema changes or sixth project.
Phase7 parser/geometry and Phase4 contracts remain unchanged. No image/crop,
native drawing, playback, instance/layout/cache/lease or authored position writes.

## Contract and metadata decisions

Four additive public names: resolveSpriteFrameAlignment,
SpriteFrameAlignmentData, SpriteFrameAlignmentInput, SpriteFrameAlignmentResult.
Old exports/signatures/unions unchanged. One request carries canonical
geometry/atlas/current revision plus explicit placement plane, orientation,
positive finite per-axis unit ratios and verified authored per-frame pixel
anchor/pivot/offset. Exact frame/revision and nonblank provenance required.

The [API document](../../runtime-render/docs/sprite-animation-v0.10.6.md)
records source inspection, actual official exporter paths/hash/formulas,
conversion, failures and numerical limitations. Raw sourcePivot is normalized
exported-frame, bottom-left, x right/y up, including negative/outside0..1 values.
Keep it unchanged and independent of authored ground/pivot. Geometry remains
top-left pixel rectangle/first-uploaded-row UV, rotation none, trim/sourceSize
null. Neither null means zero trim or original source bounds.

Missing authored alignment/provenance yields FRAME_ORIGIN_UNAVAILABLE; no
automatic center, pivot designation, inferred source size or original-layout
fallback. Explicit author data uses frame-local top-left pixel edges, x right/y
down. Ratios/signs convert once into plane units, then existing Phase4
createVisualAnchor2D/resolveVisualAlignment2D/applyPlanarPoint2D produce frozen
anchor, origin/pivot and affine pixel-to-plane mapping/mapped ground. Negative
offsets/pivots remain legitimate. Orientation must match plane axes and, like
Phase4, does not rotate offsets. Frame origin is unrelated to sequence start.

Canonical geometry identity and atlas revision gate the calculation. Typed
rejections distinguish missing provenance, mismatched frame/revision, invalid
geometry/plane and overflow. Malformed/nonfinite input or nonpositive ratios
throw TypeError. Unknown host exceptions propagate. No partial mutation, handles
or cleanup ownership. Host attests authored correctness/current token; Render
cannot prove artist intent or external freshness from a string/token alone.

Binary64 rounding/cancellation/subnormal underflow apply. No snapping, epsilon,
integer-coordinate cutoff or universal exact equality guarantee. Every computed
point must be finite before publishing; overflow is NONFINITE_CONVERSION.

## Actual verification

| Command / audit | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS164 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; preexisting .mcp.json excluded from commit |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, genuine Render/Editor/Client BUILD_PASS; no failed/unconfigured builds |
| npx tsc -p .artifacts/sprite-animation-v0.10.6-tsconfig.json | exit0, strict ES2022/NodeNext public-root consumer; types:[], no DOM |
| node .artifacts/sprite-animation-v0.10.6-public-audit.mjs | exit0; emitted declarations against SA06 Render263->267 (+4), Editor138/Client0 unchanged; zero removed/changed old exports |
| git diff --check | exit0 |

Actual emitted module/root declarations inspected. Existing Harness Node DEP0190
warning did not fail builds. Exact-head CI follows this commit in the PR ledger;
prior SA06 CI is not SA07 evidence. No automated tests/runners/matrices added/run.

## Finite public-root manual observations

One-off .artifacts/sprite-animation-v0.10.6-manual.mts under Node24, exit0;
prints observations without assertions or a test suite. Actual read-only source:
../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.tpsheet,
888 bytes, SHA256
`fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`.
Original PNG12270 bytes, SHA256
`f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2`;
IHDR128x256 used as host-attested dimensions (not PNG decode evidence).
Real Phase7 load/parser/revision/geometry resolution, metadata load released.
No source redistribution/sibling writes, fake images or invented frame IDs.

INPUT: frames0000 and0002, legitimate rectangles(78,1,32,56)/(71,59,31,55).
Explicit manual authored pixel grounds(12,50)/(13,49), independent pivot(-3,7),
same offset(-4,6), placement(100,200), right/up metre plane, ratios(.25,.5).
The caller explicitly designated these finite edge coordinates for a numeric
contract observation, checked against the actual frame rectangles; they are
not a claim about anatomical feet/artist-authored ground in the original artwork.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Two differing frame bounds/anchors, same explicit target ground | Origins vary; mapped world ground agrees | Origins(96,222)/(95.75,221.5); both ground(99,197) |
| Independent authored pivot(-3,7), negative offset | Preserve finite signs/conversion | Local pivot(-.75,-3.5), local offset(-1,-3); world pivots(95.25,218.5)/(95,218) |
| Original sourcePivot per frame | Exact original values, no clamp |0000(-4.65625,-2);0002(-4.83870967741936,-2.09090909090909), equality true |
| Canonical frame/revision and frozen output | Preserve exact identity/history | Output geometry===input true; revision===token true; result/ground/anchor frozen |
| trim/sourceSize null with authored null; blank provenance | Honest unsupported | FRAME_ORIGIN_UNAVAILABLE for both |
| Other authored frame/revision | Reject binding | ALIGNMENT_FRAME_MISMATCH |
| Wrong current token; copied geometry | Reject provenance | ATLAS_REVISION_MISMATCH; INVALID_FRAME_GEOMETRY |
| Foreign plane project; orientation axis disagreement | Reject incompatible context | INCOMPATIBLE_PLANE for both |
| NaN pivot; Infinity ratio; zero ratio | Reject invalid numbers | TypeError for each |
| MAX_VALUE ratio; finite input whose origin addition overflows | Reject before publishing | NONFINITE_CONVERSION for both |
| Same frame/data in left/down plane | Explicit axis signs | origin(104,178), local pivot(.75,3.5), ground(101,203) |
| Before/after atlas/requests/source hash | No mutation | Serialized input comparison true, source hash unchanged |

NOT_OBSERVED: actual artwork foot contact, browser/GPU pixels, PNG decode,
Visual Instance/native binding, rotation/scale/Camera application, frame changes
on screen, eight actual artwork directions or gameplay state. The isolated
calculation imports no gameplay state and acquires no textures; no live GPU or
gameplay object was present to observe. Numeric contract evidence does not
establish visual ground stability for the asset or a Phase10 MVP_PASS.

## Handoff

No SA07 dependency blocker; pure alignment is ready for the separately supplied
v0.10.7 Visual Instance binding task. That task has not been supplied; no next
scope implementation or routine acceptance pause. No merge/tag/release or
Developer acceptance. Revert this additive commit to roll back; no persisted
document migration or GPU cleanup is necessary.
