# v0.7.3 — VL05 PNG & Image Decoding Foundation

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED**.
Browser decode and bitmap cleanup acceptance remain pending observation.

## Baseline and authorization

- Starting HEAD: `d2e6c8aab13996b34c112020dd2427a6d5361f72` (v0.7.2).
- main/origin main: `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
- Branch: `feat/visual-resource-loading-v0.7`; existing draft PR#7, open.
- v0.7.2 push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39903776907)
  and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39903780779),
  both exact starting HEAD. Prior checkpoint is implemented, not formally accepted.
- Developer-supplied [task](../../runtime-render/docs/tasks/visual-loading-v0.7.3.md)
  authorizes additive PNG decoding/public contract and the finite manual consumer.
  No additional checkpoint review gate or next-task implementation is inferred.
- Pre-existing untracked `.mcp.json` remains unread/unmodified/excluded from commit.

## Preflight and ownership

Read root/project agent guidance, architecture, Foundation, Harness ownership,
contracts/workflow/verification and preceding Phase7 checkpoint. Audited actual
provider/source lifecycle, root declarations, graphics disposal, Three backend,
Editor visual/reference contracts, manual consumers and Client root/host. Exactly
five projects and original package-root dependency directions remain.

Canonical primary owner: Runtime Render, for PNG inspection, native decode and
private bitmap lifetime. Editor owns authorized read-only manual sample hosting;
Client is compiled as public consumer. No Engine/Server/L1/L2 capability needed,
no changes to gameplay, authored Assets/Scenes/Documents, graphics sessions or
package manifests/lockfile/Harness checker/config/CI workflow. Supplied task
approves this additive surface; no breaking API or owner movement was needed.

Actual backend: Three0.186.1/@types0.186.0; ImageBitmapLoader source uses native
createImageBitmap plus fetch/Cache. Use native decoder inside Render directly to
keep authorized provider IO separate and avoid introducing URL/cache semantics.
Browser lib already exists in Render's tsconfig; no dependency changes needed.
Primary [HTML ImageBitmap](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#imagebitmap)
and [PNG3](https://www.w3.org/TR/2025/REC-png-3-20250624/) specifications audited.
No existing PNG or TPSheet was found at preflight. The task permits adding an
original PNG demo asset; no invented atlas format/parser is provided.

## Scoped changes and exact public delta

Eleven task files:

- Render `src/png-image.ts`, `src/index.ts`: new native decoder lifecycle and
  five additive root exports; prior source/prepare/graphics APIs unchanged.
- Render `docs/visual-loading-v0.7.3.md`, `docs/tasks/visual-loading-v0.7.3.md`:
  contract, limits, ownership, source specifications and supplied task.
- Editor `manual/png-image.mts`, `.html`, `.md`, `manual/README.md`:
  optional finite public-root consumer, bounded read-only host and guide.
- Editor `manual/png-sample/rgba-2x2.png`, `manual/png-sample/README.md`:
  original CC0 demonstration image and provenance.
- This checkpoint report.

Root exports Render80 →85; Editor134/Client0 unchanged. Added exactly:
`createPngImageDecode`, `PngDecodeLimits`, `PngDecodeFailure`,
`PngImageObservation`, `PngImageDecode`. Emitted root declarations counted using
TypeScript checker. No existing public declaration was edited except root additions.

Source copy and image lifetimes are independent; no native bitmap escapes the
handle. Each handle owns one bitmap with at most one close attempt; pending release
closes any eventual bitmap without revival. Fixed orientation/alpha/color options
are included in decoder identity. Native errors retain original identity and safe
failure:null; known admission failures have codes. Budgets apply before native
decode and to decoded dimensions. Details/limits are in the contract.

## Build/static evidence

All final commands exit0:

| Command / gate | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | BUILD_PASS |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS, 84 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS12 (11 task paths + excluded .mcp.json) |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | Three independent BUILD_PASS |
| `npm run build -- --force` | All-five workspace BUILD_PASS |
| Strict ES2022/DOM compile of optional manual entry, guide command | PASS |
| Strict ES2022, types[], skipLibCheck:false root consumer compile | PASS; all five additions resolve without DOM |
| Import root with throwing browser-global getters; metadata preparation | PASS; no browser accesses, NOT_PERFORMED |
| `git diff --cached --check` | PASS |

No final failed/unconfigured build. Existing Windows DEP0190 warning is non-failing.
No tests/assertion suites/runners/browser automation/dependencies were added or run.
Exact new commit and push/PR CI results are appended to the same PR ledger after
push; no SHA or remote success is fabricated in this committed report.

## Finite manual observations and gaps

Executed the guide's bounded read-only Node consumer. Actual original PNG:
76 bytes, SHA-256
`e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79`;
documented IHDR2x2/depth8/RGBA. File hash is unchanged after the consumer.
Metadata-only preparation returned NOT_PERFORMED with zero provider reads.
Actual scoped provider returned source-acquired with 76 bytes/mediaType:null.
Two independent decode handles entered requested/pending then failed
DECODER_UNAVAILABLE under Node24.18.0; repeated release stayed released.
Late completion snapshot after release stayed released/cleanup:not-needed.
Signature-corrupted copy returned NOT_PNG; truncated copy INVALID_PNG;
one-pixel budget rejected the2x2 image as DECODE_LIMIT_EXCEEDED.
Corrupt-zlib copy also reported DECODER_UNAVAILABLE, **not** browser rejection.
Total provider reads6; all final handles released. No pixel decode occurred.

Computer-use surface inventory returned apps[]/browsers[]. Therefore the supplied
browser manual consumer is compiled but unexecuted. Native decode success2x2,
native corrupt-stream rejection, source/image independence after real decoding,
late native bitmap close, exact close-call counts, alpha/color pixel behavior and
memory reclamation have **not** been observed. This is a verification gap allowed
at an intermediate checkpoint, not architecture acceptance or FUNCTION_PASS.

No GPU upload/display/cache/dedup/lease/TPSheet/parser/session integration. Browser
decoder only; no headless decode promise. Container preflight is not a full PNG
CRC/semantic validator, and dimension/byte budgets cannot strictly bound browser
intermediate memory, metadata inflation or CPU time. No absolute leak-free claim.
Developer owns manual review and phase acceptance. No merge/release/publish and
no v0.7.4 task implementation bundled.
