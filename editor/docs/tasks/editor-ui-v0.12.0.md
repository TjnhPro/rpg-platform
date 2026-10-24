# Task v0.12.0 — Editor UI Architecture & Foundation Contracts

> **TASK GIAO CHO CODING AGENT — PHASE 12 / EDITOR UI FOUNDATION**
> Mục tiêu: Foundation thống nhất, UI chỉ thuộc L4 Editor, không để agent tự đi ra các layer/production project khác. Task có thể giao độc lập nhưng PHẢI kiểm tra checkpoint và source HEAD hiện hành; không giả định dependency đã có chỉ vì roadmap nói vậy.

**Baseline đã kiểm tra khi soạn (2026-10-23):** `editor/package.json` chỉ có `tsc -b --force`, dependencies `@rpg-platform/runtime-engine` và `@rpg-platform/runtime-render`; `editor/tsconfig.json` include `src/**/*.ts`, chưa chứa TSX; các browser MVP hiện dùng HTML manual; `editor/src/viewport-host.ts` sở hữu DOM/canvas lifecycle theo Render root API. Phase 12 chỉ bắt đầu trên baseline sau Phase 11 được Developer chỉ định. **Re-audit HEAD trước khi code; không pin/copy các quan sát lịch sử như thể là sự thật vĩnh viễn.**

## Mục tiêu duy nhất

Khóa **một UI path hợp lệ** cho Editor trước khi agent tạo React components: UI ứng dụng nội bộ `editor/ui`, sử dụng React+Mantine, không thay `@rpg-platform/editor` public business API; theme/component/layout policies là contract mà mọi screen sau tuân theo.

## Điều kiện đầu vào / dependency

Chạy sau Phase 11 theo Developer instruction. Chưa có UI Foundation thực thi; v0.12.0 chỉ khóa contract.

## Phạm vi file có thể thay đổi (đúng task này)

Chỉ tài liệu `editor/docs/ui-foundation-contract.md`, `editor/docs/ui-styling-policy.md` (khởi tạo các quyết định chưa cần implementation), `editor/docs/tasks/editor-ui-v0.12.0.md` và checkpoint Harness. **Không cài dependency, không viết TSX/CSS ở v0.12.0.**

## Ranh giới bất biến — áp dụng cho task này

- **Canonical production owner duy nhất: `editor/`.** Không sửa code, manifest, tests, docs nghiệp vụ của `runtime-engine/`, `runtime-render/`, `game-client/`, `game-server/`, `rpg_core/`, `rpg_gameplay/` hay các repo L1/L2. Không tạo workspace/package thứ sáu.
- **Allowed by default:** `editor/ui/**` (React application nội bộ), các file `editor/package.json`, `editor/tsconfig*.json`, `editor/scripts/**`, `editor/docs/ui-*.md`, `editor/docs/tasks/**`, `editor/AGENTS.md` khi đúng scope task; báo cáo `harness/checkpoints/editor-ui-v0.12.0.md`. Chỉ `package-lock.json` ở root được đổi nếu dependency Editor thực sự yêu cầu; **không** tùy tiện sửa root `package.json`, CI, `harness/cli.mjs`, `harness/config.json` hoặc kiến trúc project. Danh sách này là trần phạm vi, KHÔNG phải cho phép sửa mọi file ở mọi task; mục **Phạm vi thay đổi** bên dưới giới hạn hẹp hơn.
- Giữ nguyên package public `@rpg-platform/editor` và `editor/src/index.ts`, schema/semantics của Asset, Scene, Document, Runtime và Render. UI mới tiêu thụ APIs hiện hữu; **không** viết lại API nghiệp vụ, viewport renderer hoặc resource manager.
- Một UI stack duy nhất: **React + Mantine Core**, trong cùng workspace `editor`; không thêm MUI, Ant Design, Chakra, shadcn/ui, Tailwind, Bootstrap, styled-components hay tự viết bộ Button/Input/Panel cạnh tranh Mantine.
- CSS token/theme/components phải thuộc Editor UI Foundation, không rải màu/kích thước/spacing tùy ý. `canvas` chỉ là host-owned browser element; Render vẫn sở hữu GPU, viewport, rendering và frame submissions.
- Không tự thêm test/unit/E2E/Playwright/snapshot/visual regression runner. Project chỉ chấp nhận architecture checks, builds và manual runtime evidence; **build PASS không phải UI/VISUAL PASS**.
- Phase 12 là UI Foundation, **không** triển khai Asset Manager, Scene Editor, VFX Designer, Animation Designer, gameplay, backend, persistence hay toàn bộ screen nghiệp vụ. Có thể dùng dữ liệu minh họa UI được dán nhãn; không ngụy tạo dữ liệu từ Engine/Render.
- Không mở rộng scope do gặp thiếu dependency/API. Nếu chạm ranh giới Runtime Render hoặc public business contracts, báo `BLOCKED_WITH_EVIDENCE`: API cần, source hiện có, repro và phương án owner đúng. Không triển khai workaround ở Editor.

## Contracts bắt buộc — phải giữ được cả khi implementation thay đổi

Định nghĩa rõ:
- UI application/internal host khác với portable Editor domain/public package root. Runtime Render chỉ được dùng qua public root; React component không import deep private files của project khác.
- Cấu trúc dự kiến: `editor/ui/src/app`, `theme`, `components`, `layout`, `viewport`, `styles` và `editor/ui/index.html`; không tạo `@rpg-platform/ui` hay `shared` package.
- Rule ưu tiên: Mantine control → theme defaults → composition/layout → CSS Modules có lý do; cấm tự tạo control/panel tương đương bằng CSS.
- Theme default dark một lần, kích thước controls mặc định `sm`, typography/spacing/radius từ Mantine tokens; semantic tokens, không màu/px phân tán.
- Standard app regions: header, toolbar, left navigator, central viewport, right inspector, bottom status. Đây là shell slots, không phải Scene/Asset feature implementation.
- CSS exception policy: chỉ structural/layout/canvas styles trong được phê duyệt; không cho phép agent tự khai ngoại lệ để vượt checker.
- UI enforcement phải chạy khi build Editor, không phải một CLI tùy chọn; không cần runtime/plugin ngoài Electron hay server.
- Chỉ UI workspace preferences tạm trong React state; không lưu vào authored Document / Runtime state.

## Nội dung triển khai cụ thể

- Audit real editor source, package graph và baseline; đánh dấu giới hạn HTML legacy demos — không retroactively rewrite manual pages.
- Viết một contract ngắn nhưng **định danh từng quyết định**: ownership, source locations, dependency constraints, component rules, styling hierarchy, layout slots, viewport boundary, accessibility, build/verification contract và exception escalation.
- Xác định scope từng checkpoint kế tiếp; không chốt gameplay schema, data model, actual Scene Inspector logic, docking implementation.
- Đảm bảo contract đủ cụ thể để v0.12.5 có thể enforce phần máy kiểm tra được, không viết chính sách mơ hồ “nên thống nhất”.

## Acceptance criteria — không chỉ build PASS

- Document chỉ ra đường hợp lệ để thêm Button/Input/Panel, nêu rõ khi nào cần/sẽ không cần CSS.
- Có decision table `allowed/disallowed/needs Developer approval` cho DOM controls, CSS selectors, dependencies, cross-project imports.
- Một ví dụ luồng `React host → existing editor viewport host → @rpg-platform/runtime-render` không tạo bridge mới.
- Documentation-only checkpoint: không khai báo React app đã chạy, không có UI_PASS; branch/PR/checkpoint ghi rõ.

## Forbidden shortcuts riêng của task

Cấm v0.12.0 cài React/Mantine, dựng shell, tạo component, thay package exports, sửa Render, thêm lint/tests/CI.

## Quy trình bắt buộc cho checkpoint

1. Trước khi sửa: đọc `AGENTS.md`, `ARCHITECTURE.md`, `editor/AGENTS.md`, `harness/OWNERSHIP.md`, `harness/WORKFLOW.md`, `harness/VERIFICATION.md`, `editor/package.json`, `editor/tsconfig.json`; kiểm tra source thật và branch/PR hiện tại. Ghi preflight **feature → one canonical owner → source/API reused → allowed paths → expected build**. Không tin phiên bản giả định từ task nếu HEAD đã thay đổi.
2. Dùng **một branch Phase 12, một PR**, checkpoint theo thứ tự `v0.12.0` → `v0.12.10`. **Một task = một capability = một checkpoint commit**; không gom và không triển khai sớm task kế tiếp. Tiếp tục checkpoint tiếp theo nếu gate của task đã đủ; Developer review/acceptance ở cuối phase, trừ blocker hoặc public/architecture decision khó đảo ngược chưa được ủy quyền.
3. Scope diff bằng `git diff --name-only` và bảo đảm **zero cross-project production delta**. Root lockfile delta, nếu có, chỉ phục vụ Editor dependencies. Không coi thay `editor/AGENTS.md` là cách hợp thức hóa việc phá rules.
4. Chạy `node harness/cli.mjs check`, `node harness/cli.mjs scope --projects editor --allow-infra` khi phù hợp, và `node harness/cli.mjs verify --projects editor`. Nếu thay public API (đáng lẽ không cần), **DỪNG** báo Developer trước thay đổi; sau khi được phép phải thêm `--with-consumers`. Từ checkpoint có UI build, chạy cả `npm run ui:build --workspace @rpg-platform/editor` nếu script tồn tại và build này chưa nằm trong verify; kết quả thật, không echo giả.
5. Báo `IMPLEMENTED`, public contract delta (mong đợi **none**), changed files, actual gates, manual observations, `FEATURE_NOT_VERIFIED`/`VISUAL_NOT_VERIFIED`, blocker. Commit một checkpoint và giữ worktree sạch; không gắn `MVP_PASS`/`READY_TO_MERGE` nếu thiếu bằng chứng.

## Handoff cho checkpoint tiếp theo

Ghi đúng public APIs đã tiêu thụ, các API thiếu, outstanding UI/visual observations và file paths thực tế. Không tự đổi thứ tự checkpoint. Nếu cần điều chỉnh UI contract đã khóa, mở một đề xuất delta nhỏ với concrete evidence và Developer approval trước khi triển khai; **không** âm thầm thêm CSS/logic ngoài chuẩn chỉ để task tiếp theo chạy được.
