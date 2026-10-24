# AP02 — v0.18.1

Parent391972a65d0ba712aca03bf6f25fc348b98fce88; feat/animation-vfx-preview-v0.18.
[Task](../../editor/docs/tasks/phase18-animation-vfx-preview/rpg-platform-v0.18.1-project-bound-preview-context-task.md).
Audited previous checkpoint/status and actual Project/Asset selection/source scope.
Editor-local animation-vfx-preview-context only; no public-root exports, IO or
borrowed owner disposal. Exact owner/root/provider/project/catalog/generation and
selection checked before publication. Issued tickets and registered owned releases
retire on selection/context disposal; host must dispose on active binding change.
Observed check268/scope2/Editor consumer build incl UI TS/Vite exit0. Existing
chunk/DEP0190 warnings only. Finite local probe exit0: independent a/b same assetId
and path; late A ticket rejected after disposal, release1, B scope remains b;
foreign grant wrong-project, absent grant unavailable, text unsupported, null
not-selected. Project revision/dirty unchanged; no source read attempted.
UI/PIXELS/RESOURCE_NOT_VERIFIED. No generated tests. Next v0.18.2.
