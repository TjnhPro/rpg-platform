# TASK — RPG Platform v0.7.14: Visual Resource Loading Integration & MVP Closure

**Phase:** 7 / 20 — Visual Resource Loading
**Version:** `v0.7.14` · Milestone 15/15 · Feature IDs: **VL20**
**Primary owner:** `runtime-render`
**Collaborators:** editor + game-client consumer review; Harness audit; Developer final decision
**Repository:** https://github.com/TjnhPro/rpg-platform
**Delivery:** 1 phase/1 branch/1 PR; one version = one commit + report; continuous checkpoint execution, whole-phase Developer review at MVP/closure.

## Objective và accepted scope chỉ của v0.7.14

Tổng kiểm toàn Phase 7 bằng source/API/CI/consumer/manual evidence, không thêm production feature tại closure, không tự merge hay tự tuyên bố accepted.

- **Input:** `v0.7.13` (hoặc public baseline thực tế tương đương đã được audit). Version trước phải có commit/checkpoint và build check minh bạch trước khi tiếp tục.
- **Output:** scoped code/contract/docs đúng chức năng bên dưới và báo cáo commit riêng; không gộp `(không có; Developer quyết định next Phase)` vào commit này.
- Mục tiêu này không ngầm phê duyệt release/merge và không cho phép tự tạo subsystem khác để bỏ qua dependency đang thiếu.

## Source & contract audit riêng cho v0.7.14

1. Đọc đầy đủ 15 checkpoint commits/PR diff, project AGENTS, exports/d.ts, manifests/lock, static Harness và sample/runbook; so sánh baseline Phase 6.
2. Audit source ownership: Editor authored catalog, Render loading/cache/texture, Client consumer, L1/L2/Engine/Server unmodified; provider authorization.

## Implementation contract — yêu cầu chính xác

1. Lập VL01–VL20 acceptance matrix với trạng thái `IMPLEMENTED`, `DESIGN_ONLY`, `DEFERRED`, `NOT_VERIFIED`, `BLOCKED` và source/commit/PR evidence tương ứng.
2. Lập public symbol & semantic delta inventory: preserve legacy `prepareVisualResource` and `createRenderFrameSession`; xác nhận không thêm Render→Editor import hay second loader.
3. Kiểm tra source/decoded/GPU cache key, lease/release, context loss/dispose, invalidation, multi-consumer và cross-session failure paths; ghi giới hạn không chứng minh được.
4. Ghi rõ real PNG + atlas evidence và TPSheet-specific parser nếu có. Nếu chưa có sample/spec `.tpsheet`, đánh dấu **TPSHEET_NOT_VERIFIED** chứ không claim Phase 7 đã giải quyết định dạng ấy.
5. Chạy static/build/consumer gates trên exact HEAD, đối chiếu CI exact HEAD sau push; manual runtime/browser evidence không được suy ra từ successful build hoặc submission receipt.
6. Viết final report `READY_FOR_DEVELOPER_REVIEW — v0.7.14` khi đủ điều kiện review, hoặc `BLOCKED_WITH_EVIDENCE` nếu core requirements chưa đạt; không tự merge, tag, release hay publish.

## Acceptance / observable evidence cho v0.7.14

- [ ] Có full-phase PR diff inventory, tất cả 15 commits, public compatibility/architecture matrix, exact HEAD build results, manual evidence và remaining limitations.
- [ ] Mọi mục thiếu được ghi đúng tình trạng thay vì sửa lấp tại closure hoặc ép trạng thái pass.
- [ ] Developer quyết định acceptance/merge/next phase; `READY_FOR_DEVELOPER_REVIEW` không phải `ACCEPTED`.

### Exclusions / STOP guard tại checkpoint

- **Không:** Không thêm API, parser, texture pipeline mới, test suite hoặc source migration ở v0.7.14.
- **Không:** Không che thiếu ảnh/TPSheet/visual proof bằng CI xanh.

**Checkpoint status:** ghi `READY_FOR_NEXT_CHECKPOINT` nếu build/static gates hợp lệ và không có blocker architecture; nếu hành vi chưa kiểm chứng, **vẫn** ghi `FEATURE_NOT_VERIFIED`/`VISUAL_NOT_VERIFIED`. Không dùng từ `FUNCTION_PASS` nếu chỉ compile. Nếu blocker thật: `BLOCKED_WITH_EVIDENCE`, không tự đổi kiến trúc.

## Architectural invariants — không được phá để hoàn thành milestone

| Boundary | Quyết định bắt buộc |
| --- | --- |
| L1 `@rpg/core/kernel`, L2 `@rpg/gameplay` | Read-only; không sửa, không thêm deep imports, không copy/định nghĩa lại gameplay logic. |
| L3 `runtime-engine` | Sở hữu game-specific rules/HP/AI/skill/projectile logic; **không** xử lý PNG decode, atlas parsing, texture caching, frame-render time. Không sửa trong Phase 7. |
| L4 `editor` | Sở hữu Asset ID/catalog/references, authored content và document dirty state; cung cấp host-authorized provider/preview; không nhập `three` hoặc chứa loader/cache cạnh tranh. |
| L4 `runtime-render` | Canonical owner duy nhất của visual decoding coordination, normalized atlas/frame interpretation, GPU texture/caches, resource lifetime/diagnostics và graphics session private backend. |
| L4 `game-client` | Host provider, graphics viewport và consumer theo public Render APIs; không phụ thuộc Editor hay tự xây decoder/texture manager. |
| L4 `game-server` | Không sửa/không cần canvas, WebGL, GPU, image decoder; không lấy Render làm authority gameplay. |

- **Asset Definition ≠ VisualResourceDescriptor ≠ Source Bytes ≠ Decoded Image ≠ GPU Texture ≠ Frame Reference ≠ Runtime Visual Instance**. Các identity/lifecycle không thay thế lẫn nhau.
- **Authored `AssetReference.subresourceId` là opaque text** từ Phase 2; Phase 2 `resolveAssetReference` hiện không xác minh frame. Phase 7 chỉ resolve *visual subresources* khi đã có atlas thật trong Render; không đổi ngầm logic của Editor resolver.
- `prepareVisualResource()` hiện là synchronous metadata-only operation và trả `resourceLoading: 'NOT_PERFORMED'`; **giữ y như vậy**, bổ sung loader entrypoint riêng khi có real consumer.
- **Host-owned authorized locator ≠ URL/network permission.** Render không tự gán project root, `fetch(path)` hoặc filesystem access vì có relative path. Provider thực thi quyền đọc và realpath/containment khi cần.
- **Resource cache không phải authored asset catalog.** Key không chỉ là filename/Asset ID: phải có provider scope, source revision/invalidation, material decode options; GPU cache thêm graphics context/session.
- **Sharing ≠ shared ownership:** mỗi consumer có lease/quyền sử dụng độc lập. Release một owner không được giải phóng nguồn mà owner khác đang dùng. Decoded CPU image có thể chia sẻ có điều kiện; GPU texture **không mặc nhiên dùng chung qua các WebGL contexts**.
- **Requested ≠ bytes acquired ≠ decoded ≠ GPU-usable ≠ frame submitted ≠ displayed.** Đánh dấu evidence chính xác từng stage, không sinh success giả.
- Không tạo sixth workspace/common package, global renderer/asset singleton, EditorTextureManager, ClientTextureManager, alternate Three renderer, generic plugin loader framework, Scene Renderer, Sprite Animation hay VFX Playback.

## Required preflight — mỗi version phải đọc source, không copy giả định

1. Đọc `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, `harness/CONTRACTS.md`, `OWNERSHIP.md`, `WORKFLOW.md`, `VERIFICATION.md`, `runtime-render/AGENTS.md`, `editor/AGENTS.md`, `game-client/AGENTS.md`; kiểm tra actual `git status`, HEAD, main/branch và PR trước khi sửa. Không sửa khi tree không sạch nếu chưa xử lý rõ.
2. Audit dependency thực từ Phase 1–6 và checkpoint Phase 7 ngay trước: `runtime-render/src/index.ts`, `frame-session.ts`, `three-frame.ts`, `visual-resource.ts`, Editor `asset-visual.ts` và `asset-reference.ts`, `editor/manual`, Client root/host, package exports/manifests/lockfile và emitted declarations. Đường dẫn có thể đổi, tìm implementation thực thay vì giả định file còn nguyên.
3. Liệt kê public symbols/semantics đã tồn tại và **delta duy nhất** version này; version chỉ design có thể không thêm code. Không rewrite API cũ để tiện completion; bất kỳ API break/owner move bắt buộc phải escalate.
4. Xác nhận actual graphics backend/Three version, PNG/atlas source sample và host/provider khả dụng. Phải dựa vào real committed/provided fixtures/spec; **không chế tạo format `.tpsheet`**. Source audit có thể sử dụng official upstream docs/source với version phù hợp, không thay khóa dependencies tùy ý.
5. Nếu Phase 1–6 chưa có đủ contract *bắt buộc cho milestone này* trong **working baseline**, ghi `BLOCKED_DEPENDENCY` kèm đường dẫn/commit; **không tạo Scene/Spatial/Document/Viewport shim khác owner**. Roadmap/task được viết sớm không phải bằng chứng source đã tồn tại.

## Workflow liên tục — một Phase, một PR, từng checkpoint độc lập

- Đề xuất branch `feat/visual-resource-loading-v0.7`, **một PR duy nhất**; chọn base/branch từ kết quả checkout/dependency thực tế và quy trình Git được cho phép, không tự merge PR prerequisite; `v0.7.14` = **một implementable `.md` task + một scoped checkpoint commit**, append report `harness/checkpoints/visual-loading-v0.7.14.md` theo convention repo. Commit không gom v0.7.14+1; sau build/check/commit/push hợp lệ agent có thể chạy version kế **không chờ review từng checkpoint**.
- Không coi checkpoint trước đã được Developer formally accepted chỉ vì đã code tiếp; ghi source/CI/verification status thực tế. **Developer review chức năng sau khi hoàn tất MVP/closure (có thể review tổng hợp về sau)**, không cần duyệt mỗi task version.
- **STOP & ESCALATE** chỉ khi thiếu dependency bắt buộc, cần đổi canonical owner/import direction, thay đổi public breaking API, thay L1/L2, tự tạo graphics/loader cạnh tranh, input file thật không cho phép thực hiện acceptance mà không fabricate, hoặc nguy cơ mất content/resource lớn không xử lý được trong approved scope. Báo reproduction/source evidence + options nhỏ, không tự vòng sang kiến trúc khác.
- Nếu chỉ thiếu browser/manual observation tại một checkpoint giữa: báo `VISUAL_NOT_VERIFIED` và tiếp tục đúng scope khi không ảnh hưởng correctness. Nếu TPSheet sample thiếu, giữ `TPSHEET_NOT_VERIFIED`, tuyệt đối không fake parser support; đưa evidence gap vào MVP/closure. Không gọi `BUILD_PASS` thành functional/visual pass.
- Không tự merge PR, publish, release, đổi base branch hoặc đẩy riêng từng checkpoint thành nhiều PR. Không tạo lịch sử commit giả hoặc claim exact-head CI xanh khi CI chưa có kết quả.

## Verification — BUILD ONLY theo Harness hiện có

Chạy trên checkout thực, project scope tương ứng thay đổi; đối với Render public API change bắt buộc build consumer Editor/Client:

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers
npm run build -- --force
```

- Build phải là thực, không dùng stub/simulated scripts. Nếu command flags khác ở source mới, audit `harness/cli.mjs` và báo đúng lệnh đã chạy.
- Không thêm unit/integration/e2e/UI/Playwright/snapshot tests, assertions suites, coverage hoặc testing dependencies. Cho phép **manual runnable consumer/demo có thể inspect bằng mắt**, sử dụng resource thật và package-root API; demo không được biến thành automated test runner.
- Manual runtime/visual evidence khác BUILD/CI: xác nhận PNG thực decode, sample thật parse, frame được hiển thị thực tế (nếu người kiểm tra thực sự nhìn thấy). `renderFrame` receipt đơn thuần không chứng minh display thành công.
- Report mỗi commit: starting HEAD, changed files/ownership, exact public contract delta, command+exit codes, CI URL nếu có, manual observations nếu đã thực hiện, `FEATURE_NOT_VERIFIED` / `VISUAL_NOT_VERIFIED` / `TPSHEET_NOT_VERIFIED` nếu thích hợp, blocker/known limits. Không claim đo hiệu năng hoặc leak-free tuyệt đối từ một demo ngắn.

## References để audit, không copy nguyên framework

- Three.js disposal: https://threejs.org/manual/pages/how-to-dispose-of-objects.html — Texture phải dispose riêng; ImageBitmap nguồn có CPU lifetime riêng.
- Unity Addressables memory: https://docs.unity.cn/Packages/com.unity.addressables%403.1/manual/memory-assets.html — Reference ownership/release; không sử dụng Unity runtime.
- Godot ResourceLoader cache modes: https://docs.godotengine.org/en/4.5/classes/class_resourceloader.html — Cache reuse vs replace; không copy Godot ResourceLoader/SceneTree.
- Project local baseline: `runtime-render/src/visual-resource.ts`, `runtime-render/src/frame-session.ts`, `runtime-render/src/three-frame.ts`, `editor/src/asset-visual.ts`, `editor/src/asset-reference.ts` theo source đã audit. Đường dẫn này **là context, không phải API guarantee**.

## Closure handoff

- Đây là milestone cuối; không có auto-next-version. Chỉ Developer quyết định merge/phase acceptance/tiếp Phase 8.
- Không đánh đồng `READY_FOR_DEVELOPER_REVIEW` với Phase accepted.
