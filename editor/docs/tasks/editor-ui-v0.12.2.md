# Task v0.12.2 — Unified Theme & Design Tokens

> **TASK GIAO CHO CODING AGENT — PHASE 12 / EDITOR UI FOUNDATION**
> Mục tiêu: Foundation thống nhất, UI chỉ thuộc L4 Editor, không để agent tự đi ra các layer/production project khác. Task có thể giao độc lập nhưng PHẢI kiểm tra checkpoint và source HEAD hiện hành; không giả định dependency đã có chỉ vì roadmap nói vậy.

**Baseline đã kiểm tra khi soạn (2026-10-23):** `editor/package.json` chỉ có `tsc -b --force`, dependencies `@rpg-platform/runtime-engine` và `@rpg-platform/runtime-render`; `editor/tsconfig.json` include `src/**/*.ts`, chưa chứa TSX; các browser MVP hiện dùng HTML manual; `editor/src/viewport-host.ts` sở hữu DOM/canvas lifecycle theo Render root API. Phase 12 chỉ bắt đầu trên baseline sau Phase 11 được Developer chỉ định. **Re-audit HEAD trước khi code; không pin/copy các quan sát lịch sử như thể là sự thật vĩnh viễn.**

## Mục tiêu duy nhất

Xây **một theme source of truth** để các màn hình sau không tự chọn màu, font, spacing và control dimensions.

## Điều kiện đầu vào / dependency

v0.12.1 phải đã có React UI root và MantineProvider; nếu chưa có, không copy UI bootstrap vào task theme.

## Phạm vi file có thể thay đổi (đúng task này)

Chỉ `editor/ui/src/theme/**`, `editor/ui/src/main.tsx` (wire provider), tối thiểu theme-specific doc `editor/docs/ui-foundation-contract.md`, task/checkpoint. Không sửa CSS của legacy manual demos.

## Ranh giới bất biến — áp dụng cho task này

- **Canonical production owner duy nhất: `editor/`.** Không sửa code, manifest, tests, docs nghiệp vụ của `runtime-engine/`, `runtime-render/`, `game-client/`, `game-server/`, `rpg_core/`, `rpg_gameplay/` hay các repo L1/L2. Không tạo workspace/package thứ sáu.
- **Allowed by default:** `editor/ui/**` (React application nội bộ), các file `editor/package.json`, `editor/tsconfig*.json`, `editor/scripts/**`, `editor/docs/ui-*.md`, `editor/docs/tasks/**`, `editor/AGENTS.md` khi đúng scope task; báo cáo `harness/checkpoints/editor-ui-v0.12.2.md`. Chỉ `package-lock.json` ở root được đổi nếu dependency Editor thực sự yêu cầu; **không** tùy tiện sửa root `package.json`, CI, `harness/cli.mjs`, `harness/config.json` hoặc kiến trúc project. Danh sách này là trần phạm vi, KHÔNG phải cho phép sửa mọi file ở mọi task; mục **Phạm vi thay đổi** bên dưới giới hạn hẹp hơn.
- Giữ nguyên package public `@rpg-platform/editor` và `editor/src/index.ts`, schema/semantics của Asset, Scene, Document, Runtime và Render. UI mới tiêu thụ APIs hiện hữu; **không** viết lại API nghiệp vụ, viewport renderer hoặc resource manager.
- Một UI stack duy nhất: **React + Mantine Core**, trong cùng workspace `editor`; không thêm MUI, Ant Design, Chakra, shadcn/ui, Tailwind, Bootstrap, styled-components hay tự viết bộ Button/Input/Panel cạnh tranh Mantine.
- CSS token/theme/components phải thuộc Editor UI Foundation, không rải màu/kích thước/spacing tùy ý. `canvas` chỉ là host-owned browser element; Render vẫn sở hữu GPU, viewport, rendering và frame submissions.
- Không tự thêm test/unit/E2E/Playwright/snapshot/visual regression runner. Project chỉ chấp nhận architecture checks, builds và manual runtime evidence; **build PASS không phải UI/VISUAL PASS**.
- Phase 12 là UI Foundation, **không** triển khai Asset Manager, Scene Editor, VFX Designer, Animation Designer, gameplay, backend, persistence hay toàn bộ screen nghiệp vụ. Có thể dùng dữ liệu minh họa UI được dán nhãn; không ngụy tạo dữ liệu từ Engine/Render.
- Không mở rộng scope do gặp thiếu dependency/API. Nếu chạm ranh giới Runtime Render hoặc public business contracts, báo `BLOCKED_WITH_EVIDENCE`: API cần, source hiện có, repro và phương án owner đúng. Không triển khai workaround ở Editor.

## Contracts bắt buộc — phải giữ được cả khi implementation thay đổi

- `createTheme` + `MantineProvider` dùng một centralized exported `editorTheme`; default editor color scheme **dark** ở MVP; chưa làm user-selectable theme.
- Mọi nơi dùng Mantine semantic tokens: color roles primary/neutral/success/warning/error, foreground/background/surface/border, typography, spacing, radius, breakpoints, control heights. Không tự định nghĩa hệ CSS variables thứ hai tương đương Mantine.
- Defaults: controls `sm` trừ khi một component type có giới hạn API; font `system-ui` hoặc typography hợp lệ qua `theme.fontFamily`; radius/spacing từ theme, không hardcoded per screen.
- Explicit token naming/intent; nếu Mantine theme không có một property đã dự tính, chọn documented override hoặc ghi blocker; không patch Mantine private CSS selectors.
- Theme config không chứa logic business, viewport, resource loading, game state.

## Nội dung triển khai cụ thể

- Xây `theme/index.ts` và `theme/theme.ts` (hoặc cấu trúc tương đương ngắn); mô tả trong docs vai trò các semantic colors, scale sizes và default.
- Wire `MantineProvider` dùng theme này; không thêm wrapper/provider lồng nhau ở screens.
- Một visual sample tối thiểu (Text, Button, TextInput) chỉ để quan sát theme, chưa làm full component showcase v0.12.3.
- Chứng minh một thay đổi theme token kéo theo cả sample controls mà không cần sửa CSS component.

## Acceptance criteria — không chỉ build PASS

- Có một nguồn theme chính và một nơi provider; imports của UI khác dùng theme/Mantine thay vì literal values.
- Default dark thực sự hiển thị khi app mount; fallback không flash light do thiếu colorScheme config (nếu browser verification làm được).
- Baseline Editor API unchanged, UI build/TS check PASS.
- Không khẳng định pixel/color visual PASS nếu chưa quan sát browser.

## Forbidden shortcuts riêng của task

Không thêm “theme editor”, light/dark toggle, CSS global override, branding assets/icons, custom Button/Input/Panel implementations; không sửa Render để chỉnh màu canvas.

## Quy trình bắt buộc cho checkpoint

1. Trước khi sửa: đọc `AGENTS.md`, `ARCHITECTURE.md`, `editor/AGENTS.md`, `harness/OWNERSHIP.md`, `harness/WORKFLOW.md`, `harness/VERIFICATION.md`, `editor/package.json`, `editor/tsconfig.json`; kiểm tra source thật và branch/PR hiện tại. Ghi preflight **feature → one canonical owner → source/API reused → allowed paths → expected build**. Không tin phiên bản giả định từ task nếu HEAD đã thay đổi.
2. Dùng **một branch Phase 12, một PR**, checkpoint theo thứ tự `v0.12.0` → `v0.12.10`. **Một task = một capability = một checkpoint commit**; không gom và không triển khai sớm task kế tiếp. Tiếp tục checkpoint tiếp theo nếu gate của task đã đủ; Developer review/acceptance ở cuối phase, trừ blocker hoặc public/architecture decision khó đảo ngược chưa được ủy quyền.
3. Scope diff bằng `git diff --name-only` và bảo đảm **zero cross-project production delta**. Root lockfile delta, nếu có, chỉ phục vụ Editor dependencies. Không coi thay `editor/AGENTS.md` là cách hợp thức hóa việc phá rules.
4. Chạy `node harness/cli.mjs check`, `node harness/cli.mjs scope --projects editor --allow-infra` khi phù hợp, và `node harness/cli.mjs verify --projects editor`. Nếu thay public API (đáng lẽ không cần), **DỪNG** báo Developer trước thay đổi; sau khi được phép phải thêm `--with-consumers`. Từ checkpoint có UI build, chạy cả `npm run ui:build --workspace @rpg-platform/editor` nếu script tồn tại và build này chưa nằm trong verify; kết quả thật, không echo giả.
5. Báo `IMPLEMENTED`, public contract delta (mong đợi **none**), changed files, actual gates, manual observations, `FEATURE_NOT_VERIFIED`/`VISUAL_NOT_VERIFIED`, blocker. Commit một checkpoint và giữ worktree sạch; không gắn `MVP_PASS`/`READY_TO_MERGE` nếu thiếu bằng chứng.

## Handoff cho checkpoint tiếp theo

Ghi đúng public APIs đã tiêu thụ, các API thiếu, outstanding UI/visual observations và file paths thực tế. Không tự đổi thứ tự checkpoint. Nếu cần điều chỉnh UI contract đã khóa, mở một đề xuất delta nhỏ với concrete evidence và Developer approval trước khi triển khai; **không** âm thầm thêm CSS/logic ngoài chuẩn chỉ để task tiếp theo chạy được.
