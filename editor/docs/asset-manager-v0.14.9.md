# AM10 — one Browser in the existing Shell

Editor UI adds AssetBrowserWorkspace (canonical catalog load/search/select/inspect
and register-existing affordance) and AssetViewport (AM09 content through existing
viewport session). Existing Mantine Panel/theme controls only; no CSS/framework/
dependency/package API changes. Phase5 loads known manifest asset references in
order, closes borrowed load sessions, and AM02 adopts only the complete admitted
set. Explicit loading failure never appears as a partially loaded valid catalog.
Project change clears transient queries/context; unknown category filters stay
empty. Registration is disabled with an honest unavailable message absent a trusted
resource port. Connected ports use AM05; successful candidates remain NOT_COMMITTED.

Developer approved two concrete Phase13 UI deltas in-session: initially optional
active capability sharing, then stable controller lifetime after actual narrow
browser reproduction Create A -> close Navigator -> open Inspector lost the active
session. Final ProjectManagerWorkspace keeps the original state/root/session/
commands above responsive slots and projects its existing panel plus borrowed
capability to App. ProjectManagerPanel remains a compatibility wrapper. App does
not become a second active-project owner. Asset Workspace similarly outlives its
panel view. Shell/Panel/theme/CSS and portable Phase13 APIs remain unchanged.

Viewport React wrapper adds only optional contentFactory, forwarded to existing
mountEditorViewport hook; no change to canonical viewport-host source, session,
DPR/camera/scheduling implementation. Feature owns preview scene/cache/controller
rights and releases before context change/unmount. Source host integration belongs
AM11. Old guidance that viewport contains no Scene now needs contextual wording
when feature content is connected; no visible pixels are asserted by the UI.

Actual check/scope/verify exit0, architecture220/UI13/3 zero errors/manual warnings,
TS/Vite. Earlier checks correctly rejected literal font weight and React DPR read;
fixed using Mantine Title and the host's default DPR argument, without checker edits.
Existing chunk/DEP0190 warnings. Finite browser manual narrow flow after fix:
Create A -> close Navigator -> open Inspector retained Project game-a, 0 matches,
not-selected Inspector, and disabled Register/preview because the Phase13-only
host cannot authorize resource access. No full browse/PNG/storage MVP claim yet.
AM09 carries independent supported PNG/unsupported Item/cleanup evidence. No tests.
