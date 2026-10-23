# TASK — RPG Platform v0.8.7: Visual Layers & Explicit Ordering

**Phase:** 8 / 20 — Scene Rendering & Visual Instances
**Version:** `v0.8.7` · Milestone 8/15 · Feature IDs: **SR09, SR10**
**Primary owner:** `runtime-render`
**Repository:** https://github.com/TjnhPro/rpg-platform
**Delivery:** one phase / one branch / one PR; each version = one scoped checkpoint commit. Execution may proceed continuously to MVP/closure, without intermediate Developer reviews.

## Objective & authorized version scope — v0.8.7 only

**Goal:** Visual Layers & Explicit Ordering. Implement just the incremental behavior below, reuse the approved existing contracts; don't fast-forward features from later versions to make demos appear complete.

**Input prerequisite:** `v0.8.6` checkpoint and exact current repo reality, not task prose. A green build isn't behavioral verification. **Output:** implementation/design delta + compiled public consumer if appropriate + honest evidence + own version report and commit.

### Required implementation decisions / work items

- Thiết kế minimal typed render-layer definition với stable layer key, explicit priority và optional visibility; đây là runtime/presentation layer, **không phải authored scene `classification` hoặc Gameplay category**.
- Explicit order/priority ở phạm vi layer; record deterministic insertion ordinal cho ties, độc lập timing của image loads hoặc object update order; API create/assign/reorder phải giữ stable instance identity.
- Định nghĩa layer behavior khi missing/reassign/delete (reject vs fallback phải explicit), duplicate layer IDs, priority collisions, gaps và negative values; không tự tạo global sorting layers registry.
- Group objects vào ordered draw candidates theo layer priority + explicit per-instance order + deterministic stable tie; không dùng JS Map iteration ngầm làm contract nếu sort semantics chưa công bố.
- Khi layer visibility bị off, không xóa instance/texture; transparency/depth sorting hoàn thiện version sau.
- Editor sau này có thể map authored visual layer refs sang neutral presentation layer keys; Render không được import Editor scene-layer types.

### Observable acceptance — v0.8.7

- [ ] Hai layers có priority khác nhau sắp xếp có thể dự đoán.
- [ ] Reorder một instance giữ ID/resource, không recreate.
- [ ] Equal priorities/explicit order dùng stable deterministic tie (ordinal/identity đã được công bố).
- [ ] Missing layer/duplicate layer/invalid order có typed rejection, state trước đó còn nguyên.

### Exclusions specific to this version

- Không xây map tile layer editor, UI inspector, lighting layers, compositor passes hay universal global layers registry.

**Checkpoint outcome:** `READY_FOR_NEXT_CHECKPOINT` only when scoped code/build/static checks and architectural preconditions are sound; keep `FEATURE_NOT_VERIFIED` and/or `VISUAL_NOT_VERIFIED` if no behavioral proof. `BLOCKED_WITH_EVIDENCE`/`BLOCKED_DEPENDENCY` for genuine blockers; never fabricate acceptance.

## Architecture guardrails — bắt buộc, không trade-off để đạt PASS

| Domain | Canonical owner / prohibited bypass |
|---|---|
| L1 `@rpg/core/kernel` / L2 `@rpg/gameplay` | Read-only, giữ pinned upstream; không modify/deep import, không copy business formulas. |
| L3 `runtime-engine` | Game-specific Player/Monster/Item/Skill, state, AI, targeting, spawn, gameplay movement và presentation intent. Phase 8 **không** thêm gameplay policy tại Render hoặc sửa Engine. |
| L4 `editor` | Authored `SceneDefinition`/`SceneMembership`, `AssetCatalog`, authored spatial placement, document state, preview orchestration. Chỉ adapt sang neutral Render public API; không tự vẽ hoặc import `three`. |
| L4 `runtime-render` | **Duy nhất** owns live visual scenes/instances, presentation transforms, layer/order/depth comparator, private Three backend, draw submission, render-owned resource usage. Reuse Phase 4/6/7 public contracts, không clone code math/loader. |
| L4 `game-client` | Client host/UI, canvas, provider, presentation adapter; dùng Render public root, **không import Editor**. |
| L4 `game-server` | Không thêm GPU/DOM/render deps; không lấy frame state làm gameplay authority. |

- **Authored Scene ≠ Runtime Visual Scene ≠ private THREE.Scene ≠ Gameplay World.** Không serialize Render handles/GPU resources hoặc làm authoring Editor phụ thuộc live scene.
- **Asset ID ≠ authored Object ID ≠ Visual Instance ID ≠ Render Session ID ≠ Gameplay Entity ID.** Correlation là optional presentation mapping, không authoritative gameplay identity.
- **Asset catalog/descriptor ≠ source bytes ≠ decoded image ≠ loaded texture lease ≠ visual instance.** Resource load/release chỉ bởi Phase 7; scene instance không tự `fetch`, parse TPSheet, decode PNG hay lập texture cache mới.
- **Spatial contracts Phase 4** là nguồn transform/anchor/unit/axis/projection math; Scene Rendering không tự suy screen Y là world depth, không cast Editor placement thành Three coordinates thiếu context.
- **Graphics context/viewport/frame Phase 6** là nguồn lifecycle/resize/suspend/scheduler; Scene Rendering không tự tạo renderer/canvas, RAF/interval, camera controller. Additive integration phải giữ semantics `renderFrame` và existing binding-only sessions.
- Live instance operations phải bảo toàn identity khi update; hidden ≠ removed ≠ disposed. Shared resource lease release per consumer, no cross-context GPU sharing claim.
- Scene visual ordering có explicit layer priority, sorting policy và deterministic ties; alpha limitations rõ. Không hardcode gameplay role classes `PlayerVisual`/`MonsterVisual`/`SkillVisual` làm canonical instances.
- Không thêm workspace thứ sáu (`common/shared`), ECS architecture, global SceneRegistry, UI/Map Editor, Phase 9 Camera Controller, Phase 10 Sprite Animation hay Phase 11 VFX playback.

## Required preflight — thực hiện trước mọi checkpoint, kể cả sau khi task đã viết sẵn

1. Đọc `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, `harness/{CONTRACTS,OWNERSHIP,WORKFLOW,VERIFICATION,FAILURES}.md`, `runtime-render/AGENTS.md`, `editor/AGENTS.md`, `game-client/AGENTS.md`; kiểm tra `git status`, exact HEAD/base/PR, commit trước, source diff, ownership scanner và compiler configurations. Không chỉnh trên dirty/unexpected checkout khi chưa giải trình.
2. Audit public roots/manifests/declarations và *implementation thật* của `runtime-render/src/{index,frame-session,three-frame,visual-resource,planar-transform,visual-alignment}.ts` (hoặc đường dẫn mới); Editor `scene-visual.ts`, `scene-membership.ts`, `scene-visual-alignment.ts`, `asset-visual.ts`, Document integration; Client host. Không giả định filenames hiện tại luôn còn.
3. **Dependency gate:** Phase 6 viewport/frame session phải có real implementation phù hợp; Phase 7 phải có **verified actual API** cho loaded texture/frame resource ownership và release. Chỉ roadmap `.md`, promise `ready`, `metadata-prepared`, hoặc future PR không thỏa. Nếu thiếu dependency trọng yếu: `BLOCKED_DEPENDENCY` với commit, signatures, missing public capability; không tự tạo second implementation. Chỉ bắt đầu task Phase 8 khi integration baseline hợp lệ và được quy trình Git cho phép.
4. Đối chiếu Three.js version thực sự trong lockfile/source với official API; không đổi phiên bản hoặc expose native internals để né integration. Kiểm tra PNG/atlas sample có quyền dùng; nếu TPSheet chưa được chứng minh hỗ trợ, phải ghi `TPSHEET_NOT_VERIFIED`, không tự giả định JSON có đuôi `.tpsheet`.
5. Liệt kê **API delta nhỏ nhất chỉ của version này** cùng consumer bị ảnh hưởng, decision về status/capabilities, failure ownership và rollback/release. Không restructure shared foundations hoặc sửa checkpoint lịch sử cho thuận tiện.

## Continuous execution — developer review sau MVP/closure

- Một phase **một branch `feat/scene-rendering-v0.8` (đề xuất), một PR**. Mỗi version đúng **một `.md` độc lập, một scoped commit và một report `harness/checkpoints/scene-rendering-v0.8.VERSION.md`** (thay `VERSION` bằng patch thật). Không gom code của milestone kế vào checkpoint đang làm.
- Sau check/build/report/commit hợp lệ, **tự tiếp tục task version kế** trên cùng PR **không chờ Developer review trung gian**. Reviewer có thể review toàn bộ sau MVP/closure; việc tiếp tục không đồng nghĩa previous feature đã được verified hoặc Developer chấp thuận retrospectively.
- **STOP & ESCALATE** khi cần sửa L1/L2/Engine ownership, thay dependency direction, breaking public contract không có phê duyệt, tạo alternate renderer/cache, thiếu Phase 6/7 prerequisite, silent loss/use-after-release, hoặc scope creep bắt buộc. Đưa exact reproduction/source evidence + minimal options; không rewrite/private-deep-import/copy-paste để vượt blocker.
- Nếu chỉ chưa có manual browser observation: tiếp tục các checkpoint hợp lệ với `VISUAL_NOT_VERIFIED` (không tự claim rendering passed); nhưng không đóng core MVP như VERIFIED nếu thiếu proof. Unknown TPSheet parsing chưa đủ basis cũng phải giữ truthful status.
- Không tự merge/tag/release/publish hoặc chỉnh `main`/PR khác. Nếu source drift so với assumptions, audit và cập nhật proposal nhỏ theo architecture; không tự mở một hệ thống thứ hai.

## Verification & reports — BUILD ONLY policy

Với Render + Editor + Client impacted, kiểm tra flags thực trong `harness/cli.mjs` trước khi chạy:

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers
npm run build -- --force
```

- Real TypeScript/package-root consumer builds, static architecture checks, clean Git diff; **không thêm unit/integration/E2E/UI/Playwright/snapshot suites**, fixtures-as-tests, fake scripts, coverage, CI runtime screenshot assertions hoặc extra test deps. Manual example/demo với tài nguyên thật được phép và phải phân biệt evidence.
- `ARCH_CHECK_PASS` chỉ là static import check. `BUILD_PASS` chỉ chứng minh compile. `FRAME_SUBMITTED` không phải `VISUAL_PASS`; missing observation ghi `FEATURE_NOT_VERIFIED`/`VISUAL_NOT_VERIFIED`. No GPU leak-free claims từ một run ngắn. Không khai báo PASS khi lệnh chưa chạy/CI chưa về.
- Checkpoint report có: exact preflight HEAD/branch, file delta và owner, public API diff, decisions/rejected alternatives, command+exit status, CI URL đúng SHA nếu có, reproducible manual observations nếu đã làm, unsupported cases/evidence gaps, next milestone readiness và STOP blockers. Report version độc lập cho phép audit cumulative PR về sau.

## References / source orientation (không coi task là code hiện tại)

- Repo: https://github.com/TjnhPro/rpg-platform ; Render public root `@rpg-platform/runtime-render` ; Editor public root `@rpg-platform/editor` ; Client `@rpg-platform/game-client`.
- Source inspected while drafting (2026-10-23): `main` `8aee145e7272dcccff3f20b9be4c70b63ec27b43`; PR #6 `feat/render-context-viewport-v0.6` HEAD lúc kiểm tra `1ee69d53e6b51a92df087806b3a50c395c2e4665` (OPEN). No Phase 7 PR/merged implementation confirmed at that point. **Re-audit**, don't use this SHA as future guaranteed baseline.
- Existing Editor Phase 3 `describeSceneObjectVisual()` projects correlation+placement, image descriptor; it allocates **no** live instance. Existing Phase 4 Render planar transform/alignment can be reused. `prepareVisualResource()` from Phase 2 is **metadata-only**, not loaded image/texture. Phase 7 actual implementation must be independently verified.
- Godot CanvasItem y-sort/Z-index: https://docs.godotengine.org/en/stable/classes/class_canvasitem.html ; Unity 2D sorting: https://docs.unity3d.com/Manual/2DSorting.html ; Three.js Object3D renderOrder/transparent groups: https://threejs.org/docs/#api/en/core/Object3D and https://threejs.org/docs/#api/en/renderers/WebGLRenderer . Adapt concepts, don't copy their object trees.

## Handoff

After v0.8.7 is scoped, reported, checked and committed, continue with **v0.8.8** automatically when dependencies remain valid. Do not implement the next version inside this commit. Whole-phase Developer review at MVP/closure; **no automatic merge/release**.
